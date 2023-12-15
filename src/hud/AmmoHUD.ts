import { Vector2 } from "three";
import { Ammunition, Weapon } from "../objects/weapon";
import { BaseHUD, BaseHUDOptions } from "./BaseHUD";

export interface AmmoHUDOptions extends BaseHUDOptions {
  currentAmmoCount: number;
  remainingAmmoCount: number;
}

export class AmmoHUD extends BaseHUD {
  options: AmmoHUDOptions = {
    currentAmmoCount: 0,
    remainingAmmoCount: 0,
    position: new Vector2(0, 0),
    backgroundColor: "transparent",
  };

  constructor() {
    super();
    this.domElement.id = "ammo-hud";
    this.domElement.className = "ammo-hud";
    this.update();
  }

  updateView(currentAmmoCount: number, remainingAmmoCount: number) {
    this.options.currentAmmoCount = currentAmmoCount;
    this.options.remainingAmmoCount = remainingAmmoCount;
    this.domElement.textContent = `Ammo ${this.options.currentAmmoCount} / ${this.options.remainingAmmoCount}`;
  }

  update() {}
}
