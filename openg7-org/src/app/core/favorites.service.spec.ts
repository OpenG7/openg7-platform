import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { FavoritesService } from './favorites.service';

const STORAGE_KEY = 'og7.favorites';

describe('FavoritesService', () => {
  let storage: Record<string, string>;
  let setItemSpy: jasmine.Spy;

  const createService = () => TestBed.inject(FavoritesService);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    });

    storage = {};

    spyOn(window.localStorage, 'getItem').and.callFake((key: string) => storage[key] ?? null);
    setItemSpy = spyOn(window.localStorage, 'setItem').and.callFake((key: string, value: string) => {
      storage[key] = value;
    });
  });

  it('should track items count without duplicates', () => {
    const service = createService();

    expect(service.count()).toBe(0);

    service.add('one');
    service.add('one');

    expect(service.count()).toBe(1);
    expect(service.list()).toEqual(['one']);
  });

  it('persists list changes to localStorage', () => {
    const service = createService();

    service.add('alpha');
    expect(setItemSpy).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(['alpha']));

    setItemSpy.calls.reset();
    service.remove('missing');
    expect(setItemSpy).not.toHaveBeenCalled();

    service.remove('alpha');
    expect(setItemSpy).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify([]));

    setItemSpy.calls.reset();
    service.add('beta');
    service.clear();
    expect(setItemSpy).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify([]));
  });

  it('restores stored favorites on creation', () => {
    storage[STORAGE_KEY] = JSON.stringify(['one', 'two', 'one']);
    const service = createService();

    expect(service.list()).toEqual(['one', 'two']);
  });
});
