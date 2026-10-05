import { DestroyRef, inject, Service, Signal, signal } from '@angular/core';

@Service()
export class ViewportService {
  private static readonly DESKTOP_QUERY = '(min-width: 48rem)';
  private static readonly WIDE_QUERY = '(min-width: 64rem)';

  private readonly destroyRef = inject(DestroyRef);

  readonly isDesktop = this.track(ViewportService.DESKTOP_QUERY);
  readonly isWide = this.track(ViewportService.WIDE_QUERY);
  readonly height = this.observe(window, ['resize'], () => window.innerHeight);
  readonly visibleBottom = this.observe(window.visualViewport ?? window, ['resize', 'scroll'], () =>
    this.readVisibleBottom(),
  );

  private track(mediaQuery: string): Signal<boolean> {
    const query = window.matchMedia(mediaQuery);
    const matches = signal(query.matches);
    const onChange = (event: MediaQueryListEvent): void => matches.set(event.matches);
    query.addEventListener('change', onChange);
    this.destroyRef.onDestroy(() => query.removeEventListener('change', onChange));
    return matches.asReadonly();
  }

  private observe(target: EventTarget, events: readonly string[], read: () => number): Signal<number> {
    const value = signal(read());
    const onChange = (): void => value.set(read());
    events.forEach((event) => target.addEventListener(event, onChange));
    this.destroyRef.onDestroy(() =>
      events.forEach((event) => target.removeEventListener(event, onChange)),
    );
    return value.asReadonly();
  }

  private readVisibleBottom(): number {
    const visual = window.visualViewport;
    return visual ? visual.offsetTop + visual.height : window.innerHeight;
  }
}
