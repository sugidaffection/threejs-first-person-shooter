import { Camera } from "three";
import { Player } from './player';

enum Keyboard {
  left = 'KeyA',
  right = 'KeyD',
  forward = 'KeyW',
  back = 'KeyS',
  jump = 'Space'
}

export class Controller {

  private camera: Camera;
  private player: Player;

  private canJump: boolean = false;

  constructor(camera: Camera, player: Player){

    this.camera = camera;
    this.player = player;

    addEventListener('keydown', this.keypress.bind(this));
    addEventListener('mousemove', this.mousemove.bind(this));
    this.player.body.addEventListener('collide', this.collide.bind(this));
  }

  private collide(event: any): void {
    if(event.body.mass == 0){
      this.canJump = true;
    }
  }

  private keypress(event: KeyboardEvent): void {
    if(event.code == Keyboard.jump && this.canJump) {
      this.player.body.velocity.y += 5;
      this.canJump = false;
    }
  }

  private mousemove(_: MouseEvent): void {
  }

  update(){
    const position = this.player.position;
    position.y += 1;
    this.camera.position.copy(position);
  }

}