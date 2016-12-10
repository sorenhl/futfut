var util = require('util')
var exec = require('child_process').exec;
/**
 * Creates a new SBrick
 * bluetoothDevice: e.g. 'hci0'
 * bluetoothId: e.g. '00:07:80:D0:58:A2'
 * handle: e.g. 0x001A
 * port: e.g. '0'
 */
function SBrick(bluetoothDevice, bluetoothId, handle, port)
{
    // Fixed configuration
    this.started = new Date();
    this.accellerationTimeToFullSpeed = 5000.0; // 5 seconds

    // Configuration from parameters
    this.bluetoothDevice = bluetoothDevice;
    this.bluetoothId = bluetoothId;
    this.handle = handle;
    this.directionClockwise = true;
    this.speed = 0;
    this.port = port;

    // Adds leading zeros
    function zfill(num, len) {return (Array(len).join("0") + num).slice(-len);};

    var brick = this; // For reference inside loop
    var cmd;
    var looper = function () {
        // As the engine only runs for a very short time, we just have to spam the command whie speed > 0
        if(brick.speed > 0) {
            // Below we calculate the current speed based on what we want and how much
            // we will allow based on acceleration time. We do not want to burn too much rubber
            var ranForInMs = (new Date().getTime() - brick.started.getTime());
            var maxSpeedBasedOnTime = 100.0 / brick.accellerationTimeToFullSpeed * ranForInMs;
            var currentSpeed = Math.min(maxSpeedBasedOnTime, brick.speed);
            var speedInBytes = Math.round(255.0 / 100.0 * currentSpeed).toString(16);

            var command = 'gatttool ' 
                            + '-b ' + brick.bluetoothDevice 
                            + ' -i ' + brick.bluetoothId 
                            + ' --char-write' 
                            + '--handle=' + brick.handle 
                            + ' --value=01'
                            + zfill(brick.port.toString(16),2)
                            + (brick.isClockwise ? '00' : '01')
                            + zfill(speedInBytes,2)

            console.log(command);
            exec(command,function (error, stdout, stderr) {
                if (error !== null) {
                    console.error('exec error: ' + error);
                }
            });
        }
        setTimeout(looper, 25); // 25ms between each run
    }
    looper();
}

/**
 * Sets speed (0-100 %)
 */
SBrick.prototype.setSpeed = function(speed) {
    // We use this to calculate max speed based on started
    // THis is done to avoid burning too much rubber, right Jan :)
    if(this.speed == 0) {
        this.started = new Date();
    }

    this.speed = speed;
    console.log('Setting speed to: ' + speed);
}
/**
 * Sets direction. True = clockwise, false = counter-clockwise
 */
SBrick.prototype.setDirection = function(isClockwise) {
    this.directionClockwise = isClockwise;
    console.log('Setting directionClockwise to: ' + isClockwise);
}

// Expose class
module.exports = SBrick;