/*
Small little application that queries elastic search and gets the latest order.
If a new order has occoured since last query the application will request the train to run.

*/

var request = require('request');



var lastOrder = null;
function loop() {

    var requestOptions = {
        uri: 'http://kibana.niqweb.dk:9200/slog-*/_search',
        method: 'GET',
        json: {
  "query": {
        "query_string": {
          "query": "method:/[^\\.]+\\.(sendorder|OrderCompleted)/ AND NOT trigger:fallback",
          "analyze_wildcard": true
        }
  },
  "size": 1,
  "sort": [
    {
      "timestamp": {
        "order": "desc"
      }
    }
  ]
}
  },
  "size": 1,
  "sort": [
    {
      "timestamp": {
        "order": "desc"
      }
    }
  ]
}
     
    };

    request(
        requestOptions,
        function (error, response, body) {
            //console.log(body);
            if (!error && response.statusCode == 200) {
                // The object is already json so lets fetch timestamp :)
                var lastOrderResponse = body.hits.hits[0]._source.timestamp;
            
                // Check if we should make the train run, i.e. new order
                if(lastOrder != null && lastOrderResponse != lastOrder){
                    console.log('Triggering train!');
                    request.get(
                        'http://localhost:8080/trigger?entity=train&isClockwise=1&speed=75&duration=8000', 
                        function (error, response, body) {
                        if(error) {
                            console.log('Error starting train: ' + error);
                        }
                    });

                } else {
                  console.log('Last order: ' + lastOrderResponse + ' (same as last time we asked)');
                }
                lastOrder = lastOrderResponse;
            } else {
                console.error('Unexpected result from kiabana:' + error + response.statusCode);
            }
       // Check a second after response (to avoid building up requests)
        setTimeout(loop,10000); 
    });
}
loop();
