import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import DocumentTitle from 'react-document-title';
import { Breadcrumb, Icon, Spin, Tag } from 'antd';
import { get } from 'lodash';
import marked from 'marked';
import Prism from 'prismjs';
import { dynamicLoad, getDateDiff } from 'utils/utils';
import { queryArticleDetails } from 'services/api';
import 'components/SimpleMDEEditor/style.less';
import styles from './Details.less';

@connect(({ article, loading }) => ({ article, loading }))
export default class ArticleDetails extends PureComponent {
  state = {
    article: {},
  };

  async componentWillMount () {
    this.queryPromise = queryArticleDetails(this.props.match.params.id, { include: 'author,tags' });
    const { data: article } = await this.queryPromise;
    this.setState({ article }, () => Prism.highlightAllUnder(this.markdownDomNode));
  }

  async componentDidMount () {
    await dynamicLoad('/fluidbox/jquery.min.js');
    await dynamicLoad('/fluidbox/jquery.ba-throttle-debounce.min.js');
    await dynamicLoad('/fluidbox/jquery.fluidbox.min.js');
    await dynamicLoad('/fluidbox/fluidbox.min.css');

    await this.queryPromise;

    /* eslint-disable */
    $(this.markdownDomNode).find('img').each(function() {
      $(this).wrap('<a href="' + $(this).attr('src') + '" class="fluidbox"></a>');
    }).promise().done(() => $('a.fluidbox').fluidbox());
    /* eslint-enable */
  }

  componentWillUnmount () {
    $('a.fluidbox').data('plugin_fluidbox') && $('a.fluidbox').data('plugin_fluidbox').destroy(); // eslint-disable-line
  }

  handleRefMount = domNode => {
    this.markdownDomNode = domNode;
  };

  render () {
    const { loading } = this.props;
    const { article } = this.state;

    return (
      <DocumentTitle title={`${article.title || ''} - 我的网络日志`}>
        <Fragment>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item>
              <Link to="/">首页</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to="/article/list">文章列表</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>文章详情</Breadcrumb.Item>
          </Breadcrumb>
          <div className={styles.header}>
            <h1>{article.title}</h1>
            <div className={styles.meta}>
              <Link style={{ color: 'inherit' }} to={`/article/list?author_id=${get(article, 'author.id')}`}>
                {get(article, 'author.name')}
              </Link>
              <span style={{ margin: '0 6px' }}>⋅</span>
              <span>
                于
                <Icon type="clock-circle-o" style={{ margin: '0 4px' }} />
                {getDateDiff(article.created_at)}
              </span>
              <span style={{ margin: '0 6px' }}>⋅</span>
              <span>
                <Icon type="eye-o" style={{ marginRight: 4 }} />
                {article.current_read_count} 阅读
              </span>
              <span style={{ margin: '0 6px' }}>⋅</span>
              <span>
                <Icon type="tags-o" style={{ marginRight: 4 }} />
                {article.tags && article.tags.map(tag => (
                  <Link key={tag.id} to={`/article/list?tags[0]=${tag.id}`}>
                    <Tag>{tag.name}</Tag>
                  </Link>
                ))}
              </span>
            </div>
          </div>
          <div ref={this.handleRefMount} className={`${styles.content} markdown-body`}>
            {
              loading.effects['article/queryDetails'] ||
              !article.content ?
                (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Spin indicator={<Icon type="loading" style={{ fontSize: 32 }} spin />} />
                  </div>
                ) :
                (
                  <span
                    dangerouslySetInnerHTML={{ // eslint-disable-line
                      __html: marked(
                        article.content,
                        { breaks: true },
                      ),
                    }}
                  />
                )
            }
          </div>
        </Fragment>
      </DocumentTitle>
    );
  }
}
