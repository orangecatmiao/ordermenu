import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MenuEditComponent } from './menu-edit.component';

describe('MenuEditComponent', () => {
  let component: MenuEditComponent;
  let fixture: ComponentFixture<MenuEditComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
