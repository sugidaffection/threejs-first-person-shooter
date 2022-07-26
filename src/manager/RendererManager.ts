import { WebGLRenderer } from "three";
import { BaseLoadingManager, SingletonFn } from "./Manager";

interface RendererObject {
    name: string,
    renderer: WebGLRenderer
}

export class RendererManager extends BaseLoadingManager {

    protected static instance: RendererManager = new RendererManager();

    private renderers: RendererObject[];

    constructor() {
        super();
        this.renderers = [];
    }

    addRenderer(name: string, renderer: WebGLRenderer) {
        this.renderers.push({
            name,
            renderer
        });
    }

    getAll(): WebGLRenderer[] {
        return this.renderers.map(ro => ro.renderer);
    }

    get(name: string): WebGLRenderer | undefined {
        return this.renderers.find(r => r.name == name)?.renderer;
    }

}

export const rendererManager = SingletonFn(RendererManager);