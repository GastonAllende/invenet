import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { API_BASE_URL, SUPABASE_ANON_KEY, SUPABASE_URL } from '@invenet/core';
import { AppLayout } from './shared-feature-shell';

describe('SharedFeatureShell', () => {
  let component: AppLayout;
  let fixture: ComponentFixture<AppLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppLayout],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: API_BASE_URL, useValue: 'http://localhost' },
        { provide: SUPABASE_URL, useValue: 'https://test.supabase.co' },
        { provide: SUPABASE_ANON_KEY, useValue: 'test-anon-key' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
