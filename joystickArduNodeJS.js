//!Launch MAME with -keyboardprovider dinput

var SerialPort = require("serialport");
var robot = require("robotjs");
var arduPort = "";
var port;
var controls = {
    x:{0:'left',1:'',2:'right'},
    y:{0:'down',1:'',2:'up'},
    a:{0:'',1:'up'},
    b:{0:'',1:'right'},
    c:{0:'',1:'down'},
    d:{0:'',1:'left'},
    e:{0:'',1:'5'},
    f:{0:'',1:'1'},};
var joystick = {x:1,y:1,a:0,b:0,c:0,d:0,e:0,f:0}
var connected = false;

function findConnection() {
    console.log("Searching for arduino");
    arduPort = "";
    //while(arduPort=="") {
        /*SerialPort.list(function(err,ports) {
            ports.forEach(function(port) {
                console.log("Puerto: "+port.comName);
                console.log("Dispositivo: "+port.manufacturer);
                if(port.manufacturer.indexOf("Arduino")>-1) {
                    arduPort = "COM7"//port.comName;
                    start();
                }
            });
        });
    //}*/
    SerialPort.list(function(err,ports) {
        ports.forEach(function(port){
            console.log("Port: "+port.comName+"\nDevice: "+port.manufacturer);
        })
    });
    for(k in process.argv) {
        var val = process.argv[k];
        console.log("Arg %s is %s",k,val);
        if(val=="-port") {
            arduPort = process.argv[Number(k)+1];
            console.log("Using port %s",arduPort);
            connect();
        }
    }
    if(arduPort=="") {
        console.log("node %s -port SERIALPORT",process.argv[1]);
    }
    //arduPort = "COM7";
}

function connect() {
    port = new SerialPort(arduPort,
    {baudRate: 9600,
    parser: SerialPort.parsers.readline("!")});

    port.on('open',function() {
        console.log("Port opened");
    })
    port.on('data',connector);
    setTimeout(restartArdu,2000);
    port.on('disconnect',function(){console.log("ERROR: Disconnection");port.removeListener('data',handle);joystick = {x:1,y:1};handle("[1;1][000000]");findConnection()});
}

function connector(data) {
    console.log("Ardu said: "+data);
    if(data.indexOf("PROYECT_JOY")>-1) {
        console.log("Starting");
        port.write("OK");
        port.drain();
        port.flush();
        port.removeListener('data',connector);
        port.on('data',handle)
        connected = true;
    }
}
function restartArdu() {
    if(connected==false) {
        port.write("RST");
        console.log("Restarting Ardu");
        setTimeout(restartArdu,2000);
    }
}

function handle(data) {
    joystick.x = data[1];
    joystick.y = data[3];
    joystick.a = data[6];
    joystick.b = data[7];
    joystick.c = data[8];
    joystick.d = data[9];
    joystick.e = data[10];
    joystick.f = data[11];

    for(var i=0;i<=2;i++) {
        if(i==1)continue;
        if(joystick.x!=i)
            robot.keyToggle(controls.x[i],'up');
        if(joystick.y!=i)
            robot.keyToggle(controls.y[i],'up');
        if(i==2)break;
        if(joystick.a!=0)
            kToggle(controls.a[1],'up');
        if(joystick.b!=0)
            kToggle(controls.b[1],'up');
        if(joystick.c!=0)
            kToggle(controls.c[1],'up');
        if(joystick.d!=0)
            kToggle(controls.d[1],'up');
        if(joystick.e!=0)
            kToggle(controls.e[1],'up');
        if(joystick.f!=0)
            kToggle(controls.f[1],'up');
    }
    console.log("["+joystick.x+";"+joystick.y+"]");
}

setInterval(function() {
    if(joystick.x!="1") {
        kToggle(controls.x[joystick.x],'down');
    }
    if(joystick.y!="1") {
        kToggle(controls.y[joystick.y],'down');
    }
    if(joystick.a!=0)
        kToggle(controls.a[1],'down');
    if(joystick.b!=0)
        kToggle(controls.b[1],'down');
    if(joystick.c!=0)
        kToggle(controls.c[1],'down');
    if(joystick.d!=0)
        kToggle(controls.d[1],'down');
    if(joystick.e!=0)
        kToggle(controls.e[1],'down');
    if(joystick.f!=0)
        kToggle(controls.f[1],'down');
},100)

function kToggle(key,sta) {
    console.log(key);
    if(key=="")
        return;
    robot.keyToggle(key,sta);
}

findConnection();
//console.log();