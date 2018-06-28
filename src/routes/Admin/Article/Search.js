import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Form, Card, List, Tag, Icon, Avatar, Button, Pagination } from 'antd';
import PageHeaderLayout from 'layouts/Admin/PageHeaderLayout';
import { parse } from 'qs';
import { get } from 'lodash';
import Ellipsis from 'components/Ellipsis';
import styles from './Search.less';

const defaultQueryParams = {
  include: 'author,tags',
  pageSize: 5,
};
const loadMorePage = 0;

@Form.create()
@connect(({ adminArticle, loading }) => ({ adminArticle, loading }))
export default class ArticleSearch extends PureComponent {
  constructor (props) {
    super(props);
    const { location: { search } } = this.props;
    const query = parse(search.substr(1));

    this.state = {
      search: query,
    };
  }

  async componentWillMount () {
    this.handleSearch();
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.location.search !== this.props.location.search) {
      const { location: { search } } = nextProps;
      const query = parse(search.substr(1));

      this.setState({ search: query }, this.handleSearch);
    }
  }

  handleSearch = () => {
    const { dispatch } = this.props;
    const { search } = this.state;

    dispatch({
      type: 'adminArticle/fetch',
      payload: {
        ...defaultQueryParams,
        ...search,
      },
    });
  };

  fetchMore = page => {
    const { dispatch, adminArticle: { pagination } } = this.props;
    const { search } = this.state;

    const current = typeof page === 'number' ? page : pagination.current;

    const effect =
      typeof page === 'number' || (current && current >= loadMorePage)
        ? 'adminArticle/fetch'
        : 'adminArticle/appendFetch';

    dispatch({
      type: effect,
      payload: {
        ...defaultQueryParams,
        ...search,
        page: current,
        pageSize: pagination.pageSize,
      },
    });
  };

  renderLoadMore = () => {
    const { adminArticle: { data, pagination }, loading } = this.props;
    if (data.length === 0) {
      return null;
    }

    if (pagination.current && pagination.current >= loadMorePage) {
      return (
        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <Pagination showQuickJumper {...pagination} onChange={this.fetchMore} />
        </div>
      );
    }

    return (
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Button onClick={this.fetchMore} style={{ paddingLeft: 48, paddingRight: 48 }}>
          {loading.effects['adminArticle/appendFetch'] ? (
            <span>
              <Icon type="loading" /> 加载中...
            </span>
          ) : (
            '加载更多'
          )}
        </Button>
      </div>
    );
  };

  render () {
    const { adminArticle: { data, pagination }, loading } = this.props;
    const { search } = this.state;

    const IconText = ({ type, text }) => (
      <span>
        <Icon type={type} style={{ marginRight: 8 }} />
        {text}
      </span>
    );

    const ListContent = ({ data: article }) => (
      <div className={styles.listContent}>
        <div className={styles.description}>
          <Ellipsis lines={3}>
            {article.highlight.content
              ? article.highlight.content.map((html, key) =>
                (
                  <span
                    key={key}
                    dangerouslySetInnerHTML={{ // eslint-disable-line
                      __html: html,
                    }}
                  />
                ))
              : article.description}
          </Ellipsis>
        </div>
        <div className={styles.extra}>
          <Avatar size="small" icon="user" />
          <Link to={`/admin/article/list?author_id=${get(article, 'author.id')}`}>
            {get(article, 'author.name')}
          </Link>
          &nbsp;&nbsp;发布在&nbsp;&nbsp;
          <Link to={`/admin/article/${article.id}/details`}>
            {window.location.hostname}
            {window.location.port === 80 ? '' : `:${window.location.port}`}
            {`/admin/article/${article.id}/details`}
          </Link>
          <em>{article.updated_at}</em>
        </div>
      </div>
    );

    return (
      <PageHeaderLayout
        title="文章列表"
        action={
          <Link to="/admin/article/create">
            <Button type="primary" icon="file-add">
              发布文章
            </Button>
          </Link>
        }
      >
        <Card title={`关于 “${search.keyword}” 的搜索结果, 共 ${pagination.total} 条`} bordered={false}>
          <List
            size="large"
            loading={loading.effects['adminArticle/fetch']}
            rowKey={record => record.id}
            itemLayout="vertical"
            dataSource={data}
            loadMore={this.renderLoadMore()}
            renderItem={article => (
              <List.Item
                key={article.id}
                actions={[
                  <IconText type="star-o" text={999} />,
                  <IconText type="like-o" text={999} />,
                  <IconText type="message" text={999} />,
                ]}
                extra={
                  <div className={styles.listItemExtra}>
                    {article.preview && <img src={article.preview} alt="预览" />}
                  </div>
                }
              >
                <List.Item.Meta
                  title={
                    <Link
                      className={styles.listItemMetaTitle}
                      to={`/admin/article/${article.id}/details`}
                    >
                      {article.highlight.title
                        ? article.highlight.title.map((html, key) =>
                          (
                            <span
                              key={key}
                              dangerouslySetInnerHTML={{
                                // eslint-disable-line
                                __html: html,
                              }}
                            />
                          ))
                        : article.title}
                    </Link>
                  }
                  description={
                    <span>
                      {article.tags.map(tag => (
                        <Link key={tag.id} to={`/admin/article/list?tags[0]=${tag.id}`}>
                          <Tag>{tag.name}</Tag>
                        </Link>
                      ))}
                    </span>
                  }
                />
                <ListContent data={article} />
              </List.Item>
            )}
          />
        </Card>
      </PageHeaderLayout>
    );
  }
}
