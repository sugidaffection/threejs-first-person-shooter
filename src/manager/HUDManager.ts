import { BaseHUD } from "../hud/BaseHUD";
import { BaseManager, SingletonFn } from "./Manager";

export class HUDManager extends BaseManager<BaseHUD<any>> {
  domElement: HTMLDivElement;
  constructor() {
    super();

    this.domElement = document.createElement("div");
    this.domElement.className = "ui-element";
    document.querySelector(".wrapper")?.appendChild(this.domElement);
  }

  add(name: string, hud: BaseHUD<any>) {
    this.set(name, hud);
    this.domElement.appendChild(hud.domElement);
  }

  setSize(width: number, height: number) {
    this.domElement.style.width = width + "px";
    this.domElement.style.height = height + "px";
  }

  update() {
    this.forEach((v, _) => v.update());
  }
}

export const hudManager = SingletonFn(HUDManager);
