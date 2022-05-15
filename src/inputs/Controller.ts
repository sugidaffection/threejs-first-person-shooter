import { Player } from "src/objects/player";
import { Euler, PerspectiveCamera, Quaternion, Vector3 } from "three";

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
    camera: PerspectiveCamera;

    constructor(player: Player, camera: PerspectiveCamera) {
        this.player = player;
        this.camera = camera;

        const euler = new Euler();
        const quat = new Quaternion();
        document.addEventListener('mousemove', (e: MouseEvent) => {
            const [x, y] = [e.movementX * 0.002, e.movementY * 0.002];

            euler.x -= y;
            euler.y -= x;
            euler.order = 'XYZ';

            quat.setFromEuler(euler);

            this.player.rotation.setFromQuaternion(quat);
        })
    }

    update() {
        if (Controller.FORWARD) {
            this.player.position.add(new Vector3(0, 0, -0.05));
        }

        if (Controller.LEFT) {
            this.player.position.add(new Vector3(-.05, 0, 0));
        }

        if (Controller.BACK) {
            this.player.position.add(new Vector3(0, 0, 0.05));
        }

        if (Controller.RIGHT) {
            this.player.position.add(new Vector3(.05, 0, 0));
        }
    }
}

export { Controller }