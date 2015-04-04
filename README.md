# nodefhem_mqtt


###Current features:

Forwarding FHEM Events to MQTT-Broker

###How to start:
- Prerequirements: Working MQTT Infrastructure (mosquitto, Node-red.....)
1. Get nodeJS - https://nodejs.org/download/
2. Install necessary module(s) - npm install -g mqtt - (https://www.npmjs.com/package/mqtt)
3. Edit settings in code
4. Run it

If you like to start the forwarder at startup (incl. logging, etc.) - take a look at pm2 -> https://github.com/Unitech/pm2