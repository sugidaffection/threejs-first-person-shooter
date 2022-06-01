import { Group, PerspectiveCamera } from "three";
import { FirstPersonCamera } from "../cameras/FirstPersonCamera";
import { BaseManager } from "./Manager";

export class CameraManager extends BaseManager<CameraManager>() {
    static instance: CameraManager = new CameraManager();
    private cameras: (PerspectiveCamera | FirstPersonCamera)[] = [];

    constructor() {
        super();
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
}