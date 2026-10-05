import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NonModalPopover } from './non-modal-popover.directive';

@Component({
  imports: [NonModalPopover],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<ion-popover appNonModal aria-modal="true" />`,
})
class Host {}

describe('NonModalPopover', () => {
  let fixture: ComponentFixture<Host>;
  let popover: HTMLIonPopoverElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    popover = fixture.nativeElement.querySelector('ion-popover');
  });

  it('keeps Ionic aria-modal until the popover is presented', () => {
    expect(popover.getAttribute('aria-modal')).toBe('true');
  });

  it('tells assistive technology that the page behind a presented popover is still usable', () => {
    popover.dispatchEvent(new CustomEvent('didPresent'));

    expect(popover.getAttribute('aria-modal')).toBe('false');
  });

  it('leaves the page usable: no backdrop, no focus trap, clicks pass around the content', () => {
    expect(popover.showBackdrop).toBeFalse();
    expect(popover.focusTrap).toBeFalse();
    expect(popover.classList).toContain('non-modal-popover');
  });

  it('closes when the window is resized, because Ionic positions a popover only when it opens', () => {
    const dismiss = jasmine.createSpy('dismiss').and.resolveTo(true);
    popover.dismiss = dismiss;

    window.dispatchEvent(new Event('resize'));

    expect(dismiss).toHaveBeenCalledTimes(1);
  });
});
