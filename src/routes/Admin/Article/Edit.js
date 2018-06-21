import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Card, message } from 'antd';
import PageHeaderLayout from 'layouts/Admin/PageHeaderLayout';
import { queryArticleDetails } from 'services/Admin/api';
import Form from './Form';

@connect(({ loading }) => ({ loading }))
export default class ArticleEdit extends PureComponent {
  state = {
    formData: {
      status: 1,
    },
  };

  async componentWillMount() {
    const { data: { tags, ...article } } = await queryArticleDetails(this.props.match.params.id, {
      include: 'tags',
    });
    this.setState({
      formData: {
        ...article,
        tags: tags.map(tag => tag.id),
      },
    });
  }

  render() {
    const { loading, dispatch } = this.props;
    const formProps = {
      formData: this.state.formData,
      submitLoading: loading.effects['adminArticle/update'],
      onSubmit: payload => {
        dispatch({
          type: 'adminArticle/update',
          id: this.props.match.params.id,
          payload,
          callback() {
            message.success('更新成功');
            dispatch(routerRedux.push('/admin/article/list'));
          },
        });
      },
    };

    return (
      <PageHeaderLayout
        title="文章编辑"
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
            title: '文章编辑',
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
