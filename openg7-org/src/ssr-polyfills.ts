type GlobalWithIntersectionObserver = typeof globalThis & {
  IntersectionObserver?: typeof IntersectionObserver;
};

const globalWithIO = globalThis as GlobalWithIntersectionObserver;

if (typeof globalWithIO.IntersectionObserver === 'undefined') {
  globalWithIO.IntersectionObserver = class {
    readonly root = null;
    readonly rootMargin = '';
    readonly thresholds = [] as number[];

    constructor(
      _callback: IntersectionObserverCallback,
      _options?: IntersectionObserverInit
    ) {}

    observe(_target: Element): void {}

    unobserve(_target: Element): void {}

    disconnect(): void {}

    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  };
}
