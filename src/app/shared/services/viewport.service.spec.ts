import { TestBed } from '@angular/core/testing';
import { ViewportService } from './viewport.service';

describe('ViewportService', () => {
  type Listener = (event: MediaQueryListEvent) => void;

  let listeners: Map<string, Listener[]>;
  let matches: Map<string, boolean>;

  function change(query: string, value: boolean): void {
    matches.set(query, value);
    listeners.get(query)?.forEach((l) => l({ matches: value } as MediaQueryListEvent));
  }

  function listenerCount(): number {
    return [...listeners.values()].reduce((total, list) => total + list.length, 0);
  }

  beforeEach(() => {
    listeners = new Map();
    matches = new Map([
      ['(min-width: 48rem)', true],
      ['(min-width: 64rem)', true],
    ]);
    spyOn(window, 'matchMedia').and.callFake(
      (query) =>
        ({
          media: query,
          get matches() {
            return matches.get(query) ?? false;
          },
          addEventListener: (_: string, l: Listener) =>
            listeners.set(query, [...(listeners.get(query) ?? []), l]),
          removeEventListener: (_: string, l: Listener) =>
            listeners.set(
              query,
              (listeners.get(query) ?? []).filter((x) => x !== l),
            ),
        }) as unknown as MediaQueryList,
    );
  });

  it('starts from the current width and queries the 768px and 1024px breakpoints', () => {
    const service = TestBed.inject(ViewportService);

    expect(service.isDesktop()).toBeTrue();
    expect(service.isWide()).toBeTrue();
    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 48rem)');
    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 64rem)');
  });

  it('follows the media query when the viewport crosses the desktop breakpoint', () => {
    const service = TestBed.inject(ViewportService);

    change('(min-width: 48rem)', false);
    expect(service.isDesktop()).toBeFalse();
    expect(service.isWide()).toBeTrue();

    change('(min-width: 48rem)', true);
    expect(service.isDesktop()).toBeTrue();
  });

  it('tracks the wide breakpoint on its own', () => {
    const service = TestBed.inject(ViewportService);

    change('(min-width: 64rem)', false);

    expect(service.isWide()).toBeFalse();
    expect(service.isDesktop()).toBeTrue();
  });

  it('stops listening when destroyed', () => {
    TestBed.inject(ViewportService);
    expect(listenerCount()).toBe(2);

    TestBed.resetTestingModule();
    expect(listenerCount()).toBe(0);
  });

  describe('height', () => {
    it('starts from the window height and follows resizes', () => {
      const innerHeight = spyOnProperty(window, 'innerHeight').and.returnValue(800);
      const service = TestBed.inject(ViewportService);
      expect(service.height()).toBe(800);

      innerHeight.and.returnValue(500);
      window.dispatchEvent(new Event('resize'));

      expect(service.height()).toBe(500);
    });
  });

  describe('visibleBottom', () => {
    let visual: EventTarget & { offsetTop: number; height: number };
    let visualViewport: jasmine.Spy;

    beforeEach(() => {
      visual = Object.assign(new EventTarget(), { offsetTop: 0, height: 700 });
      visualViewport = spyOnProperty(window, 'visualViewport').and.returnValue(
        visual as unknown as VisualViewport,
      );
    });

    it('starts at the bottom of the visual viewport', () => {
      expect(TestBed.inject(ViewportService).visibleBottom()).toBe(700);
    });

    it('moves up when the on-screen keyboard shrinks the visual viewport', () => {
      const service = TestBed.inject(ViewportService);

      visual.height = 420;
      visual.dispatchEvent(new Event('resize'));

      expect(service.visibleBottom()).toBe(420);
    });

    it('adds the offset when the keyboard scrolls the page', () => {
      const service = TestBed.inject(ViewportService);

      visual.height = 420;
      visual.offsetTop = 80;
      visual.dispatchEvent(new Event('scroll'));

      expect(service.visibleBottom()).toBe(500);
    });

    it('falls back to the window height without a visual viewport', () => {
      visualViewport.and.returnValue(null);
      spyOnProperty(window, 'innerHeight').and.returnValue(640);

      expect(TestBed.inject(ViewportService).visibleBottom()).toBe(640);
    });

    it('stops listening when destroyed', () => {
      const remove = spyOn(visual, 'removeEventListener').and.callThrough();
      TestBed.inject(ViewportService);

      TestBed.resetTestingModule();

      expect(remove.calls.allArgs().map(([event]) => event)).toEqual(['resize', 'scroll']);
    });
  });
});
