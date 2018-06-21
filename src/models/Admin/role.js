import {
  queryRole,
  addRole,
  updateRole,
  removeRole,
  roleAssignPermissions,
} from 'services/Admin/api';

export default {
  namespace: 'adminRole',
  state: {
    data: [],
    pagination: {},
  },
  effects: {
    * fetch({ payload }, { call, put }) {
      const response = yield call(queryRole, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    * add({ payload, callback }, { call }) {
      yield call(addRole, payload);
      if (callback) callback();
    },
    * update({ id, payload, callback }, { call }) {
      yield call(updateRole, id, payload);
      if (callback) callback();
    },
    * remove({ payload, callback }, { call }) {
      yield call(removeRole, payload);
      if (callback) callback();
    },
    * assignPermissions({ id, payload, callback }, { call }) {
      yield call(roleAssignPermissions, id, payload);
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
