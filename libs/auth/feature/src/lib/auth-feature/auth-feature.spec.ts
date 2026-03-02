import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthFeature } from './auth-feature';

describe('AuthFeature', () => {
  let component: AuthFeature;
  let fixture: ComponentFixture<AuthFeature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthFeature],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthFeature);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
