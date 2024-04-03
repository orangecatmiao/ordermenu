import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TeamTotalComponent } from './team-total.component';

describe('TeamTotalComponent', () => {
  let component: TeamTotalComponent;
  let fixture: ComponentFixture<TeamTotalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamTotalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamTotalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
