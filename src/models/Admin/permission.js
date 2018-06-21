import {
  queryPermission,
  addPermission,
  updatePermission,
  removePermission,
} from 'services/Admin/api';

export default {
  namespace: 'adminPermission',
  state: {
    data: [],
    pagination: {},
  },
  effects: {
    * fetch({ payload }, { call, put }) {
      const response = yield call(queryPermission, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    * add({ payload, callback }, { call }) {
      yield call(addPermission, payload);
      if (callback) callback();
    },
    * update({ id, payload, callback }, { call }) {
      yield call(updatePermission, id, payload);
      if (callback) callback();
    },
    * remove({ payload, callback }, { call }) {
      yield call(removePermission, payload);
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
