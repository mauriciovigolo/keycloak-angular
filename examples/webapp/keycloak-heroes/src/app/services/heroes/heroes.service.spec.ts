import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { HeroesService } from './heroes.service';

describe('HeroesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [HeroesService, HttpClient]
    });
  });

  it(
    'should be created',
    inject([HeroesService], (service: HeroesService) => {
      expect(service).toBeTruthy();
    })
  );

  it(
    'should list dota heroes',
    inject([HeroesService], (service: HeroesService) => {
      service.list().subscribe(heroes => {
        expect(heroes).toBeTruthy();
        expect(heroes.length).toBeGreaterThan(0);
      });
    })
  );

  it(
    'should list dota heroes returning a Promise',
    inject([HeroesService], (service: HeroesService) => {
      service.listToPromise().then(heroes => {
        expect(heroes).toBeTruthy();
        expect(heroes.length).toBeGreaterThan(0);
      });
    })
  );
});
