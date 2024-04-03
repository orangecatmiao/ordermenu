import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OgcatToolPackageComponent } from './ogcat-tool-package.component';

describe('OgcatToolPackageComponent', () => {
  let component: OgcatToolPackageComponent;
  let fixture: ComponentFixture<OgcatToolPackageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OgcatToolPackageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OgcatToolPackageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
