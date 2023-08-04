type Constructable<T> = new (...args: any[]) => T;
export function SingletonFn<T>(Base: Constructable<T>) {
  return class SingletonClass {
    private static instance: T;
    static getInstance(): T {
      if (!this.instance) this.instance = new Base();
      return this.instance;
    }
  };
}

type LoadingResult = [total: number, loaded: number, percentage: number];
type LoadingEvent = ProgressEvent<EventTarget>;
type LoadingEventFunction = (...result: LoadingResult) => void;
export class BaseLoadingManager {
  protected _onLoad?: (...result: LoadingResult) => void;
  set onLoad(f: LoadingEventFunction) {
    this._onLoad = f;
  }

  protected onLoadHandler(event: LoadingEvent) {
    if (this._onLoad)
      this._onLoad(
        event.total,
        event.loaded,
        Math.ceil((event.loaded / event.total) * 100)
      );
  }
}

export class BaseManager<T = any> extends Map<string, T> {}
