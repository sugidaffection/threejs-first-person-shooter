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
            if (e.type == 'mousedown')
                KeyboardInput.FIRE = e.button == 0;
            else if (e.type == 'mouseup')
                KeyboardInput.FIRE = false;

            MouseInput.MOVEMENTX = e.movementX;
            MouseInput.MOVEMENTY = e.movementY;
        }

        if (e instanceof KeyboardEvent) {
            if (e.code == 'KeyA')
                KeyboardInput.LEFT = e.type == 'keydown';
            if (e.code == 'KeyD')
                KeyboardInput.RIGHT = e.type == 'keydown';
            if (e.code == 'KeyW')
                KeyboardInput.FORWARD = e.type == 'keydown';
            if (e.code == 'KeyS')
                KeyboardInput.BACK = e.type == 'keydown';
            if (e.code == 'Space')
                KeyboardInput.JUMP = e.type == 'keydown';
            if (e.code == 'KeyR')
                KeyboardInput.RELOAD = e.type == 'keydown';
        }
    }

    update() {

    }
}

export { InputEvent }