import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Form, Card, List, Tag, Icon, Avatar, Button, Pagination, Popconfirm, message } from 'antd';
import PageHeaderLayout from 'layouts/Admin/PageHeaderLayout';
import { parse } from 'qs';
import { get } from 'lodash';
import TagSelect from 'components/TagSelect';
import StandardFormRow from 'components/StandardFormRow';
import Ellipsis from 'components/Ellipsis';
import { queryAllTags } from 'services/Admin/api';
import styles from './List.less';

const FormItem = Form.Item;

const defaultQueryParams = {
  include: 'author,tags',
  pageSize: 5,
};
const loadMorePage = 20;

@Form.create()
@connect(({ adminArticle, loading }) => ({ adminArticle, loading }))
export default class ArticleList extends PureComponent {
  constructor(props) {
    super(props);
    const { location: { search } } = this.props;
    const query = parse(search.substr(1));

    this.state = {
      search: { tags: [], ...query },
      allTags: [],
    };
  }

  async componentWillMount() {
    this.handleSearch();

    const { data: allTags } = await queryAllTags();
    this.setState({ allTags });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location.search !== this.props.location.search) {
      const { location: { search } } = nextProps;
      const query = parse(search.substr(1));

      this.setState({ search: { tags: [], ...query } }, this.handleSearch);
    }
  }

  onRemove = ({ id }) => {
    const { dispatch } = this.props;
    const { search } = this.state;

    const hide = message.loading('正在删除文章..', 0);
    dispatch({
      type: 'adminArticle/remove',
      id,
      callback() {
        hide();
        message.success('删除成功！');
        dispatch({
          type: 'adminArticle/fetch',
          payload: {
            ...search,
            page: 1,
          },
        });
      },
    });
  };

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
        type: 'adminArticle/fetch',
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

  render() {
    const { form, adminArticle: { data }, loading } = this.props;
    const { getFieldDecorator } = form;

    const IconText = ({ type, text }) => (
      <span>
        <Icon type={type} style={{ marginRight: 8 }} />
        {text}
      </span>
    );

    const ListContent = ({ data: article }) => (
      <div className={styles.listContent}>
        <Ellipsis className={styles.description} lines={3}>
          {article.description}
        </Ellipsis>
        <div className={styles.extra}>
          <Avatar size="small" icon="user" />
          <Link to={`/admin/article/list?author_id=${get(article, 'author.id')}`}>
            {get(article, 'author.name')}
          </Link>
          &nbsp;&nbsp;发布在&nbsp;&nbsp;
          <Link to={`/article/${article.id}/details`}>
            {window.location.hostname}
            {window.location.port === 80 ? '' : `:${window.location.port}`}
            {`/article/${article.id}/details`}
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
        <Card bordered={false}>
          <Form layout="inline">
            <StandardFormRow title="标签" block style={{ paddingBottom: 11 }}>
              <FormItem>
                {getFieldDecorator('search.tags', {
                  initialValue: this.state.search.tags,
                })(
                  <TagSelect onChange={this.handleTagChange} expandable>
                    {this.state.allTags.map(tag => (
                      <TagSelect.Option value={String(tag.id)} key={tag.id}>
                        {tag.name}
                      </TagSelect.Option>
                    ))}
                  </TagSelect>
                )}
              </FormItem>
            </StandardFormRow>
          </Form>
        </Card>
        <Card
          style={{ marginTop: 24 }}
          bordered={false}
          bodyStyle={{ padding: '8px 32px 32px 32px' }}
        >
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
                  <Link to={`/admin/article/${article.id}/edit`}>
                    <Icon type="edit" style={{ marginRight: 8 }} />
                    编辑
                  </Link>,
                  <Popconfirm title="您确定删除该文章吗?" onConfirm={() => this.onRemove(article)}>
                    <span style={{ color: '#f5222d' }}>
                      <Icon type="delete" />
                      删除
                    </span>
                  </Popconfirm>,
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
                      {article.title}
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
