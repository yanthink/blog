import { createElement } from 'react';
import dynamic from 'dva/dynamic';
import pathToRegexp from 'path-to-regexp';
import { getAdminMenuData } from './Admin/menu';

let routerDataCache;

const modelNotExisted = (app, model) =>
  // eslint-disable-next-line
  !app._models.some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  });

// wrapper of dynamic
const dynamicWrapper = (app, models, component) => {
  // () => require('module')
  // transformed by babel-plugin-dynamic-import-node-sync
  if (component.toString().indexOf('.then(') < 0) {
    models.forEach(model => {
      if (modelNotExisted(app, model)) {
        // eslint-disable-next-line
        app.model(require(`models/${model}`).default);
      }
    });
    return props => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return createElement(component().default, {
        ...props,
        routerData: routerDataCache,
      });
    };
  }
  // () => import('module')
  return dynamic({
    app,
    models: () =>
      models.filter(model => modelNotExisted(app, model)).map(m => import(`models/${m}.js`)),
    // add routerData prop
    component: () => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return component().then(raw => {
        const Component = raw.default || raw;
        return props =>
          createElement(Component, {
            ...props,
            routerData: routerDataCache,
          });
      });
    },
  });
};

function getFlatMenuData(menus) {
  let keys = {};
  menus.forEach(item => {
    if (item.children) {
      keys[item.path] = { ...item };
      keys = { ...keys, ...getFlatMenuData(item.children) };
    } else {
      keys[item.path] = { ...item };
    }
  });
  return keys;
}

export const getRouterData = app => {
  const routerConfig = {
    '/': {
      component: dynamicWrapper(app, [], () => import('layouts/BasicLayout')),
    },
    '/article/list': {
      component: dynamicWrapper(app, ['article'], () => import('routes/Article/List')),
    },
    '/article/search': {
      component: dynamicWrapper(app, ['article'], () => import('routes/Article/Search')),
    },
    '/article/:id/details': {
      component: dynamicWrapper(app, ['article'], () => import('routes/Article/Details')),
    },
    '/admin': {
      component: dynamicWrapper(app, ['Admin/user', 'Admin/login'], () =>
        import('layouts/Admin/BasicLayout')
      ),
    },
    '/admin/article/list': {
      component: dynamicWrapper(app, ['Admin/article'], () => import('routes/Admin/Article/List')),
    },
    '/admin/article/create': {
      component: dynamicWrapper(app, ['Admin/article'], () =>
        import('routes/Admin/Article/Create')
      ),
    },
    '/admin/article/search': {
      component: dynamicWrapper(app, ['Admin/article'], () =>
        import('routes/Admin/Article/Search')
      ),
    },
    '/admin/article/:id/edit': {
      component: dynamicWrapper(app, ['Admin/article'], () => import('routes/Admin/Article/Edit')),
    },
    '/admin/article/:id/details': {
      component: dynamicWrapper(app, ['Admin/article'], () =>
        import('routes/Admin/Article/Details')
      ),
    },
    '/admin/user/list': {
      component: dynamicWrapper(app, ['Admin/user'], () => import('routes/Admin/User/List')),
    },
    '/admin/role/list': {
      component: dynamicWrapper(app, ['Admin/role'], () => import('routes/Admin/Role/List')),
    },
    '/admin/permission/list': {
      component: dynamicWrapper(app, ['Admin/permission'], () =>
        import('routes/Admin/Permission/List')
      ),
    },
    '/admin/auth': {
      component: dynamicWrapper(app, [], () => import('layouts/Admin/AuthLayout')),
    },
    '/admin/auth/login': {
      component: dynamicWrapper(app, ['Admin/login'], () => import('routes/Admin/Auth/Login')),
    },
    '/admin/exception/403': {
      component: dynamicWrapper(app, [], () => import('routes/Admin/Exception/403')),
    },
    '/admin/exception/404': {
      component: dynamicWrapper(app, [], () => import('routes/Admin/Exception/404')),
    },
    '/admin/exception/500': {
      component: dynamicWrapper(app, [], () => import('routes/Admin/Exception/500')),
    },
  };
  // Get name from ./menu.js or just set it in the router data.
  const adminMenuData = getFlatMenuData(getAdminMenuData());

  // Route configuration data
  // eg. {name,authority ...routerConfig }
  const routerData = {};
  // The route matches the menu
  Object.keys(routerConfig).forEach(path => {
    // Regular match item name
    // eg.  router /user/:id === /user/chen
    const pathRegexp = pathToRegexp(path);
    const menuKey = Object.keys(adminMenuData).find(key => pathRegexp.test(`${key}`));
    let adminMenuItem = {};
    // If menuKey is not empty
    if (menuKey) {
      adminMenuItem = adminMenuData[menuKey];
    }
    let router = routerConfig[path];
    // If you need to configure complex parameter routing,
    // https://github.com/ant-design/ant-design-pro-site/blob/master/docs/router-and-nav.md#%E5%B8%A6%E5%8F%82%E6%95%B0%E7%9A%84%E8%B7%AF%E7%94%B1%E8%8F%9C%E5%8D%95
    // eg . /list/:type/user/info/:id
    router = {
      ...router,
      name: router.name || adminMenuItem.name,
      authority: router.authority || adminMenuItem.authority,
      hideInBreadcrumb: router.hideInBreadcrumb || adminMenuItem.hideInBreadcrumb,
    };
    routerData[path] = router;
  });
  return routerData;
};
