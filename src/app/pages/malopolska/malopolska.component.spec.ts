import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MalopolskaComponent } from './malopolska.component';

describe('Malopolska', () => {
  let component: MalopolskaComponent;
  let fixture: ComponentFixture<MalopolskaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MalopolskaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MalopolskaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
