var express = require('express');
var app = express();


var hbs = require('hbs');

var http = require('http');

var servicePort = 8080;

//main page
app.get('/',function(req,res) {
  res.sendfile('./views/index.html');
});

//users proxy service
app.get('/users',function(request,response) {
  
  console.log('params: ' + request.params.a);
  
  var options = {
    host: 'localhost',
    port: servicePort,
    path: '/users',
    method: 'GET'
  };
  
  var responseData = '';
  
  var req = http.request(options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
    
      responseData += chunk;

    });
     
    res.on("end", function () {
        // you can use res.send instead of console.log to output via express
        response.send(responseData);
    }); 
     
      
  });
  
  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });
  
  // write data to request body
  req.write('data\n');
  req.write('data\n');
  req.end();
  
});



//users proxy service
app.get('/users/:a',function(request,response) {
  
  console.log('params: ' + request.params.a);
  
  var options = {
    host: 'localhost',
    port: servicePort,
    path: '/users/'+request.params.a,
    method: 'GET'
  };
  
  var responseData = '';
  
  var req = http.request(options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
    
      responseData += chunk;

    });
     
    res.on("end", function () {
        // you can use res.send instead of console.log to output via express
        response.send(responseData);
    }); 
     
      
  });
  
  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });
  
  // write data to request body
  req.write('data\n');
  req.write('data\n');
  req.end();
  
  
  //response.send('here');
});




app.listen(3000);

/*
app.get('/',function(request, response) {
  response.send("This would be some HTML");
});

app.get('/api',function(request,response) {
  response.send({name:"Raymond",age:40});
});
*/


/*
app.set('view engine', 'html');
app.engine('html', hbs.__express);


*/





/*
app.get('/proxy/:a', function(request,response) {

console.log('PARAMS: ' + request.params.a);

for(var key in request) {
  //console.log('key: ' + key);
}

console.log(request['host'] + ':' + servicePort + request['url'] + "\n" + request['url']);

var options = {
  host: 'localhost',
  port: 8080,
  path: '/users',
  method: 'GET'
};

var responseData = '';

var req = http.request(options, function(res) {
  //console.log('STATUS: ' + res.statusCode);
  //console.log('HEADERS: ' + JSON.stringify(res.headers));

  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    
    responseData += chunk;
    console.log('--------------------------------------');
    //console.log(responseData);
    console.log('--------------------------------------');

  });
  
  // this event fires *one* time, after all the `data` events/chunks have been gathered
    res.on("end", function () {
        // you can use res.send instead of console.log to output via express
        response.send(responseData);
    });
  
});

req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});

// write data to request body
req.write('data\n');
req.write('data\n');
req.end();

console.log('here');
console.log('responseDataa\n' + responseData);
//response.send(responseData);


});
*/


