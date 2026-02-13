import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Strategies } from './strategies';

describe('Strategies', () => {
  let component: Strategies;
  let fixture: ComponentFixture<Strategies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Strategies],
    }).compileComponents();

    fixture = TestBed.createComponent(Strategies);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
