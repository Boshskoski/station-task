import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { FavoriteRow } from './favorite-row';

@Component({
  imports: [FavoriteRow],
  template: `
    <app-favorite-row
      [title]="title"
      [clickable]="clickable()"
      [connector]="connector()"
      (selected)="selected()"
      (removed)="removed()"
    >
      Oslo · 3 of 4 available
    </app-favorite-row>
  `,
})
class Host {
  readonly title = 'First';
  readonly clickable = signal(true);
  readonly connector = signal(false);
  readonly selected = jasmine.createSpy('selected');
  readonly removed = jasmine.createSpy('removed');
}

describe('FavoriteRow', () => {
  let fixture: ComponentFixture<Host>;

  function item(): HTMLElement & { button?: boolean } {
    return (fixture.nativeElement as HTMLElement).querySelector('ion-item')!;
  }

  function heart(): HTMLElement {
    return item().querySelector<HTMLElement>('ion-button')!;
  }

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideIonicAngular({})] });
    fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
  });

  it('shows the title and the projected details', () => {
    expect(item().querySelector('.favorite-row__title')?.textContent).toBe('First');
    expect(item().querySelector('.favorite-row__meta')?.textContent?.trim()).toBe(
      'Oslo · 3 of 4 available',
    );
  });

  it('reports a click on the row as a selection', () => {
    item().click();

    expect(fixture.componentInstance.selected).toHaveBeenCalled();
    expect(item().button).toBeTrue();
  });

  it('removes the favorite with its filled heart without selecting the row', () => {
    heart().click();

    expect(fixture.componentInstance.removed).toHaveBeenCalled();
    expect(fixture.componentInstance.selected).not.toHaveBeenCalled();
    expect(heart().getAttribute('aria-label')).toBe('Remove First from favorites');
    expect(heart().querySelector<HTMLElement & { name?: string }>('ion-icon')?.name).toBe('heart');
  });

  it('is not a button when its station is gone', async () => {
    fixture.componentInstance.clickable.set(false);
    await fixture.whenStable();

    expect(item().button).toBeFalse();
    expect(item().classList).toContain('favorite-row--missing');
  });

  it('is indented with a connector icon for a connector', async () => {
    fixture.componentInstance.connector.set(true);
    await fixture.whenStable();

    expect(item().classList).toContain('favorite-row--connector');
    expect(item().querySelector('ion-icon[slot="start"]')).not.toBeNull();
  });
});
