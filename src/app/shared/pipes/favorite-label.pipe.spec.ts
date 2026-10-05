import { FavoriteLabelPipe } from './favorite-label.pipe';

describe('FavoriteLabelPipe', () => {
  const pipe = new FavoriteLabelPipe();

  it('offers to add a name that is not a favorite', () => {
    expect(pipe.transform('Charger 1', false)).toBe('Add Charger 1 to favorites');
  });

  it('offers to remove a name that is a favorite', () => {
    expect(pipe.transform('Charger 1', true)).toBe('Remove Charger 1 from favorites');
  });
});
