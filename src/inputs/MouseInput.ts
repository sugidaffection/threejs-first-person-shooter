import { MOUSE } from "three";

export class MouseInput {
    static BUTTON: MOUSE | null = null;
    static MOVEMENTX: number = 0;
    static MOVEMENTY: number = 0;

    static reset() {
        this.MOVEMENTX = 0;
        this.MOVEMENTY = 0;
        this.BUTTON = null;
    }
}