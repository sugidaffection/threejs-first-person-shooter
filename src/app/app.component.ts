import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as io from 'socket.io-client';
import { Game } from './libs/game';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  title = 'three-js-grafkom';
  game: Game;
  socket: SocketIOClient.Socket;

  @ViewChild('renderer', {static : true}) rendererRef: ElementRef;

  constructor(){
    this.socket = io.connect('http://localhost:8080');
  }

  ngAfterViewInit(): void {
    this.socket.on('connect', () => {
      console.log('connected');
      if (!this.game){
        this.game = new Game(800, 600, this.socket);
        this.rendererRef.nativeElement.appendChild(this.game.domElement);
      }

      this.socket.emit('join', {id: this.socket.id, player: this.game.getPlayer()});

      this.socket.on('players', (clients) => {
        this.game.addPlayers(clients.players);
      });

      this.socket.on('disconnect', (player) => {
        console.log('disconnect', player);
        this.game.disconnect(player);
      })
    });

  }
}
