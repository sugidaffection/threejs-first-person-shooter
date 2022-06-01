import { MOUSE } from "three";
import { KeyboardInput } from "./KeyboardInput";
import { MouseInput } from "./MouseInput";

export class Input {

    private static instance: Input;

    static getInstance() {
        if (!this.instance)
            this.instance = new Input();
        return this.instance;
    }

    private keyboardInput: KeyboardInput;
    private mouseInput: MouseInput;

    constructor() {
        this.keyboardInput = new KeyboardInput();
        this.mouseInput = new MouseInput();
    }

    update() {
        this.mouseInput.clear();
    }

    inputEventHandler(e: MouseEvent | KeyboardEvent) {
        if (e instanceof KeyboardEvent)
            this.keyboardInput.inputEventHandler(e);
        else if (e instanceof MouseEvent)
            this.mouseInput.inputEventHandler(e);
    }

    getMouseInput(button: MOUSE) {
        return this.mouseInput.getInput(button);
    }

    getMousePress(button: MOUSE) {
        return this.mouseInput.getPress(button);
    }

    getMouseMovement() {
        return this.mouseInput.getMovement();
    }

    getKeyInput(key: string) {
        return this.keyboardInput.getInput(key);
    }

    getKeyPress(key: string) {
        return this.keyboardInput.getPress(key);
    }

    setPointerLock(value: boolean) {
        if (value) this.mouseInput.lock()
        else this.mouseInput.unlock();
    }
}