import React from 'react';
import { Helmet } from 'react-helmet';
import { routerRedux, Route, Switch } from 'dva/router';
import { LocaleProvider, Spin } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import dynamic from 'dva/dynamic';
import { getRouterData } from 'common/router';
import Authorized from 'utils/Authorized';
import { getToken } from 'utils/authority';
import styles from './index.less';

const { ConnectedRouter } = routerRedux;
const { AuthorizedRoute } = Authorized;
dynamic.setDefaultLoadingComponent(() => {
  return <Spin size="large" className={styles.globalSpin} />;
});

function loggedIn (currentAuthority) {
  if (currentAuthority === 'guest' || !getToken()[0]) {
    return false;
  }
  return !!currentAuthority;
}

const cssMap = [];
const jsMap = [];
if (process.env.NODE_ENV !== 'production') {
  cssMap.unshift('/_debugbar/assets/stylesheets');
  jsMap.unshift('/_debugbar/assets/javascript', '/_debugbar/render');
} else if (location.host === 'www.einsition.com') {
  window._hmt = window._hmt || []; // eslint-disable-line
  // 百度统计
  jsMap.push('https://hm.baidu.com/hm.js?ac1bc08008f195f8b3c753b4b718104b');
}

function RouterConfig ({ history, app }) {
  const routerData = getRouterData(app);
  const BasicLayout = routerData['/'].component;
  const AdminAuthLayout = routerData['/admin/auth'].component;
  const AdminBasicLayout = routerData['/admin'].component;
  return (
    <div>
      <Helmet>
        {cssMap && cssMap.map((_, k) => <link rel="stylesheet" href={_} key={k} />)}
        {jsMap && jsMap.map((_, k) => <script type="text/javascript" src={_} key={k} />)}
      </Helmet>
      <LocaleProvider locale={zhCN}>
        <ConnectedRouter history={history}>
          <Switch>
            <Route path="/admin/auth" component={AdminAuthLayout} />
            <AuthorizedRoute
              path="/admin"
              render={props => <AdminBasicLayout {...props} />}
              authority={loggedIn}
              redirectPath="/admin/auth/login"
            />
            <Route path="/" component={BasicLayout} />
          </Switch>
        </ConnectedRouter>
      </LocaleProvider>
    </div>
  );
}

export default RouterConfig;
