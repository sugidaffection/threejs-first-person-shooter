import { InputEvent } from "./InputEvent";

export class GameEvent extends InputEvent {
    constructor() {
        super();
        addEventListener('resize', (e: UIEvent) => this.resizeEvent(e));
        addEventListener('deviceorientation', (e: DeviceOrientationEvent) => this.deviceOrientationEvent(e));
    }

    resizeEvent(e: UIEvent) {

    }

    deviceOrientationEvent(e: DeviceOrientationEvent) {

    }
}