import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { StationDetailsNotice } from './station-details-notice';

describe('StationDetailsNotice', () => {
  let fixture: ComponentFixture<StationDetailsNotice>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideIonicAngular({})] });
    fixture = TestBed.createComponent(StationDetailsNotice);
    await fixture.whenStable();
  });

  it('tells the user the details could not be loaded', () => {
    const alert = fixture.nativeElement.querySelector('[role="alert"]');

    expect(alert.textContent).toContain('Could not load the full details.');
  });

  it('asks to retry', () => {
    const retry = jasmine.createSpy('retry');
    fixture.componentInstance.retry.subscribe(retry);

    fixture.nativeElement.querySelector('ion-button').click();

    expect(retry).toHaveBeenCalledTimes(1);
  });
});
