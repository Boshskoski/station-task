import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ViewportService } from '@shared/services/viewport.service';
import { StationDetailsLayoutService } from './station-details-layout.service';

describe('StationDetailsLayoutService', () => {
  const isDesktop = signal(true);
  const height = signal(800);
  let service: StationDetailsLayoutService;

  beforeEach(() => {
    isDesktop.set(true);
    height.set(800);
    TestBed.configureTestingModule({
      providers: [{ provide: ViewportService, useValue: { isDesktop, height } }],
    });
    service = TestBed.inject(StationDetailsLayoutService);
  });

  it('covers the side panel and its margins on desktop', () => {
    expect(service.insets()).toEqual({ left: 432, bottom: 0 });
  });

  it('covers the part of the screen the details sheet opens to on mobile', () => {
    isDesktop.set(false);

    expect(service.insets()).toEqual({ left: 0, bottom: 320 });
  });

  it('follows the screen height on mobile', () => {
    isDesktop.set(false);

    height.set(667);

    expect(service.insets()).toEqual({ left: 0, bottom: 267 });
  });
});
