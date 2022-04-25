import { Controller } from "../inputs/Controller";

class InputEvent {

    activeInputKeys: any = {};

    constructor() {
        addEventListener('keydown', (e: KeyboardEvent) => this.inputEvent(e));
        addEventListener('keyup', (e: KeyboardEvent) => this.inputEvent(e));
        addEventListener('mousedown', (e: MouseEvent) => this.inputEvent(e));
        addEventListener('mouseup', (e: MouseEvent) => this.inputEvent(e));
    }

    inputEvent(e: KeyboardEvent | MouseEvent) {
        if (e instanceof MouseEvent) {
            if (e.button == 0)
                Controller.FIRE = e.type == 'mousedown';
        }

        if (e instanceof KeyboardEvent) {
            switch (e.code) {
                case 'KeyA':
                    Controller.LEFT = e.type == 'keydown';
                    break;
                case 'KeyD':
                    Controller.RIGHT = e.type == 'keydown';
                    break;
                case 'KeyW':
                    Controller.FORWARD = e.type == 'keydown';
                    break;
                case 'KeyS':
                    Controller.BACK = e.type == 'keydown';
                    break;
                case 'Space':
                    Controller.JUMP = e.type == 'keydown';
                    break;
                case 'KeyR':
                    Controller.RELOAD = e.type == 'keydown';
                    break;
                default:
                    break;
            }
        }
    }
}

export { InputEvent }