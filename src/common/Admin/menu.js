import { isUrl } from '../../utils/utils';
import { havePermission } from '../../utils/authority';

const menuData = [
  {
    name: 'dashboard',
    icon: 'dashboard',
    path: 'admin/dashboard',
  },
  {
    name: '文章管理',
    icon: 'edit',
    path: 'admin/article/list',
    authority: havePermission('article.index'),
  },
  {
    name: '用户管理',
    icon: 'user',
    path: 'admin/user/list',
    authority: havePermission('user.index'),
  },
  {
    name: '角色管理',
    icon: 'idcard',
    path: 'admin/role/list',
    authority: havePermission('role.index'),
  },
  {
    name: '权限管理',
    icon: 'safety',
    path: 'admin/permission/list',
    authority: havePermission('permission.index'),
  },
];

function formatter(data, parentPath = '/', parentAuthority) {
  return data.map(item => {
    let { path } = item;
    if (!isUrl(path)) {
      path = parentPath + item.path;
    }
    const result = {
      ...item,
      path,
      authority: item.authority || parentAuthority,
    };
    if (item.children) {
      result.children = formatter(item.children, `${parentPath}${item.path}/`, item.authority);
    }
    return result;
  });
}

export const getAdminMenuData = () => formatter(menuData);
