var express = require('express');
var app = express();


var hbs = require('hbs');

var http = require('http');

app.use(express.static('public'));

var servicePort = 8080;

//main page
app.get('/',function(req,res) {
  res.sendfile('./views/charisma/index.html');
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
    	var jsonObj = JSON.parse(responseData);
        response.send(jsonObj);
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



