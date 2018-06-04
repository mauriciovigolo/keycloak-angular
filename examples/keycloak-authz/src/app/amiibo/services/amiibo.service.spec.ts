import { TestBed, inject, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { AmiiboService } from './amiibo.service';

describe('AmiiboService', () => {
  let injector: TestBed;
  let amiiboService: AmiiboService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AmiiboService]
    });

    injector = getTestBed();
    amiiboService = injector.get(AmiiboService);
    httpMock = injector.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', inject([AmiiboService], (service: AmiiboService) => {
    expect(service).toBeTruthy();
  }));
});
