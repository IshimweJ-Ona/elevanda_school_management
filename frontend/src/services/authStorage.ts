const AUTH_TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'userData';

export const authStorage = {
  getToken() {
    return sessionStorage.getItem(AUTH_TOKEN_KEY);
  },

  getUserData() {
    return sessionStorage.getItem(USER_DATA_KEY);
  },

  setSession(token: string, user: unknown) {
    sessionStorage.setItem(AUTH_TOKEN_KEY, token);
    sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  },

  updateUserData(user: unknown) {
    sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  },

  clear() {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(USER_DATA_KEY);
  },

  clearLegacyLocalStorage() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  },
};
