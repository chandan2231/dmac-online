export const SCREENING_USER_STORAGE_KEY = 'dmac_screening_user';

export type ScreeningUser = {
  id: number;
  name: string;
  email: string;
  verified: boolean;
  patient_meta?: string | null;
};

export const getScreeningUser = (): ScreeningUser | null => {
  try {
    const raw = localStorage.getItem(SCREENING_USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ScreeningUser;
  } catch {
    return null;
  }
};

export const setScreeningUser = (user: ScreeningUser) => {
  localStorage.setItem(SCREENING_USER_STORAGE_KEY, JSON.stringify(user));
  // Force in-app listeners to re-check verification state.
  try {
    window.dispatchEvent(new Event('screeningUserChanged'));
  } catch {
    // ignore
  }
};

export const clearScreeningUser = () => {
  localStorage.removeItem(SCREENING_USER_STORAGE_KEY);
  try {
    window.dispatchEvent(new Event('screeningUserChanged'));
  } catch {
    // ignore
  }
};

export const getScreeningUserId = (): number => {
  const user = getScreeningUser();
  return user?.id ? Number(user.id) : 0;
};

export const isScreeningUserVerified = (): boolean => {
  const user = getScreeningUser();
  return Boolean(user?.verified);
};
