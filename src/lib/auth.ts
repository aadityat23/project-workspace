/**
 * Demo authentication layer. Kept separate from the mock data service so it can be
 * swapped for a real provider: replace these three functions, keep the signatures.
 */
export interface Session {
  email: string;
  signedInAt: string;
}

const KEY = "acl.session";
type Listener = () => void;
const listeners = new Set<Listener>();

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export async function signIn(email: string, password: string): Promise<Session> {
  if (!email.trim() || !password) throw new Error("Enter your email and password.");
  await new Promise((r) => setTimeout(r, 450));
  const session = { email: email.trim(), signedInAt: new Date().toISOString() };
  window.localStorage.setItem(KEY, JSON.stringify(session));
  listeners.forEach((l) => l());
  return session;
}

export function signOut() {
  window.localStorage.removeItem(KEY);
  listeners.forEach((l) => l());
}

export function onSessionChange(listener: Listener) {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}
