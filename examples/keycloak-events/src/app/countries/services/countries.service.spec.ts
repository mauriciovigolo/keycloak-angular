import { TestBed, inject } from '@angular/core/testing';

import { CountriesService } from './countries.service';

describe('CountriesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CountriesService]
    });
  });

  it('should be created', inject([CountriesService], (service: CountriesService) => {
    expect(service).toBeTruthy();
  }));
});
