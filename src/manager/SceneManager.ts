import { GameScene } from "../scenes/GameScene";
import { LobbyScene } from "../scenes/LobbyScene";
import { AudioListener, Clock, PerspectiveCamera, Scene, WebGLRenderer } from "three";

interface CScene extends Scene {
    init(): void;
    update(dt: number): void;
}

export class SceneManager {

    private static instance: SceneManager;
    static getInstance(): SceneManager {
        if (!this.instance)
            this.instance = new SceneManager();
        return this.instance;
    }

    private scenes: Scene[] = [];
    private audioListener: AudioListener;
    private clock: Clock;
    private camera: PerspectiveCamera;
    private renderer?: WebGLRenderer;
    currentScene?: CScene;
    constructor() {
        this.audioListener = new AudioListener();
        this.clock = new Clock();
        this.camera = new PerspectiveCamera(75, 1, .1, 1000);
        this.camera.position.set(0, 0, 2);
        this.camera.rotation.set(0, .5, 0);

        const lobbyScene = new LobbyScene(this.camera, this.audioListener);
        lobbyScene.name = 'lobby-scene';
        const gameScene = new GameScene(this.camera, this.audioListener);
        gameScene.name = 'game-scene'
        this.scenes.push(lobbyScene, gameScene);
    }

    setRenderer(renderer: WebGLRenderer) {
        this.renderer = renderer;
    }

    loadScene(name: string = 'game-scene'): Scene | undefined {
        const scene: any | undefined = this.scenes.find(s => s.name == name);
        (<CScene>scene)?.init();
        if (scene)
            this.currentScene = scene;
        return scene;
    }

    updateCameraAspectRatio(aspectRatio: number) {
        this.camera.aspect = aspectRatio;
        this.camera.updateProjectionMatrix();
    }

    update() {
        if (!this.currentScene)
            this.loadScene();
        const dt = this.clock.getDelta();
        if (this.currentScene)
            this.currentScene.update(dt)

        this.renderer?.render(<Scene>this.currentScene, this.camera);
    }

}