import { TestBed } from '@angular/core/testing';

import { OgcatToolPackageService } from './ogcat-tool-package.service';

describe('OgcatToolPackageService', () => {
  let service: OgcatToolPackageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OgcatToolPackageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
