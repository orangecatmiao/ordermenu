import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MenuOnOffComponent } from './menu-on-off.component';

describe('MenuOnOffComponent', () => {
  let component: MenuOnOffComponent;
  let fixture: ComponentFixture<MenuOnOffComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuOnOffComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuOnOffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
