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
    private renderer?: WebGLRenderer;
    currentScene?: CScene;
    constructor() {
        this.audioListener = new AudioListener();
        this.clock = new Clock();

        const lobbyScene = new LobbyScene(this.audioListener);
        lobbyScene.name = 'lobby-scene';
        const gameScene = new GameScene(this.audioListener);
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

    update() {
        if (!this.currentScene)
            this.loadScene();
        const dt = this.clock.getDelta();
        if (this.currentScene)
            this.currentScene.update(dt)

        const camera: PerspectiveCamera | undefined = <PerspectiveCamera>this.currentScene?.getObjectByName('camera');
        if (camera)
            this.renderer?.render(<Scene>this.currentScene, camera);
    }

}