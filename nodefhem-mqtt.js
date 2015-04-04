var net = require('net');
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

var mqtt_client = mqtt.connect('mqtt://'+mqtt_broker)

function start_client(){
    client = new net.Socket();
    connected = true
    client.setEncoding('utf8');
    
    // Connect via telnet to FHEM Server and start inform to get notified by a device-changes
    client.connect(fhem_telnet_port, fhem_server, function() {
        client.write('inform on\n');
    });
    
    client.on('data', function(data) {
        // Just get the first part (devicename) from the inform
        data_split = data.split(" ");
        get_fhem_data(data_split[1])
        
    })
    
    client.on('error', function(err) {
	console.log("Error: Telnet connection error")
    })
    
    client.on('end', function(){
        console.log("Error: Telnet connection ended")
    })
    
    client.on('close', function(){
        console.log("Error: Telnet Connection closed");
        client.destroy();
        restart_client()
    })
    
}

function restart_client(){
    setTimeout(start_client, 5000)
}

function get_fhem_data(devicename){
    var str = '';
    var fhem_device_json = {
	hostname: fhem_server,
	port: fhem_http_port,
	auth: fhem_user+":"+fhem_password,
        path: '/fhem?cmd=jsonlist+'+devicename+'&XHR=1',
        method: 'GET'
    };
    
    var callback = function(response) {
        response.on('data', function (chunk) {
            str += chunk
            
        });
	
	response.on('error', function(){
	    console.log("An error occoured - FHEM Query devices - Client error - "+__filename)
	})
	
        response.on('end', function() {
            fhem_data = JSON.parse(str)
            fhem_state = fhem_data.ResultSet.Results.STATE;
            fhem_serialNr = fhem_data.ResultSet.Results.DEF;
            fhem_alias = fhem_data.ResultSet.Results.ATTRIBUTES.alias;
            fhem_type = fhem_data.ResultSet.Results.TYPE;
            fhem_room = fhem_data.ResultSet.Results.ATTRIBUTES.room;
	    fhem_model = fhem_data.ResultSet.Results.ATTRIBUTES.model;
	    fhem_modelreadings = fhem_data.ResultSet.Results.READINGS;
	    
	    // Change values to better view them in JSON   
	    
	    if (fhem_data.ResultSet.Results.ATTRIBUTES.webCmd != undefined) {
		webcmds_raw = fhem_data.ResultSet.Results.ATTRIBUTES.webCmd;
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
	    
            //console.log(devicename)
	    mqtt_client.publish(mqtt_topic, JSON.stringify(data))
	    
	    
        });
    }
    
    var req = http.request(fhem_device_json, callback).end();
}


start_client()
