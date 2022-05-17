import { Euler, Object3D, Quaternion, Vector3 } from "three";
import { Player } from "src/objects/player";

class Controller {
    static LEFT: boolean = false;
    static RIGHT: boolean = false;
    static FORWARD: boolean = false;
    static BACK: boolean = false;
    static FIRE: boolean = false;
    static JUMP: boolean = false;
    static CROUCH: boolean = false;
    static RELOAD: boolean = false;

    player: Player;

    object: Object3D = new Object3D();
    cameraPitch: Object3D = new Object3D();
    cameraYaw: Object3D = new Object3D();

    euler: Euler;
    eulerY: Euler = new Euler();
    quat: Quaternion;
    quatX = new Quaternion();

    vel: Vector3;
    acc: Vector3;

    movementSpeed: number = 20;

    mouseSensitivity: number = 0.07;

    maxYaw: number = Math.PI / 180 * 45;

    constructor(player: Player) {
        this.player = player;

        this.euler = new Euler();
        this.quat = new Quaternion();

        this.vel = new Vector3();
        this.acc = new Vector3();

        this.cameraPitch.add(this.player.getCamera()!);
        this.cameraYaw.add(this.cameraPitch);
        this.object.add(this.cameraYaw);
        this.object.position.copy(this.player.position);

        function clamp(value: number, min: number, max: number) {
            return Math.max(min, Math.min(max, value))
        }

        document.addEventListener('mousemove', (e: MouseEvent) => {
            const [movementX, movementY] = [
                e.movementX * this.mouseSensitivity,
                e.movementY * this.mouseSensitivity
            ];

            this.cameraPitch.rotation.x -= movementY * this.mouseSensitivity;
            this.cameraPitch.rotation.x = clamp(this.cameraPitch.rotation.x, - this.maxYaw, this.maxYaw);
            this.cameraYaw.rotation.y -= movementX * this.mouseSensitivity;
        })
    }

    update(delta: number = 1 / 60 * 0.1) {
        this.vel.set(0, 0, 0);
        if (Controller.FORWARD) this.vel.z = -this.movementSpeed * delta;
        if (Controller.BACK) this.vel.z = this.movementSpeed * delta;
        if (Controller.LEFT) this.vel.x = -this.movementSpeed * delta;
        if (Controller.RIGHT) this.vel.x = this.movementSpeed * delta;
        if (Controller.FIRE) this.player.fire();
        if (Controller.RELOAD) this.player.reload();

        this.euler.x = this.cameraPitch.rotation.x;
        this.euler.y = this.cameraYaw.rotation.y;
        this.euler.order = 'XYZ';
        this.quat.setFromEuler(this.euler);
        this.vel.applyQuaternion(this.quat);

        this.object.position.x += this.vel.x;
        this.object.position.z += this.vel.z;

        this.player.position.copy(this.object.position);
        this.player.rotateWeapon(this.cameraPitch.rotation);
        this.player.rotation.y = this.cameraYaw.rotation.y;
    }
}

export { Controller }