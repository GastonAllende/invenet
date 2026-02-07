export interface TestUser {
  email: string;
  username: string;
  password: string;
}

export function generateTestUser(): TestUser {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);

  return {
    email: `test.user.${timestamp}.${random}@example.com`,
    username: `testuser${timestamp}${random}`,
    password: 'Test123456!',
  };
}

export function generateTestEmail(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `test.${timestamp}.${random}@example.com`;
}
