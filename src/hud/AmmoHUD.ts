import { Vector2 } from "three";
import { Weapon } from "../objects/weapon";
import { BaseHUD, BaseHUDOptions } from "./BaseHUD";

export interface IAmmoHUDOptions extends BaseHUDOptions {
  weaponAmmo: number;
  totalAmmo: number;
}

export class AmmoHUD extends BaseHUD {
  options: IAmmoHUDOptions = {
    weaponAmmo: 0,
    totalAmmo: 0,
    position: new Vector2(0, 0),
    backgroundColor: "transparent",
  };

  constructor() {
    super();
    this.domElement.id = "ammo-hud";
    this.domElement.className = "ammo-hud";
    this.update();
  }

  setWeapon(weapon: Weapon) {
    this.options.weaponAmmo = weapon.getCurrentAmmo();
    this.options.totalAmmo = weapon.getLeftAmmo();
  }

  update() {
    this.domElement.textContent = `Ammo ${this.options.weaponAmmo} / ${this.options.totalAmmo}`;
  }
}
