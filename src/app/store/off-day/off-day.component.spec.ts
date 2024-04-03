import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffDayComponent } from './off-day.component';

describe('OffDayComponent', () => {
  let component: OffDayComponent;
  let fixture: ComponentFixture<OffDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OffDayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OffDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
