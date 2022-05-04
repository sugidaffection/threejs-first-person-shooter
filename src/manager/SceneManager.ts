import { Camera, PCFSoftShadowMap, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { GameScene } from "../scenes/GameScene";

export interface SceneOptions {
    width: number,
    height: number
}

export class SceneManager {

    private renderer: WebGLRenderer;
    private currentScene?: Scene;
    private camera: PerspectiveCamera;

    constructor(renderer: WebGLRenderer, camera: PerspectiveCamera, options?: SceneOptions) {
        this.renderer = renderer;
        this.camera = camera;

        this.init();
    }

    private init() {
        this.renderer.setClearColor(0xffffff);
        this.renderer.shadowMap.enabled = false;
        this.renderer.shadowMap.type = PCFSoftShadowMap;
        // this.renderer.setSize(WIDTH, HEIGHT);
        this.renderer.setPixelRatio(window.devicePixelRatio * .8);

        this.renderer.setAnimationLoop(() => this.startLoop());
    }

    loadScene(scene: Scene) {
        this.currentScene = scene;
    }

    startLoop() {
        this.render();
        this.update();
    }

    updateCameraView(width: number, height: number) {
        this.renderer.setSize(width, height);
        let aspectRatio = width / height;
        if (height > width) aspectRatio = height / width;
        this.camera.aspect = aspectRatio;
        this.camera.updateProjectionMatrix();
    }

    private render() {
        this.renderer.render(this.currentScene!, this.camera);
    }

    private update() {
        // this.camera.rotation.y += .01;
        (<GameScene>this.currentScene).update();
    }

}