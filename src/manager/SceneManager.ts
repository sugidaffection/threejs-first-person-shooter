import { GameScene } from "src/scenes/GameScene";
import { LobbyScene } from "src/scenes/LobbyScene";
import { AudioListener, Scene } from "three";

interface CScene extends Scene {
    init(audioListener: AudioListener): void;
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
    currentScene?: CScene;
    constructor() {
        this.audioListener = new AudioListener();
        const lobbyScene = new LobbyScene();
        lobbyScene.name = 'lobby-scene';
        const gameScene = new GameScene();
        gameScene.name = 'game-scene'
        this.scenes.push(lobbyScene, gameScene);
    }

    loadScene(name: string = 'lobby-scene'): Scene | undefined {
        const scene: any | undefined = this.scenes.find(s => s.name == name);
        (<CScene>scene)?.init(this.audioListener);
        if (scene)
            this.currentScene = scene;
        return scene;
    }

    update(dt) {
        if (this.currentScene)
            this.currentScene.update(dt)
    }

}