import { TestBed } from '@angular/core/testing';
import { StorageKey } from '@core/types/storage-key.type';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  const key: StorageKey = 'stations.storage-spec.v1';
  let storage: StorageService;

  beforeEach(() => {
    storage = TestBed.inject(StorageService);
  });

  afterEach(() => localStorage.removeItem(key));

  it('writes values as JSON and reads them back', () => {
    storage.write(key, { values: ['a', 1] });

    expect(localStorage.getItem(key)).toBe('{"values":["a",1]}');
    expect(storage.read(key)).toEqual({ values: ['a', 1] });
  });

  it('reads undefined when nothing is stored', () => {
    expect(storage.read(key)).toBeUndefined();
  });

  it('reads undefined when the stored value is not valid JSON', () => {
    const error = spyOn(console, 'error');
    localStorage.setItem(key, '{broken');

    expect(storage.read(key)).toBeUndefined();
    expect(error).toHaveBeenCalled();
  });

  it('reads undefined when the storage cannot be read', () => {
    const error = spyOn(console, 'error');
    spyOn(Storage.prototype, 'getItem').and.throwError('SecurityError');

    expect(storage.read(key)).toBeUndefined();
    expect(error).toHaveBeenCalled();
  });

  it('does not throw when the storage cannot be written', () => {
    const error = spyOn(console, 'error');
    spyOn(Storage.prototype, 'setItem').and.throwError('QuotaExceededError');

    expect(() => storage.write(key, 'value')).not.toThrow();
    expect(error).toHaveBeenCalled();
  });
});
