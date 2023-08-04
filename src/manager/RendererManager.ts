import { WebGLRenderer } from "three";
import { BaseLoadingManager, SingletonFn } from "./Manager";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";

interface RendererObject {
  name: string;
  renderer: WebGLRenderer | CSS2DRenderer;
}

export class RendererManager extends BaseLoadingManager {
  protected static instance: RendererManager = new RendererManager();

  private wrapper: Element | Document =
    document.querySelector(".wrapper") || document;

  private renderers: RendererObject[];

  constructor() {
    super();
    this.renderers = [];
  }

  addRenderer(
    name: string,
    renderer: WebGLRenderer | CSS2DRenderer,
    absolute: boolean = false
  ) {
    this.renderers.push({
      name,
      renderer,
    });

    this.wrapper.appendChild(renderer.domElement || renderer);
    if (absolute) {
      renderer.domElement.style.position = "absolute";
      renderer.domElement.style.top = "0";
      renderer.domElement.style.left = "0";
    }
  }

  getAll(): (WebGLRenderer | CSS2DRenderer)[] {
    return this.renderers.map((ro) => ro.renderer);
  }

  get(name: string): (WebGLRenderer | CSS2DRenderer) | undefined {
    return this.renderers.find((r) => r.name == name)?.renderer;
  }
}

export const rendererManager = SingletonFn(RendererManager);
