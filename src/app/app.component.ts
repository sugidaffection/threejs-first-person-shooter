import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
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
  }

  ngAfterViewInit(): void {
    this.game = new Game(800, 600);
    this.rendererRef.nativeElement.appendChild(this.game.domElement);
  }
}
