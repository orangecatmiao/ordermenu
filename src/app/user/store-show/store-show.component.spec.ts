import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StoreShowComponent } from './store-show.component';

describe('StoreShowComponent', () => {
  let component: StoreShowComponent;
  let fixture: ComponentFixture<StoreShowComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreShowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
