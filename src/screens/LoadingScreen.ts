export class LoadingScreen {

    el: HTMLElement;
    barEl: HTMLElement;
    progress: number;
    constructor() {
        this.progress = 20;
        this.el = this.createElement();
        this.barEl = this.el.querySelector('.loading-bar') as HTMLElement;
        document.querySelector('main')?.append(this.el);
    }

    protected createElement() {
        const container = document.createElement('div');
        container.className = 'loading'
        container.setAttribute('progress', this.progress.toString());

        const bar = document.createElement('div');
        bar.className = 'loading-bar';
        bar.style.width = this.progress.toString() + 'px';

        container.appendChild(bar);


        return container;
    }

    update() {
        this.el.setAttribute('progress', this.progress.toString());
        this.barEl.style.width = this.progress.toString() + '%';
    }

    destroy() {
        this.el.remove();
    }

}