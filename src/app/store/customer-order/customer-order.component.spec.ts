import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CustomerOrderComponent } from './customer-order.component';

describe('CustomerOrderComponent', () => {
  let component: CustomerOrderComponent;
  let fixture: ComponentFixture<CustomerOrderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
