import { Vec3 } from "cannon-es";
import { Camera } from "three";
import { Bullet } from "./bullet";
import { Player } from './player';

enum Keyboard {
  left = 'KeyA',
  right = 'KeyD',
  forward = 'KeyW',
  back = 'KeyS',
  jump = 'Space'
}

export class Controller {

  public enabled: boolean = false;
  private camera: Camera;
  private player: Player;

  private canJump: boolean = false;

  constructor(camera: Camera, player: Player){

    this.camera = camera;
    this.player = player;

    addEventListener('keydown', this.keypress.bind(this));
    addEventListener('mousemove', this.mousemove.bind(this));
    addEventListener('mousedown', this.mousedown.bind(this));
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

    if(event.code == Keyboard.left) {
      this.player.body.velocity.x -= 2;
    }

    if(event.code == Keyboard.right) {
      this.player.body.velocity.x += 2;
    }

    if(event.code == Keyboard.forward) {
      this.player.body.velocity.z -= 2;
    }

    if(event.code == Keyboard.back) {
      this.player.body.velocity.z += 2;
    }
  }

  private mousemove(_: MouseEvent): void {
  }

  private mousedown(event: MouseEvent): void {
    if(this.enabled && event.button == 0){
      Bullet.create(this.player, new Vec3(
        -10 * Math.sin(this.player.quaternion.y) + this.player.position.x,
        this.player.position.y + 1,
        -10 * Math.cos(this.player.quaternion.y) + this.player.position.z
      ));
    }
  }

  update(){
    const position = this.player.position;
    this.camera.position.copy(position);
    // this.camera.lookAt(this.player.position);
  }

}