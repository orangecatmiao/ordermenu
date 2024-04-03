import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MyOrderTeamComponent } from './my-order-team.component';

describe('MyOrderTeamComponent', () => {
  let component: MyOrderTeamComponent;
  let fixture: ComponentFixture<MyOrderTeamComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MyOrderTeamComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyOrderTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
