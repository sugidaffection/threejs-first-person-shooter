const app = require('express')
const http = require('http').createServer(app)
const io = require('socket.io')(http)

const players = []

io.on('connection', (socket) => {

  socket.on('disconnect', () => {
    const player = players.find(p => p.id == socket.id);
    if (player) {
      const idx = players.indexOf(player);
      players.splice(idx, 1);
      socket.broadcast.emit('player::leave', player);
    }

    socket.broadcast.emit('message::disconnect', `${socket.id} disconnected from the game.`);
    io.emit('player::count', io.engine.clientsCount);
  })

  socket.on('join', (player) => {
    socket.emit('player::all', players);
    socket.broadcast.emit('message::connect', `${socket.id} connected to the game.`);
    io.emit('player::count', io.engine.clientsCount);

    if (!players.some(p => p.id == player.id)) {
      players.push(player);
    }

    socket.broadcast.emit('player::joined', player);
  })

  socket.on('update', (data) => {
    let player = players.find(p => p.id == data.id)
    if(player) {
      player.pos = data.pos;
      player.rot = data.rot;
      player.vel = data.vel;
      player.isGrounded = data.isGrounded;
      socket.broadcast.emit('player::update', player);
    }
  })

  socket.on('fire', (data) => {
    let player = players.find(p => p.id == data.id)
    if(player) {
      socket.broadcast.emit('player::shoot', player);
    }
  })

  socket.on('reload', (data) => {
    let player = players.find(p => p.id == data.id)
    if(player) {
      socket.broadcast.emit('player::reload', player);
    }
  })

})

http.listen(8080)