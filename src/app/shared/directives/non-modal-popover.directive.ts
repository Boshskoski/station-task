import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: 'ion-popover[appNonModal]',
  host: {
    class: 'non-modal-popover',
    '(didPresent)': 'markNonModal()',
    '(window:resize)': 'close()',
  },
})
export class NonModalPopover {
  private readonly popover = inject<ElementRef<HTMLIonPopoverElement>>(ElementRef).nativeElement;

  constructor() {
    this.popover.showBackdrop = false;
    this.popover.focusTrap = false;
  }

  // Ionic always sets aria-modal="true" on popovers, but these leave the page usable.
  protected markNonModal(): void {
    this.popover.setAttribute('aria-modal', 'false');
  }

  protected close(): void {
    void this.popover.dismiss();
  }
}
