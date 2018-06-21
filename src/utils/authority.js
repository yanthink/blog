// use localStorage to store the authority info, which might be sent from server in actual project.
let token = null;

export function getToken() {
  if (token === null) {
    token = (localStorage.getItem('token') || '||').split('|');
  }
  return token;
}

export function setToken(accessToken = '', tokenType = '', expiresIn = '') {
  token = [accessToken, tokenType, expiresIn];
  return localStorage.setItem('token', token.join('|'));
}

export function getAuthorization() {
  getToken();
  return [token[1], token[0]].filter(_ => _).join(' ');
}

export function getAuthority() {
  return localStorage.getItem('authority') || 'guest';
}

export function setAuthority(authority) {
  return localStorage.setItem('authority', authority);
}

export function havePermission(permission, requireAll = false) {
  return function authority(currentAuthority) {
    if (Array.isArray(permission)) {
      for (const p of permission) {
        const hasPerm = havePermission(p);
        if (hasPerm && !requireAll) {
          return true;
        } else if (!hasPerm && requireAll) {
          return false;
        }
      }
      return requireAll;
    }

    return currentAuthority.indexOf(`${permission}|`) > -1;
  };
}
