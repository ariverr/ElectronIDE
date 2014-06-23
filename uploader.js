var sp = require('serialport');
var sh = require('execSync');

/*
sp.list(function(err,list) {
    console.log(list);
});
*/

function runAVRDude(hexfile, portpath, options, debug) {
    debug("running AVR dude");
    var uploadcmd = [
        options.platform.getAvrDudeBinary(options.device),
        '-C'+options.platform.getAvrDudeConf(options.device),
        '-v','-v','-v', //super verbose
        '-p'+options.device.build.mcu,
        '-c'+options.device.upload.protocol,
        '-P'+portpath,
        '-b'+options.device.upload.speed,
        '-D', //don't erase
        '-Uflash:w:'+hexfile+':i',
    ];

    console.log("running", uploadcmd.join(' '));
    var result = sh.exec(uploadcmd.join(' '));
    debug("uploaded");
    console.log(result.stdout);
}

function scanForPortReturn(list1,cb) {
    sp.list(function(err, list2) {
        console.log("list 2 is ",list2);
        console.log("lengths = ",list1.length,list2.length);
        if(list2.length < list1.length) {
            console.log("we need to rescan");
            setTimeout(function() {
                scanForPortReturn(list1, cb);
            },300);
        } else {
            console.log('we are back to normal!');
            cb(list1[list1.length-1].comName);
        }
        //the new port is the right one
        //now run avrdude
        //runAVRDude(hexfile,portpath,options);
    });
}

exports.upload = function(hexfile,portpath,options, publish) {
    function debug(message) {
        var args = Array.prototype.slice.call(arguments);
        //console.log(args.join(' '));
        publish({type:"upload", message:args.join(" ")});
    }

    console.log("uploading to device using ",options.device);
//    var serialpath = "/tty/foobar";
    //var serialpath = '/dev/cu.usbserial-AH019ZWX';

    if(options.device.bootloader.path == 'caterina') {
        console.log("need to do the leonardo dance");
        //scan for ports
        sp.list(function(err,list1) {
            console.log("list 1 is ",list1);
            //open port at 1200 baud
            var port = new sp.SerialPort(portpath, { baudrate: 1200 });
            port.on('open',function() {
                console.log("opened at 1200bd");
                //close port
                port.flush(function() {
                    port.close(function() {
                        console.log("did a successful close");
                        console.log("closed at 1200bd");
                        //wait 300ms
                        setTimeout(function() {
                            console.log("doing a second list");
                            //scan for ports again
                            scanForPortReturn(list1,function(ppath) {
                                console.log("got new path",ppath);
                                runAVRDude(hexfile,ppath,options, debug);
                            })
                        },300);
                    })
                });

            });

        });
    } else {
        runAVRDude(hexfile,portpath,options, debug);
    }
}
