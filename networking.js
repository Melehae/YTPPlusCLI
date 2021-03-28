const noobhub = require('./lib/noobhub-client');
const hub = noobhub.new({ server: "localhost", port: 1737 });
const myName = "ytppluscli";
module.exports = {
    myName: myName,
    ch: 'ytpplus',
    hub: hub,
    action: function(action, message, debug) {
        var ts = Math.round(Date.now() / 1000)
        if(debug == true)
          console.log("\n[ NETWORK - #"+ts+" ] "+message)
        hub.publish({ timestamp: ts,  action: action, from: myName, data: message});
    }
}
