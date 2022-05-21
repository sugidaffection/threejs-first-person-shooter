import { MouseInput } from "../inputs/MouseInput";
import { KeyboardInput } from "../inputs/KeyboardInput";

class InputEvent {

    constructor() {
        addEventListener('keydown', (e: KeyboardEvent) => this.inputEvent(e));
        addEventListener('keyup', (e: KeyboardEvent) => this.inputEvent(e));
        addEventListener('mousedown', (e: MouseEvent) => this.inputEvent(e));
        addEventListener('mouseup', (e: MouseEvent) => this.inputEvent(e));
        addEventListener('mousemove', (e: MouseEvent) => this.inputEvent(e));
    }

    inputEvent(e: KeyboardEvent | MouseEvent) {
        if (e instanceof MouseEvent) {
            if (e.button == 0)
                KeyboardInput.FIRE = e.type == 'mousedown';
            MouseInput.MOVEMENTX = e.movementX;
            MouseInput.MOVEMENTY = e.movementY;
        }

        if (e instanceof KeyboardEvent) {
            switch (e.code) {
                case 'KeyA':
                    KeyboardInput.LEFT = e.type == 'keydown';
                    break;
                case 'KeyD':
                    KeyboardInput.RIGHT = e.type == 'keydown';
                    break;
                case 'KeyW':
                    KeyboardInput.FORWARD = e.type == 'keydown';
                    break;
                case 'KeyS':
                    KeyboardInput.BACK = e.type == 'keydown';
                    break;
                case 'Space':
                    KeyboardInput.JUMP = e.type == 'keydown';
                    break;
                case 'KeyR':
                    KeyboardInput.RELOAD = e.type == 'keydown';
                    break;
                default:
                    break;
            }
        }
    }

    update() {

    }
}

export { InputEvent }