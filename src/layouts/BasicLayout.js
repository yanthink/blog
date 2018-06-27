import React from 'react';
import { connect } from 'dva';
import { routerRedux, Link, Redirect, Switch, Route } from 'dva/router';
import { stringify } from 'qs';
import pathToRegexp from 'path-to-regexp';
import DocumentTitle from 'react-document-title';
import { ContainerQuery } from 'react-container-query';
import classNames from 'classnames';
import { Layout, Menu, BackTop } from 'antd';
import HeaderSearch from 'components/HeaderSearch';
import NotFound from 'routes/Exception/404';
import { getRoutes } from 'utils/utils';
import styles from './BasicLayout.less';

const { Header, Content, Footer } = Layout;

const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
  },
};

@connect()
export default class BasicLayout extends React.PureComponent {
  getPageTitle() {
    const { routerData, location } = this.props;
    const { pathname } = location;
    let title = '我的的网络日志';
    let currRouterData = null;
    // match params path
    Object.keys(routerData).forEach(key => {
      if (pathToRegexp(key).test(pathname)) {
        currRouterData = routerData[key];
      }
    });
    if (currRouterData && currRouterData.name) {
      title = `${currRouterData.name} - 我的的网络日志`;
    }
    return title;
  }

  handleSearch = value => {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: '/article/search',
        search: stringify({
          keyword: value,
        }),
      })
    );
  };

  render() {
    const { routerData, match } = this.props;

    const layout = (
      <Layout className={styles.layout}>
        <Header className={styles.header}>
          <div>
            <div className={styles.logo} />
            <div className={styles.right}>
              <HeaderSearch
                className={`${styles.action} ${styles.search}`}
                placeholder="站内搜索"
                dataSource={['php', 'laravel', 'react']}
                onPressEnter={this.handleSearch}
              />
            </div>
            <Menu
              className={styles.menu}
              theme="light"
              mode="horizontal"
              defaultSelectedKeys={['2']}
            >
              <Menu.Item key="1">
                <Link to="/">首页</Link>
              </Menu.Item>
              <Menu.Item key="2">
                <Link to="/article/list">全部文章</Link>
              </Menu.Item>
            </Menu>
          </div>
        </Header>
        <Content className={styles.content}>
          <div style={{ minHeight: 280 }}>
            <Switch>
              {getRoutes(match.path, routerData).map(item => (
                <Route
                  key={item.key}
                  path={item.path}
                  component={item.component}
                  exact={item.exact}
                />
              ))}
              <Redirect exact from="/" to="/article/list" />
              <Redirect exact from="/article" to="/article/list" />
              <Route render={NotFound} />
            </Switch>
          </div>
        </Content>
        <Footer className={styles.footer}>
          <div>©2018 Created by Yanthink</div>
        </Footer>
        <BackTop />
      </Layout>
    );

    return (
      <DocumentTitle title={this.getPageTitle()}>
        <ContainerQuery query={query}>
          {params => <div className={styles[classNames(params)]}>{layout}</div>}
        </ContainerQuery>
      </DocumentTitle>
    );
  }
}
