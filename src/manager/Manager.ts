type LoadingResult = [
    total: number,
    loaded: number,
    percentage: number
]

type LoadingEvent = ProgressEvent<EventTarget>;
type LoadingEventFunction = ((...result: LoadingResult) => void);
export function BaseManager<T>() {
    return class BaseManager {
        protected static instance: T;
        static getInstance(): T {
            if (!this.instance) throw new Error('No Instance');
            return this.instance;
        }

        protected _onLoad?: (...result: LoadingResult) => void;
        set onLoad(f: LoadingEventFunction) {
            this._onLoad = f;
        }

        protected onLoadHandler(event: LoadingEvent) {
            if (this._onLoad)
                this._onLoad(event.total, event.loaded, Math.ceil(event.loaded / event.total * 100))
        }
    }
}