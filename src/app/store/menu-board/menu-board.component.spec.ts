import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MenuBoardComponent } from './menu-board.component';

describe('MenuBoardComponent', () => {
  let component: MenuBoardComponent;
  let fixture: ComponentFixture<MenuBoardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuBoardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
