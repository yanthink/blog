import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {
  Form,
  Breadcrumb,
  Card,
  List,
  Tag,
  Icon,
  Button,
  Pagination,
} from 'antd';
import DocumentTitle from 'react-document-title';
import { parse, stringify } from 'qs';
import { get } from 'lodash';
import TagSelect from 'components/TagSelect';
import StandardFormRow from 'components/StandardFormRow';
import Ellipsis from 'components/Ellipsis';
import { getDateDiff, formatReadCount } from 'utils/utils';
import { queryAllTags } from 'services/api';
import styles from './List.less';

const FormItem = Form.Item;

const defaultQueryParams = {
  include: 'author,tags',
  pageSize: 5,
};
const loadMorePage = 0;

@Form.create()
@connect(({ article, loading }) => ({ article, loading }))
export default class ArticleList extends PureComponent {
  constructor (props) {
    super(props);
    const { location: { search } } = this.props;
    const query = parse(search.substr(1));

    this.state = {
      search: { tags: [], ...query },
      allTags: [],
    };
  }

  async componentWillMount () {
    this.handleSearch();

    const { data: allTags } = await queryAllTags();
    this.setState({ allTags });
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.location.search !== this.props.location.search) {
      const { location: { search } } = nextProps;
      const query = parse(search.substr(1));

      this.setState({ search: { tags: [], ...query } }, this.handleSearch);
    }
  }

  handleSearch = () => {
    const { dispatch, form } = this.props;
    const { search } = this.state;

    form.validateFields((err, values) => {
      if (err) return;

      this.setState({
        search: {
          ...search,
          ...values.search,
        },
      });

      dispatch({
        type: 'article/fetch',
        payload: {
          ...defaultQueryParams,
          ...search,
          ...values.search,
        },
      });
    });
  };

  handleTagChange = tags => {
    const { search } = this.state;
    this.setState({ search: { ...search, tags } }, this.handleSearch);
  };

  fetchMore = page => {
    const { dispatch, article: { pagination } } = this.props;
    const { search } = this.state;

    const current = (typeof page === 'number') ? page : pagination.current;

    const effect = (
      typeof page === 'number'
      || current
      && current >= loadMorePage
    ) ? 'article/fetch' : 'article/appendFetch';

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
    const { article: { data, pagination }, loading, location } = this.props;
    const { search } = this.state;
    if (data.length === 0) {
      return null;
    }

    if (pagination.current && pagination.current >= loadMorePage) {
      pagination.itemRender = (page, type, originalElement) => {
        return (
          <Link
            {...originalElement.props}
            to={`${location.pathname}?${stringify({ ...search, page })}`}
          >
            {type === 'page' && page}
          </Link>
        );
      };

      return (
        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <Pagination
            showQuickJumper
            {...pagination}
            onChange={this.fetchMore}
          />
        </div>
      );
    }

    return (
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Button onClick={this.fetchMore} style={{ paddingLeft: 48, paddingRight: 48 }}>
          {loading.effects['article/appendFetch'] ? (
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
    const { form, article: { data }, loading } = this.props;
    const { getFieldDecorator } = form;

    const ListContent = ({ data: article }) => (
      <div className={styles.listContent}>
        <Ellipsis className={styles.description} lines={3}>{article.description}</Ellipsis>
        <div className={styles.extra}>
          <Link style={{ color: 'inherit' }} to={`/article/list?author_id=${get(article, 'author.id')}`}>
            <Icon type="user" style={{ marginRight: 4 }} />
            {get(article, 'author.name')}
          </Link>
          <span style={{ marginLeft: 12 }}>
            <Icon type="clock-circle-o" style={{ marginRight: 4 }} />
            {getDateDiff(article.created_at)}
          </span>
          <span style={{ marginLeft: 12 }}>
            <Icon type="eye-o" style={{ marginRight: 4 }} />
            {formatReadCount(article.current_read_count)}
          </span>
          <a style={{ color: 'inherit', marginLeft: 12 }}>
            <Icon type="message" style={{ marginRight: 4 }} />
            {0}
          </a>
        </div>
      </div>
    );

    return (
      <DocumentTitle title="文章列表 - 我的网络日志">
        <Fragment>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item>
              <Link to='/'>首页</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              文章列表
            </Breadcrumb.Item>
          </Breadcrumb>
          <Card bordered={false}>
            <Form layout="inline">
              <StandardFormRow title="标签" block style={{ paddingBottom: 11 }}>
                <FormItem>
                  {getFieldDecorator('search.tags', {
                    initialValue: this.state.search.tags,
                  })(
                    <TagSelect onChange={this.handleTagChange} expandable>
                      {
                        this.state.allTags.map(tag => (
                          <TagSelect.Option value={String(tag.id)} key={tag.id}>
                            {tag.name}
                          </TagSelect.Option>
                        ))
                      }
                    </TagSelect>,
                  )}
                </FormItem>
              </StandardFormRow>
            </Form>
          </Card>
          <Card
            bordered={false}
          >
            <List
              size="large"
              loading={loading.effects['article/fetch']}
              rowKey={record => record.id}
              itemLayout="vertical"
              dataSource={data}
              loadMore={this.renderLoadMore()}
              renderItem={article => (
                <List.Item
                  key={article.id}
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
                        to={`/article/${article.id}/details`}
                      >
                        {article.title}
                      </Link>
                    }
                    description={
                      <span>
                        <Icon type="tags-o" style={{ marginRight: 4 }} />
                        {article.tags.map(tag => (
                          <Link key={tag.id} to={`/article/list?tags[0]=${tag.id}`}>
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
        </Fragment>
      </DocumentTitle>
    );
  }
}
