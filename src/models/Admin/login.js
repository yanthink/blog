import { routerRedux } from 'dva/router';
import { login } from 'services/Admin/api';
import { setAuthority, setToken } from 'utils/authority';
import { reloadAuthorized } from 'utils/Authorized';

export default {
  namespace: 'adminLogin',
  state: {},
  effects: {
    * login({ payload }, { call, put }) {
      const { data } = yield call(login, payload);
      const { permissions, access_token: token, token_type: type, expires_in: expires } = data;

      const authority = Array.isArray(permissions)
        ? `${permissions.filter(_ => _).join('|')}|`
        : permissions;

      // Login successfully
      setToken(token, type, expires);
      setAuthority(authority);
      reloadAuthorized();
      yield put(routerRedux.push('/admin'));
    },
    * logout(_, { put, select }) {
      try {
        // yield call(logout);
        // get location pathname
        const urlParams = new URL(window.location.href);
        const pathname = yield select(state => state.routing.location.pathname);
        // add the parameters in the url
        urlParams.searchParams.set('redirect', pathname);
        window.history.replaceState(null, 'login', urlParams.href);
      } finally {
        setToken();
        setAuthority('guest');
        reloadAuthorized();
        yield put(routerRedux.push('/admin/auth/login'));
      }
    },
  },
};
