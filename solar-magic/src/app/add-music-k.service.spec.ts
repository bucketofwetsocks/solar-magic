import { TestBed } from '@angular/core/testing';

import { AddMusicKService } from './add-music-k.service';

describe('AddMusicKService', () => {
  let service: AddMusicKService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddMusicKService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
