/* Includes */
const fs = require('fs')

if(!__dirname.includes("YTPPlusCLI")) {
	if(fs.existsSync(__dirname + "/YTPPlusCLI"))
		process.chdir(__dirname + "/YTPPlusCLI");
}

/* Change directory to YTPPlusCLI if we're not in it already */
const argv = require('minimist')(process.argv.slice(2)), //Used elsewhere too
	cwd = (argv.cwd ? argv.cwd : __dirname);

const figlet = require('figlet'),
	prompts = require("./prompts"),
	package = JSON.parse(fs.readFileSync(__dirname+"/package.json", {encoding:"utf-8"})),
	generator = require("./generator"),
	version = fs.readFileSync(__dirname+"/version.txt", {encoding:"utf-8"}),
	plugins = (argv.plugintest ? [argv.plugintest] : (argv.plugins ? fs.readFileSync(argv.plugins, {encoding:"utf-8"}).split("\r\n") : fs.readdirSync(__dirname+"/plugins"))),
	global = require("./global"),
	networking = require('./networking');

/* Single-use parameters */
if(argv.getplugins) {
	if(argv.pluginoutput) {
		fs.writeFileSync(argv.pluginoutput,plugins.join("\n"));
	} else {
		console.log(plugins.join("\n"));
	}
	process.exit(0);
} else if(argv.version) {
	console.log(version);
	process.exit(0);
}
/* Title */
if(!argv.silent)
	console.log(figlet.textSync('ytp+ cli', { horizontalLayout: 'full' }) + "\n" + package.homepage + " v" + version + "\nThis software is licensed under the GNU General Public License Version 3.0.");
/* Errors and warnings */
if(!fs.existsSync(__dirname+"/shared")) {
	console.log("No shared directory found!\nThe 'shared' directory has been created in "+__dirname);
	fs.mkdirSync(__dirname+"/shared")
}
if(!fs.existsSync(__dirname+"/shared/temp")) {
	fs.mkdirSync(__dirname+"/shared/temp");
}
/* Prompts */
const run = async () => {
	if(argv.silent) {
		argv.skip = true;
		argv.debug = false
	}
	if(argv.skip) {
		/* Merge defaults */
		var results = global.defaults;
		let key;
		for(key in argv)
			results[key] = argv[key];
		return results;
	} else {
		var results = await prompts.askYTP(argv);
		if(results.usetransitions == true) {
			var results2 = await prompts.askTransitions(argv);
			results.transitions = results2.transitions; //merging
		}
		return results;
	}
};

function ytp() {
	ytp = null //in case it does get call again - TODO: does this even work?
	run().then((results) => {
		if(argv.debug) {
			results.debug = argv.debug
			console.log(results)
		} else {
			results.debug = false
		}
		networking.action("log","initializing...", results.debug)
		if(!argv.silent)
			console.log("Plugins:\n--------\n"+plugins.join("\n")+"\n--------")
		results.plugins = plugins
		results.plugintest = argv.plugintest
		generator(results, networking);
	})
}

networking.hub.subscribe({
	channel: networking.ch,
	callback: (data) => {
		//console.log('callback', data);
		/*if(data.action == "ping" && data.timestamp && from)
			console.log("["+data.timestamp+"] Recieved '"+action+"' from '"+from+"'!")*/
	},
	subscribedCallback: (socket) => {
		//console.log('subscribedCallback (got socket)');
		return ytp()
	},
	errorCallback: (err) => {
		//console.log('error callback', err);
		//process.exit(1);
		return ytp()
	}
});
