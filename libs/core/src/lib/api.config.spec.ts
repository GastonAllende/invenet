import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from './api.config';

describe('API_BASE_URL', () => {
  it('is defined as an injection token', () => {
    expect(API_BASE_URL).toBeDefined();
  });

  it('can be provided and injected', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: API_BASE_URL, useValue: 'http://localhost:5256' }],
    });

    const url = TestBed.inject(API_BASE_URL);
    expect(url).toBe('http://localhost:5256');
  });
});
