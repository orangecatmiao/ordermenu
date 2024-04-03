import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TeamBtntoolComponent } from './team-btntool.component';

describe('TeamBtntoolComponent', () => {
  let component: TeamBtntoolComponent;
  let fixture: ComponentFixture<TeamBtntoolComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamBtntoolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamBtntoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
