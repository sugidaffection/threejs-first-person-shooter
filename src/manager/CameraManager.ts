import { PerspectiveCamera } from "three";
import { FirstPersonCamera } from "../cameras/FirstPersonCamera";
import { SingletonFn } from "./Manager";

export class CameraManager {
    private cameras: (PerspectiveCamera | FirstPersonCamera)[] = [];

    constructor() {
        this.cameras = []
    }

    addCamera(camera: PerspectiveCamera | FirstPersonCamera) {
        this.cameras.push(camera);
    }

    getAll(): (PerspectiveCamera | FirstPersonCamera)[] {
        return this.cameras;
    }

    get(name: string): PerspectiveCamera | FirstPersonCamera | undefined {
        return this.cameras.find(c => c.name == name);
    }

    static addCamera(camera: PerspectiveCamera | FirstPersonCamera) {
        cameraManager.getInstance().addCamera(camera);
    }
}

export const cameraManager = SingletonFn(CameraManager);