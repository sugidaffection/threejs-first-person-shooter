import { Euler, Quaternion, Vector3 } from "three";
import { FirstPersonCamera } from "../cameras/FirstPersonCamera";
import { Player } from "../objects/player";
import { Input } from "../inputs/Input";

export class FirstPersonController {

    player: Player;
    camera: FirstPersonCamera;

    velocity: Vector3;
    acceleration: Vector3;
    position: Vector3;

    private quaternion: Quaternion;
    private euler: Euler;

    private input: Input;

    constructor(player: Player, camera: FirstPersonCamera) {
        this.player = player;
        this.camera = camera;

        this.acceleration = new Vector3();
        this.velocity = new Vector3();
        this.position = this.player.position.clone();

        this.quaternion = new Quaternion();
        this.euler = new Euler();

        this.input = Input.getInstance();
    }

    update(dt: number) {
        this.player.rotation.set(0, this.camera.rotation.y, 0);
        // this.velocity.multiplyScalar(0);

        // if (this.input.getKeyInput('KeyW')) this.velocity.z = -this.movementSpeed * dt;
        // if (this.input.getKeyInput('KeyS')) this.velocity.z = this.movementSpeed * dt;
        // if (this.input.getKeyInput('KeyA')) this.velocity.x = -this.movementSpeed * dt;
        // if (this.input.getKeyInput('KeyD')) this.velocity.x = this.movementSpeed * dt;
        // if (this.input.getMouseInput(MOUSE.LEFT)) this.player.fire();
        // if (this.input.getKeyInput('KeyR')) this.player.reload();

        // this.euler.x = this.pitch;
        // this.euler.y = this.yaw;
        // this.euler.order = 'XYZ';
        // this.quaternion.setFromEuler(this.euler);

        // this.velocity.applyQuaternion(this.quaternion);
        // this.velocity.setY(0);

        // this.position.add(this.velocity);
        // this.player.position.copy(this.position);
        // this.player.rotation.y = this.yaw;


    }
}