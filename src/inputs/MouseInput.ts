import { MOUSE, Vec2, Vector2 } from "three";

export class MouseInput {
    private button?: MOUSE;
    private buttonType?: string;
    private movement: Vec2;
    private isLocked: boolean;

    constructor() {
        this.movement = {
            x: 0,
            y: 0
        };
        this.isLocked = false;
    }

    inputEventHandler(e: MouseEvent) {
        if (['click', 'mousedown', 'mouseup'].includes(e.type)) {
            this.button = e.button;
            this.buttonType = e.type;
        }

        if (e.type == 'mousemove') {
            if (this.isLocked) {
                this.movement.x = e.movementX;
                this.movement.y = e.movementY;
            }

        }

    }

    getInput(name: MOUSE) {
        return this.button == name && this.buttonType == 'click';
    }

    getPress(name: MOUSE) {
        return this.button == name && this.buttonType == 'mousedown';
    }

    getMovement() {
        return this.movement;
    }

    lock() {
        this.isLocked = true;
    }

    unlock() {
        this.isLocked = false;
    }

    clear() {
        this.movement.x = 0;
        this.movement.y = 0;
    }
}