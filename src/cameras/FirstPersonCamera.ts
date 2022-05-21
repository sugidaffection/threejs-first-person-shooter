import { MouseInput } from "../inputs/MouseInput";
import { MathUtils, PerspectiveCamera } from "three";

export class FirstPersonCamera extends PerspectiveCamera {

    pitch: number;
    yaw: number;

    maxPitch: number;

    movementX = 0;
    movementY = 0;

    horizontalSensitivity = .45;
    verticalSensitivity = .45;

    constructor() {
        super(75, 1, .1, 1000);
        this.pitch = 0;
        this.yaw = 0;
        this.maxPitch = MathUtils.degToRad(45);
    }

    update(dt: number) {
        this.movementX = MathUtils.clamp(MouseInput.MOVEMENTX, -1, 1);
        this.movementY = MathUtils.clamp(MouseInput.MOVEMENTY, -1, 1);
        this.pitch -= this.movementY * dt;
        this.pitch = MathUtils.clamp(this.pitch, -this.maxPitch, this.maxPitch);
        this.yaw -= this.movementX * dt;
    }

}