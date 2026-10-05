import { TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { FavoritesHeader } from './favorites-header';

describe('FavoritesHeader', () => {
  it('shows the title that names the dialog', async () => {
    TestBed.configureTestingModule({ providers: [provideIonicAngular({ animated: false })] });
    const fixture = TestBed.createComponent(FavoritesHeader);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('#favorites-title').textContent.trim()).toBe(
      'Favorites',
    );
  });
});
