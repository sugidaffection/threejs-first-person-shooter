import { Euler, MathUtils, PerspectiveCamera, Vec2, Vector2 } from "three";
import { Input } from "../inputs/Input";
import { CameraManager } from "../manager/CameraManager";

export class FirstPersonCamera extends PerspectiveCamera {

    euler: Euler;
    maxPitch: number;

    horizontalSens: number;
    verticalSens: number;

    constructor() {
        super(75, 1, .1, 1000);
        this.euler = new Euler(0, 0, 0, 'YXZ');
        this.maxPitch = MathUtils.degToRad(45);
        this.horizontalSens = 3.0;
        this.verticalSens = 2.0;

        CameraManager.getInstance().addCamera(this);
    }

    update(dt: number) {
        let movement: Vec2 = Input.getInstance().getMouseMovement();
        let axis = new Vector2(movement.x, movement.y).normalize();
        let x = axis.x * dt * this.horizontalSens;
        let y = axis.y * dt * this.verticalSens;

        this.euler.y -= x;
        this.euler.x -= y;
        this.euler.x = MathUtils.clamp(this.euler.x, -this.maxPitch, this.maxPitch);

        this.quaternion.setFromEuler(this.euler, true);

    }

}