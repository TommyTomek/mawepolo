import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapSectionComponent } from './map-section';

describe('MapSection', () => {
  let component: MapSectionComponent;
  let fixture: ComponentFixture<MapSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
