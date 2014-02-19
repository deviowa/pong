var express = require('express');
var socket_io = require('socket.io');
var http = require('http');
var path = require('path');

var app = express();
var server = http.createServer(app);
var io = socket_io.listen(server);
io.set('log level', 1);

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}



var p1_y = 300;
var p2_y = 300;
var width = 1300;
var height = 700;
var ball = {x: width/2, y:height/2, dx:0, dy:0};

max_y = 175;
min_y = -175;


var host_socket = false;

io.sockets.on('connection', function(socket){
    
    if (!host_socket){
        
        host_socket = socket;
        host_socket.emit("host", {});
        host_socket.on('disconnect', function(){
            host_socket = false;
        });
    }
    
    
    
    //whenever anyone connects, set paddle to middle
    socket.emit('paddle1', {y: p1_y});
    socket.emit('paddle2', {y: p2_y});
    socket.emit('ball', ball);
    
    socket.on('ball_data', function(data){
        if (socket == host_socket){
            ball = data;
            socket.broadcast.emit('ball', data);
        }
    });
    
    

    
    
    socket.on('paddle1_move_up', function(data){
        p1_y = p1_y - 10;
        if (p1_y >= height - 175)
          p1_y = height - 175;
        else if (p1_y <= 175)
          p1_y = 175;
        io.sockets.emit('paddle1', {y:p1_y});
        
    });
    
    socket.on('paddle1_move_down', function(data){
        p1_y = p1_y + 10;
        if (p1_y >= height - 175)
          p1_y = height - 175;
        else if (p1_y <= 175)
          p1_y = 175;
        io.sockets.emit('paddle1', {y:p1_y});
        
    });

    
    socket.on('paddle2_move_up', function(data){
        p2_y = p2_y - 10;
        if (p2_y >= height - 175)
          p2_y = height - 175;
        else if (p2_y <= 175)
          p2_y = 175;
        io.sockets.emit('paddle2', {y:p2_y});
        
    });
    
    socket.on('paddle2_move_down', function(data){
        p2_y = p2_y + 10;
        if (p2_y >= height - 175)
          p2_y = height - 175;
        else if (p2_y <= 175)
          p2_y = 175;
        io.sockets.emit('paddle2', {y:p2_y});
        
    });
    
    socket.on('start', function(data){
        if (ball.dx != 0) return;
        if (Math.random() < 0.5)
            ball.dx = width / 3;
        else
            ball.dx = -width / 3;
      
        io.sockets.emit('ball', ball);
    }); 
    
    
    

    
});


//start teh server
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});







