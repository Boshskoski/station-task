import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { Station } from '@core/models/ui/station/station.ui';
import { StationMapper } from '@core/services/station.mapper';
import { stationDto } from '@core/testing/station.fixtures';
import { StationDetailsHeader } from './station-details-header';

describe('StationDetailsHeader', () => {
  let fixture: ComponentFixture<StationDetailsHeader>;
  let station: Station;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideIonicAngular({})] });
    station = TestBed.inject(StationMapper).stationDtoToUi(stationDto());
    fixture = TestBed.createComponent(StationDetailsHeader);
    await render(station);
  });

  async function render(value: Station): Promise<void> {
    fixture.componentRef.setInput('station', value);
    await fixture.whenStable();
  }

  function element(): HTMLElement {
    return fixture.nativeElement;
  }

  function text(): string {
    return element().textContent?.replace(/\s+/g, ' ') ?? '';
  }

  it('shows the name, the operator and the address', () => {
    expect(element().querySelector('h2')?.textContent).toBe('Ullernbyggene');
    expect(text()).toContain(station.operatorName);
    expect(text()).toContain('Silurveien 42, 0380 Oslo, Norway');
  });

  it('shows the operator logo, and none when there is no logo', async () => {
    expect(element().querySelector('img')?.getAttribute('alt')).toBe(
      `${station.operatorName} logo`,
    );

    await render({ ...station, operatorLogoUrl: '' });

    expect(element().querySelector('img')).toBeNull();
  });

  it('links to Google Maps directions to the station coordinates', () => {
    const directions = element().querySelector<HTMLElement & { href?: string; target?: string }>(
      '.panel-directions',
    );
    const url = new URL(directions?.href ?? '');

    expect(directions?.textContent?.trim()).toBe('Directions');
    expect(directions?.target).toBe('_blank');
    expect(url.origin + url.pathname).toBe('https://www.google.com/maps/dir/');
    expect(url.searchParams.get('api')).toBe('1');
    expect(url.searchParams.get('destination')).toBe('59.933706,10.657575');
  });

  it('shows open and active chips, and their opposites', async () => {
    const chips = () =>
      Array.from(element().querySelectorAll('ion-chip'), (chip) => chip.textContent?.trim());

    expect(chips().slice(0, 2)).toEqual(['Open', 'Active']);

    await render({ ...station, isOpen: false, isActive: false });

    expect(chips().slice(0, 2)).toEqual(['Closed', 'Inactive']);
  });
});
