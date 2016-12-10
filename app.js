

var engine = require('./engine');
var express = require('express');



var app = express();

var entities = {
    'train': {
        brick: new engine.SBrick('hci0','00:07:80:D0:58:A2','0x001A',1)
    }
};

app.get('/', function (req, res) {
    //res.setHeader('Content-Type', 'text/plain');
    var msg = 'Entities:';
    msg += '<ul>';
    for(var name in entities)
    {
        var url = '/trigger?entity=' + name + '&isClockwise=1&speed=75&duration=5000'
        msg += '<li>' + name + ' (example for 75 % speed for 5 seconds: <a href=' + url + '>' + url +  '</a>)</ul>';
    }
    '</ul>';
  res.send(msg);
});

app.get('/trigger', function(req, res) {
    var entity = entities[req.query.entity];
    if(entity == undefined) {
        res.send('ERROR: Could not find entity with id: ' + (req.query.entity || 'undefined'));
        return;
    }
    var isClockwise = req.query.isClockwise == '1';
    var speed = parseInt(req.query.speed);
    if(isNaN(speed) || speed <= 0 || speed > 100) {
        res.send('ERROR: Speed must be between 1 and 100');
        return;
    }
    var duration = parseInt(req.query.duration);
    if(isNaN(duration) || duration <= 0 || duration > 20000) {
        res.send('ERROR: Duration must be between 1 and 20000');
        return;
    }

    console.log(duration);
    // Do the actual running
    entity.brick.setDirection(isClockwise);
    entity.brick.setSpeed(speed);
    setTimeout(function() {
        entity.brick.setSpeed(0);
    }, duration);

    res.send('OK');
});



app.listen(8080, function () {
  console.log('Train listning on port 8080')
});

