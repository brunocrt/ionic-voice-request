import { TestBed } from '@angular/core/testing';

import { NlpserviceService } from './nlpservice.service';

describe('NlpserviceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NlpserviceService = TestBed.get(NlpserviceService);
    expect(service).toBeTruthy();
  });
});
