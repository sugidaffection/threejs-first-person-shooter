import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Game } from './libs/game';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  title = 'three-js-grafkom';
  game: Game;

  @ViewChild('renderer', {static : true}) rendererRef: ElementRef;

  constructor(){
    this.game = new Game(800, 600);
  }

  ngAfterViewInit(): void {
    this.rendererRef.nativeElement.appendChild(this.game.domElement);
  }

}
