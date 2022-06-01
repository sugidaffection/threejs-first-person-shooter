interface InputKeys {
    [key: string]: {
        active: boolean,
        isPressed: boolean
    };
}
export class KeyboardInput {
    private keys: InputKeys;

    constructor() {
        this.keys = {};
    }

    inputEventHandler(e: KeyboardEvent) {
        this.keys[e.code] = {
            active: ['keydown', 'keypress'].includes(e.type) || e.type != 'keyup',
            isPressed: e.type == 'keypress'
        };

    }

    private getInputKey(name: string) {
        if (Object.keys(this.keys).some(key => key == name))
            return this.keys[name];
        return false;
    }

    getInput(name: string) {
        let key = this.getInputKey(name);
        if (key)
            return key.active;
        return false;
    }

    getPress(name: string) {
        let key = this.getInputKey(name);
        if (key)
            return key.isPressed;
        return false;
    }
}