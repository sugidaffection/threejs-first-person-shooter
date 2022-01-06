import {
    Player
} from "./player";

enum Keyboard {
    LEFT = 'KeyA',
    RIGHT = 'KeyD',
    FORWARD = 'KeyW',
    BACK = 'KeyS',
    JUMP = 'Space',
    RELOAD = 'KeyR'
}

class Controller {

    private player: Player;
    constructor(player: Player) {
        this.player = player;
    }

    fire() {
        this.player.fire()
    }

    jump() {

    }

    moveLeft() {

    }

    moveRight() {

    }

    moveForward() {

    }

    moveBack() {

    }


}

export {
    Controller,
    Keyboard
};