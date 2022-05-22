import { PerspectiveCamera } from "three";

export class FirstPersonCamera extends PerspectiveCamera {

    constructor() {
        super(75, 1, .1, 1000);
    }

}