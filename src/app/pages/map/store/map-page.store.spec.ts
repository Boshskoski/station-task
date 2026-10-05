import { TestBed } from '@angular/core/testing';
import { MapPageStore } from './map-page.store';

describe('MapPageStore', () => {
  let store: MapPageStore;

  beforeEach(() => {
    store = TestBed.inject(MapPageStore);
  });

  it('starts with no pane open and no focus', () => {
    expect(store.activePane()).toBeUndefined();
    expect(store.isPaneOpen('filters')).toBeFalse();
    expect(store.focus()).toBeUndefined();
  });

  it('keeps one pane open at a time', () => {
    store.openPane('filters');
    expect(store.isPaneOpen('filters')).toBeTrue();

    store.openPane('favorites');
    expect(store.activePane()).toBe('favorites');
    expect(store.isPaneOpen('filters')).toBeFalse();

    store.closePane();
    expect(store.activePane()).toBeUndefined();
  });

  it('opens and closes a pane from its open state', () => {
    store.setPaneOpen('favorites', true);
    expect(store.isPaneOpen('favorites')).toBeTrue();

    store.setPaneOpen('favorites', false);
    expect(store.activePane()).toBeUndefined();
  });

  it('ignores the late close of a pane that another pane already replaced', () => {
    store.openPane('filters');
    store.openPane('favorites');

    store.setPaneOpen('filters', false);

    expect(store.activePane()).toBe('favorites');
  });

  it('focuses the map with a new request every time, even on the same place', () => {
    store.focusOn({ latitude: 60.1, longitude: 11.2 });
    const first = store.focus();

    store.focusOn({ latitude: 60.1, longitude: 11.2 });

    expect(store.focus()).toEqual({ latitude: 60.1, longitude: 11.2 });
    expect(store.focus()).not.toBe(first);
  });
});
