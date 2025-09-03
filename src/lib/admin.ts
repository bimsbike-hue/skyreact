export const ADMIN_EMAILS = ["youradmin@gmail.com"]; // replace with your admin account

export function isAdmin(email?: string | null) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}
