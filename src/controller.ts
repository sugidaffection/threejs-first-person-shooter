import { Camera } from "three";
import { Player } from './player';

enum Keyboard {
  left = 'KeyA'
}

export class Controller {

  private camera: Camera;
  private player: Player;

  constructor(camera: Camera, player: Player){

    this.camera = camera;
    this.player = player;

    addEventListener('keydown', this.keypress.bind(this));
    addEventListener('mousemove', this.mousemove.bind(this));
  }

  private keypress(event: KeyboardEvent): void {
    console.log(event.code)
    if(event.code == Keyboard.left) {
      this.player.body.velocity.x += .01;
    }
  }

  private mousemove(_: MouseEvent): void {
  }

  update(){
    const position = this.player.position;
    position.y += 2;
    this.camera.position.copy(position);
  }

}