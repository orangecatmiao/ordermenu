import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TeamOrderListComponent } from './team-order-list.component';

describe('TeamOrderListComponent', () => {
  let component: TeamOrderListComponent;
  let fixture: ComponentFixture<TeamOrderListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamOrderListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamOrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
