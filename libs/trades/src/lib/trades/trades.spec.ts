import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '@invenet/core';
import { Trades } from './trades';

describe('Trades', () => {
  let component: Trades;
  let fixture: ComponentFixture<Trades>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Trades],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://localhost:5256' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Trades);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
