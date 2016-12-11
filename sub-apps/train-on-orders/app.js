/*
Small little application that queries elastic search and gets the latest order.
If a new order has occoured since last query the application will request the train to run.

*/

var request = require('request');



var lastOrder = null;
function loop() {

    var requestOptions = {
        uri: 'https://jsonplaceholder.typicode.com/posts/1', // temp to test
        method: 'GET',
        json: {
            "query": {
                "match_all": {}
            },
            "size": 1,
            "sort": [
                {
                "_timestamp": {
                    "order": "desc"
                }
                }
            ]
        }
    };

    request(
        requestOptions,
        function (error, response, body) {
            
            if (!error && response.statusCode == 200) {
                // The object is already json :)
                var lastOrderResponse = body.id;
            
            
                // Check if we should make the train run, i.e. new order
                if(lastOrder != null && lastOrderResponse != lastOrder){
                    request.get(
                        'http://localhost:8080/trigger?entity=train&isClockwise=1&speed=75&duration=5000', 
                        function (error, response, body) {
                        if(error) {
                            console.log('Error starting train: ' + error);
                        }
                    });

                }
                lastOrder = lastOrderResponse;
            } else {
                console.error('Unexpected result from kiabana:' + error + response.statusCode);
            }
       // Check a second after response (to avoid building up requests)
        setTimeout(loop,1000); 
    });
}
loop();