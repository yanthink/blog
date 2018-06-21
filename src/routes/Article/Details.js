import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import DocumentTitle from 'react-document-title';
import { Breadcrumb, Icon, Spin, Tag } from 'antd';
import { get } from 'lodash';
import marked from 'marked';
import Prism from 'prismjs';
import 'prismjs/themes/prism-okaidia.css';
import loadLanguages from 'prismjs/components/index';
import 'components/SimpleMDEEditor/markdown.less';
import 'components/SimpleMDEEditor/style.less';
import { queryArticleDetails } from 'services/api';
import styles from './Details.less';

loadLanguages([
  'markup',
  'css',
  'javascript',
  'aspnet',
  'bash',
  'c',
  'csharp',
  'cpp',
  'coffeescript',
  'docker',
  'git',
  'go',
  'http',
  'ini',
  'java',
  'json',
  'kotlin',
  'less',
  'markdown',
  'nginx',
  'objectivec',
  'perl',
  'php',
  'php-extras',
  'plsql',
  'powershell',
  'python',
  'jsx',
  'tsx',
  'ruby',
  'sass',
  'scss',
  'sql',
  'stylus',
  'swift',
  'typescript',
  'vbnet',
  'vim',
  'visual-basic',
  'yaml',
]);

@connect(({ article, loading }) => ({ article, loading }))
export default class ArticleDetails extends PureComponent {
  state = {
    article: {},
  };

  async componentWillMount () {
    const { data: article } = await queryArticleDetails(this.props.match.params.id, {
      include: 'author,tags',
    });

    this.setState({
      article,
    }, () => Prism.highlightAllUnder(this.markdownDomNode));
  }

  handleRefMount = domNode => {
    this.markdownDomNode = domNode;
  };

  render () {
    const { loading } = this.props;
    const { article } = this.state;

    return (
      <DocumentTitle title={`${article.title || ''} - 黄思盛的网络日志`}>
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
              <Link to={`/article/list?author_id=${get(article, 'author.id')}`}>
                {get(article, 'author.name')}
              </Link>
              &nbsp;&nbsp;
              <span>{article.updated_at}</span>
              &nbsp;&nbsp;
              {article.tags && article.tags.map(tag => (
                <Link key={tag.id} to={`/article/list?tags[0]=${tag.id}`}>
                  <Tag>{tag.name}</Tag>
                </Link>
              ))}
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
                        // { breaks: true },
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
