import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Card, message } from 'antd';
import PageHeaderLayout from 'layouts/Admin/PageHeaderLayout';
import Form from './Form';

@connect(({ adminArticle, loading }) => ({ adminArticle, loading }))
export default class ArticleCreate extends PureComponent {
  state = {
    formData: {
      status: 1,
    },
    dataLoaded: true,
  };

  render () {
    const { loading, dispatch } = this.props;
    const { formData, dataLoaded } = this.state;
    const formProps = {
      formData,
      submitLoading: loading.effects['adminArticle/add'],
      dataLoaded,
      onSubmit (data) {
        const { callback, ...payload } = data;
        dispatch({
          type: 'adminArticle/add',
          payload,
          callback () {
            if (typeof callback === 'function') {
              callback();
            }
            message.success('添加成功');
            dispatch(routerRedux.push('/admin/article/list'));
          },
        });
      },
    };

    return (
      <PageHeaderLayout
        title="文章发布"
        breadcrumbList={[
          {
            title: '首页',
            href: '/',
          },
          {
            title: '文章列表',
            href: '/admin/article/list',
          },
          {
            title: '文章发布',
            href: this.props.location.pathname,
          },
        ]}
      >
        <Card bordered={false}>
          <Form {...formProps} />
        </Card>
      </PageHeaderLayout>
    );
  }
}
