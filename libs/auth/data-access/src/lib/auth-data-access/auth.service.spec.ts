import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@invenet/core';

const mockAuth = {
  onAuthStateChange: vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } },
  })),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
  resend: vi.fn(),
  getSession: vi.fn(),
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ auth: mockAuth })),
}));

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    TestBed.configureTestingModule({
      providers: [
        { provide: SUPABASE_URL, useValue: 'https://test.supabase.co' },
        { provide: SUPABASE_ANON_KEY, useValue: 'anon-key' },
      ],
    });
    service = TestBed.inject(AuthService);
  });

  it('resolves on successful login', async () => {
    mockAuth.signInWithPassword.mockResolvedValue({ data: {}, error: null });

    await expect(
      new Promise((resolve, reject) =>
        service
          .login({ email: 'user@example.com', password: 'Password123!' })
          .subscribe({ next: resolve, error: reject }),
      ),
    ).resolves.toBeUndefined();

    expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'Password123!',
    });
  });

  it('errors when Supabase returns an auth error', async () => {
    const authError = { message: 'Invalid login credentials' };
    mockAuth.signInWithPassword.mockResolvedValue({
      data: {},
      error: authError,
    });

    await expect(
      new Promise((resolve, reject) =>
        service
          .login({ email: 'user@example.com', password: 'wrong' })
          .subscribe({ next: resolve, error: reject }),
      ),
    ).rejects.toBe(authError);
  });

  it('returns null access token when there is no session', async () => {
    mockAuth.getSession.mockResolvedValue({ data: { session: null } });

    await expect(service.getAccessToken()).resolves.toBeNull();
  });

  it('returns the access token from the current session', async () => {
    mockAuth.getSession.mockResolvedValue({
      data: { session: { access_token: 'token-123' } },
    });

    await expect(service.getAccessToken()).resolves.toBe('token-123');
  });

  it('signs out on logout', async () => {
    mockAuth.signOut.mockResolvedValue({ error: null });

    await new Promise((resolve, reject) =>
      service.logout().subscribe({ next: resolve, error: reject }),
    );

    expect(mockAuth.signOut).toHaveBeenCalled();
  });
});
