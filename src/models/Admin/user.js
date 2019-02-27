import {
  queryUser,
  queryCurrentUser,
  addUser,
  updateUser,
  removeUser,
  userAssignRoles,
  userAssignPermissions,
} from 'services/Admin/api';

export default {
  namespace: 'adminUser',
  state: {
    currentUser: {},
    data: [],
    pagination: {},
  },
  effects: {
    * fetch({ payload }, { call, put }) {
      const response = yield call(queryUser, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    * fetchCurrent(_, { call, put }) {
      const { data: currentUser } = yield call(queryCurrentUser);
      yield put({
        type: 'save',
        payload: { currentUser },
      });
    },
    * add({ payload, callback }, { call }) {
      yield call(addUser, payload);
      if (callback) callback();
    },
    * update({ id, payload, callback }, { call }) {
      yield call(updateUser, id, payload);
      if (callback) callback();
    },
    * remove({ payload, callback }, { call }) {
      yield call(removeUser, payload);
      if (callback) callback();
    },
    * assignRoles({ id, payload, callback }, { call }) {
      yield call(userAssignRoles, id, payload);
      if (callback) callback();
    },
    * assignPermissions({ id, payload, callback }, { call }) {
      yield call(userAssignPermissions, id, payload);
      if (callback) callback();
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
