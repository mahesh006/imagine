const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');


const app = express();
const server = http.createServer(app);
const io = socketio(server);




// view engine
app.use(express.static(path.join(__dirname,'public')));


// routes
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/services.html');	
})
app.get('/services', (req, res) => {
	 res.sendFile(__dirname + '/public/services.html');	
})
app.get('/home', (req, res) => {
	 res.sendFile(__dirname + '/public/home.html');	
})
app.get('/far', (req, res) => res.sendFile(__dirname + '/public/login.html'));
app.get('/near', (req, res) => res.sendFile(__dirname + '/public/near.html'));

app.get('/index1', (req, res) => res.sendFile(__dirname + '/public/index1.html'));
app.get('/index2', (req, res) => res.sendFile(__dirname + '/public/index2.html'));


const botName = 'ChatCord Bot';

// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));

    // Broadcast when a user connects
   
    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));



