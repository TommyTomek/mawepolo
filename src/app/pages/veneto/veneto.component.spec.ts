import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenetoComponent } from './veneto.component';

describe('Veneto', () => {
  let component: VenetoComponent;
  let fixture: ComponentFixture<VenetoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenetoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VenetoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
