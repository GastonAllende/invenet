import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedFeatureShell } from './shared-feature-shell';

describe('SharedFeatureShell', () => {
  let component: SharedFeatureShell;
  let fixture: ComponentFixture<SharedFeatureShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedFeatureShell],
    }).compileComponents();

    fixture = TestBed.createComponent(SharedFeatureShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
