import { Input } from "../inputs/Input";

class InputEvent {

    input: Input;
    constructor() {
        this.input = Input.getInstance();

        this.registerEvent();
    }

    registerEvent() {
        addEventListener('keydown', (e: KeyboardEvent) => this.input.inputEventHandler(e));
        addEventListener('keyup', (e: KeyboardEvent) => this.input.inputEventHandler(e));
        addEventListener('keypress', (e: KeyboardEvent) => this.input.inputEventHandler(e));
        addEventListener('mousedown', (e: MouseEvent) => this.input.inputEventHandler(e));
        addEventListener('mouseup', (e: MouseEvent) => this.input.inputEventHandler(e));
        addEventListener('click', (e: MouseEvent) => this.input.inputEventHandler(e));
        addEventListener('mousemove', (e: MouseEvent) => this.input.inputEventHandler(e));
    }
}

export { InputEvent }