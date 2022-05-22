import { KeyboardInput } from "../inputs/KeyboardInput";
import { Euler, MathUtils, Quaternion, Vector3 } from "three";
import { FirstPersonCamera } from "../cameras/FirstPersonCamera";
import { Player } from "../objects/player";
import { MouseInput } from "../inputs/MouseInput";

export class FirstPersonController {

    player: Player;
    camera: FirstPersonCamera;

    pitch: number;
    yaw: number;
    maxPitch: number;

    movementSpeed: number;
    horizontalSensitivity: number;
    verticalSensitivity: number;

    velocity: Vector3;
    acceleration: Vector3;
    position: Vector3;

    private quaternion: Quaternion;
    private euler: Euler;

    constructor(player: Player, camera: FirstPersonCamera) {
        this.player = player;
        this.camera = camera;

        this.pitch = 0;
        this.yaw = 0;
        this.maxPitch = MathUtils.degToRad(65);

        this.movementSpeed = 10;
        this.horizontalSensitivity = .45;
        this.verticalSensitivity = .45;

        this.acceleration = new Vector3();
        this.velocity = new Vector3();
        this.position = this.player.position.clone();

        this.quaternion = new Quaternion();
        this.euler = new Euler();
    }

    update(dt: number) {
        this.pitch -= MouseInput.MOVEMENTY * dt * this.verticalSensitivity;
        this.pitch = MathUtils.clamp(this.pitch, -this.maxPitch, this.maxPitch);
        this.yaw -= MouseInput.MOVEMENTX * dt * this.horizontalSensitivity;

        this.velocity.multiplyScalar(0);

        if (KeyboardInput.FORWARD) this.velocity.z = -this.movementSpeed * dt;
        if (KeyboardInput.BACK) this.velocity.z = this.movementSpeed * dt;
        if (KeyboardInput.LEFT) this.velocity.x = -this.movementSpeed * dt;
        if (KeyboardInput.RIGHT) this.velocity.x = this.movementSpeed * dt;
        if (KeyboardInput.FIRE) this.player.fire();
        if (KeyboardInput.RELOAD) this.player.reload();

        this.euler.x = this.pitch;
        this.euler.y = this.yaw;
        this.euler.order = 'XYZ';
        this.quaternion.setFromEuler(this.euler);

        this.velocity.applyQuaternion(this.quaternion);
        this.velocity.setY(0);

        this.position.add(this.velocity);
        this.player.position.copy(this.position);
        this.player.rotation.y = this.yaw;

        this.player.rotateWeapon(new Euler(this.pitch));

    }
}