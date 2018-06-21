import { stringify } from 'qs';
import request from 'utils/request';

export async function queryArticle(params) {
  return request(`/api/admin/article?${stringify(params)}`);
}

export async function queryArticleDetails(id, params) {
  return request(`/api/admin/article/${id}?${stringify(params)}`);
}

export async function queryAllTags(params) {
  return request(`/api/admin/tags?${stringify(params)}`);
}

export async function addTags(params) {
  return request('/api/admin/tags', {
    method: 'POST',
    body: params,
  });
}

export async function addArticle(params) {
  return request('/api/admin/article', {
    method: 'POST',
    body: params,
  });
}

export async function updateArticle(id, params) {
  return request(`/api/admin/article/${id}`, {
    method: 'PUT',
    body: params,
  });
}

export async function removeArticle(id) {
  return request(`/api/admin/article/${id}`, {
    method: 'DELETE',
  });
}

export async function queryUser(params) {
  return request(`/api/admin/user?${stringify(params)}`);
}

export async function addUser(params) {
  return request('/api/admin/user', {
    method: 'POST',
    body: params,
  });
}

export async function updateUser(id, params) {
  return request(`/api/admin/user/${id}`, {
    method: 'PUT',
    body: params,
  });
}

export async function removeUser(id) {
  return request(`/api/admin/user/${id}`, {
    method: 'DELETE',
  });
}

export async function queryCurrentUser() {
  return request('/api/admin/user/current');
}

export async function queryUserRoles(id, params) {
  return request(`/api/admin/user/${id}/roles?${stringify(params)}`);
}

export async function userAssignRoles(id, params) {
  return request(`/api/admin/user/${id}/assign-roles`, {
    method: 'POST',
    body: params,
  });
}

export async function queryRole(params) {
  return request(`/api/admin/role?${stringify(params)}`);
}

export async function addRole(params) {
  return request('/api/admin/role', {
    method: 'POST',
    body: params,
  });
}

export async function updateRole(id, params) {
  return request(`/api/admin/role/${id}`, {
    method: 'PUT',
    body: params,
  });
}

export async function removeRole(id) {
  return request(`/api/admin/role/${id}`, {
    method: 'DELETE',
  });
}

export async function roleAssignPermissions(id, params) {
  return request(`/api/admin/role/${id}/assign-permissions`, {
    method: 'POST',
    body: params,
  });
}

export async function queryAllRoles(params) {
  return request(`/api/admin/roles?${stringify(params)}`);
}

export async function queryRolePermissions(id, params) {
  return request(`/api/admin/role/${id}/permissions?${stringify(params)}`);
}

export async function queryPermission(params) {
  return request(`/api/admin/permission?${stringify(params)}`);
}

export async function addPermission(params) {
  return request('/api/admin/permission', {
    method: 'POST',
    body: params,
  });
}

export async function updatePermission(id, params) {
  return request(`/api/admin/permission/${id}`, {
    method: 'PUT',
    body: params,
  });
}

export async function removePermission(id) {
  return request(`/api/admin/permission/${id}`, {
    method: 'DELETE',
  });
}

export async function queryAllPermissions(params) {
  return request(`/api/admin/permissions?${stringify(params)}`);
}

export async function queryNotices() {
  return { data: { notices: [] } };
}

export async function login(params) {
  return request('/api/admin/auth/login', {
    method: 'POST',
    body: params,
  });
}

export async function logout() {
  return request('/api/admin/auth/logout');
}
