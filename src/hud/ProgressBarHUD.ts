export interface IProgressBar {
    x: number,
    y: number,
    w: number,
    h: number,
    value: number,
    color: string,
    bgColor: string,
}

export class ProgressBar implements IProgressBar {
    value: number;
    x: number;
    y: number;
    w: number;
    h: number;
    color: string;
    bgColor: string;

    el: HTMLElement | undefined;
    constructor(config: IProgressBar) {
        this.value = config.value;
        this.x = config.x;
        this.y = config.y;
        this.w = config.w;
        this.h = config.h;
        this.color = config.color;
        this.bgColor = config.bgColor;

        this.initElement();
    }


    initElement() {
        let el = document.createElement('div');
        this.el = el;
    }

    render() {

    }
}

let config: IProgressBar = {
    value: 1,
    x: 0,
    y: 10,
    w: 100,
    h: 10,
    color: '#ff0000',
    bgColor: '#fff'
}
new ProgressBar(config)