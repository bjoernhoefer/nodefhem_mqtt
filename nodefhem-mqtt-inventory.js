var http = require("http");
var mqtt = require('mqtt');

// local setting - YOU SHOULD EDIT THIS PART

var fhem_server = "127.0.0.1"
var fhem_user = "myuser"
var fhem_password = "mypassword"
var fhem_telnet_port = "1234"
var fhem_http_port = "4321"

var mqtt_broker = "127.0.0.1"
var mqtt_port = 1833
var mqtt_topic = "fhem"

// local settings end - YOU SHOULD STOP EDITING HERE - except you know what you do ;-)



function fhem_query(res){
    state = '';
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
	state += (chunk);
    });
    
    res.on('end', function(){
	var mqtt_client = mqtt.connect('mqtt://'+mqtt_broker)
	fhem_data_json = JSON.parse(state)
	fhem_data = fhem_data_json.Results;
	fhem_data.forEach(function loop1(element, index, array) {
	    fhem_type = fhem_data[index].list
	    fhem_data[index].devices.forEach(function loop2(element2, index2, array2){
		devicename = fhem_data[index].devices[index2].NAME
		fhem_state = fhem_data[index].devices[index2].STATE
		fhem_serialNr = fhem_data[index].devices[index2].ATTR.serialNr
		fhem_alias = fhem_data[index].devices[index2].ATTR.alias
		fhem_room = fhem_data[index].devices[index2].ATTR.room
		fhem_model = fhem_data[index].devices[index2].ATTR.model
		webcmds_raw = fhem_data[index].devices[index2].ATTR.webcmds
		
		if (webcmds_raw != undefined) {
		    webcmds = webcmds_raw.split(":")
		}
		else{
		    webcmds = "NA"
		}
		
		
		if (fhem_state == "???"){
		    fhem_state="NO STATUS";
		}
		
		if (fhem_alias == undefined){
		    fhem_alias="No Alias";
		}
		
		var data = { device: devicename, state: fhem_state, serial: fhem_serialNr, type: fhem_type, alias: fhem_alias, room: fhem_room, model: fhem_model, commands: webcmds};
		mqtt_client.publish(mqtt_topic+"/"+fhem_type, JSON.stringify(data))
	    });
	});
	mqtt_client.end();
    });
}


var http_options = {
    hostname: fhem_server,
    port: fhem_http_port,
    auth: fhem_user+":"+fhem_password,
    path: '/fhem?cmd=jsonlist&XHR=1'
};
http.get(http_options, fhem_query).end();


