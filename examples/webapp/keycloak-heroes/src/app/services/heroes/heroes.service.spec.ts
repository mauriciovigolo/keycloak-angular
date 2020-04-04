import { HttpClient, HttpClientModule } from '@angular/common/http';
import { inject, TestBed } from '@angular/core/testing';
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
});
