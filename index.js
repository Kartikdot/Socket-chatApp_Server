const express = require('express')
const app = express();
const http = require('http');

const server = http.Server(app);

const socketio = require('socket.io')
const io = socketio(server);

var port = process.env.port || 3000;


server.listen(port, "<your-ip-here>", function () {
    console.log('Listening to port ' + port);
});

//chatRoom
var numUsers = 0;

//function to be executed when new user connects connection method
io.on('connection', function (socket) {
    console.log('a new socket has connected');
    var addedUser = false;

    //new message is sent    
    socket.on('new message', function (data) {
        console.log('In function new message');
        console.log(data);
        //show new message to all clients
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        });
    });

    //new user is added
    socket.on('add user', function (username) {

        if (addedUser === true) {
            console.log('user already added');
            return;
        }
        socket.username = username;
        numUsers++;
        addedUser = true;
        console.log(username + " has joined")

        //login the user and send the number of users
        socket.emit('login', {
            numUsers: numUsers
        });

        //also echo to all clients that the server has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });


    //A client starts typing
    socket.on('typing', function () {
        console.log('typing')
        //broadcast to all clients
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    //Client stops typing
    socket.on('stop typing', function () {
        console.log('stoped typing');
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });

    //Client disconnects
    socket.on('disconnect', function () {
        console.log('in function disconnect');
        if (addedUser === true) {
            numUsers--;

            //echo globally that user has dissconnected
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });

});