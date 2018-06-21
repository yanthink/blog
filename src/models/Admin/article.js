import {
  queryArticle,
  queryArticleDetails,
  addArticle,
  removeArticle,
  updateArticle,
} from 'services/Admin/api';

export default {
  namespace: 'adminArticle',
  state: {
    data: [],
    pagination: {},
    details: {},
  },
  effects: {
    * fetch({ payload }, { call, put }) {
      const response = yield call(queryArticle, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    * appendFetch({ payload }, { select, call, put }) {
      const state = yield select(({ adminArticle }) => adminArticle);
      const { data, pagination } = yield call(queryArticle, {
        ...payload,
        page: (state.pagination.current ? state.pagination.current : 0) + 1,
      });

      yield put({
        type: 'save',
        payload: {
          data: state.data.concat(data),
          pagination,
        },
      });
    },
    * queryDetails({ id, payload, callback }, { call, put }) {
      const { data: details } = yield call(queryArticleDetails, id, payload);
      yield put({
        type: 'save',
        payload: { details },
      });
      if (callback) callback();
    },
    * add({ payload, callback }, { call }) {
      yield call(addArticle, payload);
      if (callback) callback();
    },
    * update({ id, payload, callback }, { call }) {
      yield call(updateArticle, id, payload);
      if (callback) callback();
    },
    * remove({ id, callback }, { call }) {
      yield call(removeArticle, id);
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
