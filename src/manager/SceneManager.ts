import { Scene } from "three";

export class SceneManager {

    private static scenes: Scene[] = [];
    static loadScene(scene: Scene) {
        this.scenes.push(scene)
    }

    static getSceneById(id: number): Scene | undefined {
        return this.scenes.find(scene => scene.id == id);
    }

}