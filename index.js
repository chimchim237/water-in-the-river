var cheerio = require('cheerio');
var express = require('express');
var Promise = require('promise');
var req = require('request');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
  // 1. http://waterdata.usgs.gov/usa/nwis/uv?07164500
  // #WaterInTheRiver means more than 1' at the gauge, with 2' being a nice looking river.
  var guageHeight = null;
  var promise = new Promise(function(resolve, reject) {
    req('http://waterdata.usgs.gov/usa/nwis/uv?07164500', function(error, resp, body) {
      if (error) reject(error);
      else {
        var valueRE = /value: (\d+\.\d+)/;
        guageHeight = parseFloat(valueRE.exec(body)[1]);
        console.log("guageHeight: " + guageHeight);
        resolve(guageHeight);
      }
    });
  });
  //
  //
  // 2. Information from Keystone (http://www.swt-wc.usace.army.mil/webdata/gagedata/KEYO2.current.html)
  // The two important columns are "TW-ELEV FEET GOES" and "RELEASE CFS POWERQ"
  // They should both increase at the same time, and whenever they do you will see a change in the Tulsa area 6 hours later. 
  //
  //
  // 3. Generation Schedules (http://www.swpa.gov/generationschedules.aspx) and (http://www.swpa.gov/gen/fri.htm)
  //
  // SWPA will release the generation schedule about 4pm for the next day.
  // 3 KEY is keystone, up until the flood it would say either 35 or 70, with 35 resulting in 5,000 cfs or 2' in the river and 70 resulting in 10,000 cfs or 4' in the river. It now shows 50 and I have no idea why.
  // The values can change, at some point a person died below grand lake dam, which resulted in them turning it off while they looked for them. To make up for that, Keystone turned on. The charts aren't updated.
  // Again, ~6 hours after they say they will generate, riverside will start seeing water. 

  promise.then(function() {
    var output = '';
    if (guageHeight > 2) {
      output += "Yes. ";
    } else {
      output += "No. ";
    }
    output += "Guage Height: " + guageHeight;
    response.send(output);
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
