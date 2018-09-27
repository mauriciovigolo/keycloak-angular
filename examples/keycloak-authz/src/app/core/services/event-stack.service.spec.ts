import { TestBed, inject } from '@angular/core/testing';

import { EventStackService } from './event-stack.service';

describe('EventStackService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EventStackService]
    });
  });

  it('should be created', inject([EventStackService], (service: EventStackService) => {
    expect(service).toBeTruthy();
  }));
});
