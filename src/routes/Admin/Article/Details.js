import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Button, Icon, Spin, Tag } from 'antd';
import { get } from 'lodash';
import marked from 'marked';
import Prism from 'prismjs';
import { dynamicLoad } from 'utils/utils';
import PageHeaderLayout from 'layouts/Admin/PageHeaderLayout';
import DescriptionList from 'components/DescriptionList/index';
import { queryArticleDetails } from 'services/Admin/api';
import 'components/SimpleMDEEditor/style.less';
import styles from './Details.less';

const { Description } = DescriptionList;

@connect(({ adminArticle, loading }) => ({ adminArticle, loading }))
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

    const description = (
      <DescriptionList className={styles.headerList} size="small" col="2">
        <Description term="创建人">
          <Link to={`/admin/article/list?author_id=${get(article, 'author.id')}`}>
            {get(article, 'author.name')}
          </Link>
        </Description>
        <Description term="状态">{get(['隐藏', '显示'], article.status)}</Description>
        <Description term="创建时间">{article.created_at}</Description>
        <Description term="更新时间">{article.updated_at}</Description>
        <Description term="标签">
          {article.tags &&
          article.tags.map(tag => (
            <Link key={tag.id} to={`/admin/article/list?tags[0]=${tag.id}`}>
              <Tag>{tag.name}</Tag>
            </Link>
          ))}
        </Description>
      </DescriptionList>
    );

    return (
      <PageHeaderLayout
        title={article.title}
        action={
          <Link to={`/admin/article/${this.props.match.params.id}/edit`}>
            <Button icon="edit">编辑文章</Button>
          </Link>
        }
        content={description}
        breadcrumbList={[
          {
            title: '首页',
            href: '/',
          },
          {
            title: '文章列表',
            href: '/article/list',
          },
          {
            title: '文章详情',
            href: this.props.location.pathname,
          },
        ]}
      >
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
      </PageHeaderLayout>
    );
  }
}
