import { Vector2 } from "three";

export interface BaseHUDOptions {
  position: Vector2;
  backgroundColor: string;
}

export class BaseHUD<T = any> {
  value?: T;
  domElement: HTMLDivElement;

  constructor(
    { position, backgroundColor }: BaseHUDOptions = {
      position: new Vector2(0, 0),
      backgroundColor: "transparent",
    }
  ) {
    this.domElement = document.createElement("div");
    this.domElement.style.left = position.x + "px";
    this.domElement.style.top = position.y + "px";
    this.domElement.style.backgroundColor = backgroundColor;
  }

  update() {}
}
