import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffDayShowComponent } from './off-day-show.component';

describe('OffDayShowComponent', () => {
  let component: OffDayShowComponent;
  let fixture: ComponentFixture<OffDayShowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OffDayShowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OffDayShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
