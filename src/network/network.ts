import io from 'socket.io-client';

class Network {

    // private static socket: SocketIOClient.Socket;

    static connect() {
        // if (!this.socket) {
        // this.socket = io('http://localhost:3000');
        // }
    }

    static onListening() {
        // this.socket.on('connect', async () => {

        //   await setup;
        //   console.log('connected');

        //   this.player.name = this.socket.id;
        //   this.socket.emit('join', this.player);

        //   this.socket.on('message::disconnect', (message) => {
        //     console.log('message');
        //     const li = document.createElement('li');
        //     li.innerText = message;
        //     li.className = 'warning'
        //     this.statusPanel.append(li);
        //     li.scrollIntoView();
        //   });

        //   this.socket.on('message::connect', (message) => {
        //     console.log('message');
        //     const li = document.createElement('li');
        //     li.innerText = message;
        //     li.className = 'info'
        //     this.statusPanel.append(li);
        //     li.scrollIntoView();
        //   });

        //   this.socket.on('player::all', (result: PlayerJSON[]) => {
        //     result.forEach(data => {
        //       let player = this.players.find(p => p.name == data.id);
        //       if(!player){
        //         player = this.createPlayer(data.id);
        //         player.updateFromJSON(data);
        //         this.players.push(player);
        //       }
        //     })
        //   });

        //   this.socket.on('player::joined', (data: PlayerJSON) => {
        //     let player = this.players.find(p => p.name == data.id);
        //     if(!player){
        //       player = this.createPlayer(data.id);
        //       player.updateFromJSON(data);
        //       this.players.push(player);
        //     }
        //   });

        //   this.socket.on('player::update', (data: PlayerJSON) => {
        //     let player = this.players.find(p => p.name == data.id);
        //     if(player && player.name != this.player.name){
        //       player.updateFromJSON(data);
        //     }
        //   });

        //   this.socket.on('player::count', (count) => {
        //     this.connectionPanel.innerText = `online : ${count}`;
        //   });

        //   this.socket.on('player::leave', (data: { id: string }) => {
        //     let player = this.players.find(p => p.name == data.id);
        //     if(player){
        //       this.world.removeBody(player.body);
        //       this.scene.remove(player);

        //       const idx = this.players.indexOf(player);
        //       this.players.splice(idx, 1);
        //     }
        //   })

        //   this.socket.on('player::shoot', (data: PlayerJSON) => {
        //     let player = this.players.find(p => p.name == data.id);
        //     if(player && player.name != this.player.name){
        //       player.fire();
        //     }
        //   })

        //   this.socket.on('player::reload', (data: PlayerJSON) => {
        //     let player = this.players.find(p => p.name == data.id);
        //     if(player && player.name != this.player.name){
        //       player.reload();
        //     }
        //   })
        // })

        // this.socket.on('disconnect', () => {
        //   const li = document.createElement('li');
        //   li.innerText = 'disconnected from the game.';
        //   li.className = 'warning'
        //   this.statusPanel.append(li);
        //   li.scrollIntoView();
        // })
    }

    static onDisconnecting() {

    }
}

export default Network;