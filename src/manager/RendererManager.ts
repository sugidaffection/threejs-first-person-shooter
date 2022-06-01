import { WebGLRenderer } from "three";
import { BaseManager } from "./Manager";

interface RendererObject {
    name: string,
    renderer: WebGLRenderer
}

export class RendererManager extends BaseManager<RendererManager>() {

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