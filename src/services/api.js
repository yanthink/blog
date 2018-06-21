import { stringify } from 'qs';
import request from 'utils/request';

export async function queryArticle(params) {
  return request(`/api/article?${stringify(params)}`);
}

export async function queryArticleDetails(id, params) {
  return request(`/api/article/${id}?${stringify(params)}`);
}

export async function queryAllTags(params) {
  return request(`/api/tags?${stringify(params)}`);
}

export async function queryUser(params) {
  return request(`/api/user?${stringify(params)}`);
}

export async function queryCurrentUser() {
  return request('/api/user/current');
}

export async function queryNotices() {
  return { data: { notices: [] } };
}

export async function login(params) {
  return request('/api/auth/login', {
    method: 'POST',
    body: params,
  });
}

export async function logout() {
  return request('/api/auth/logout');
}
