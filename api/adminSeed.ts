export interface AdminSeedConfig {
  email: string;
  name: string;
  passwordHash: string;
}

export function getAdminSeedConfig(
  env: Record<string, string | undefined>,
): AdminSeedConfig | null {
  const email = env.ADMIN_EMAIL?.trim();
  const passwordHash = env.ADMIN_PASSWORD_HASH?.trim();

  if (!email || !passwordHash) {
    return null;
  }

  return {
    email,
    name: env.ADMIN_NAME?.trim() || 'Admin',
    passwordHash,
  };
}
