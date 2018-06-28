import React, { PureComponent } from 'react';
import cookie from 'cookie';
import marked from 'marked';
import Prism from 'utils/prism';
import { Form, Input, Select, Button, Radio, Modal, Icon, Upload, message } from 'antd';
import SimpleMDEEditor from 'components/SimpleMDEEditor/index';
import { getAuthorization, getToken } from 'utils/authority';
import { queryAllTags, addTags } from 'services/Admin/api';
import styles from './Form.less';

const FormItem = Form.Item;
const { Option } = Select;

const uploadUrl = '/api/admin/attachment/upload';

function getBase64 (img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

function beforeUpload (file) {
  // const isJPG = file.type === 'image/jpeg';
  // if (!isJPG) {
  //   message.error('You can only upload JPG file!');
  // }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isLt2M;
}

@Form.create()
export default class ArticleForm extends PureComponent {
  state = {
    allTags: [],
    addTagsModalVisible: false,
    addTagsLoading: false,
    tags: [],
    previewBase64: null,
    previewUploading: false,
  };

  async componentWillMount () {
    const { data: allTags } = await queryAllTags();
    this.setState({ allTags });
  }

  componentWillReceiveProps (nextProps) {
    if (!this.state.previewBase64 && nextProps.formData.preview) {
      this.setState({ previewBase64: nextProps.formData.preview });
    }
  }

  handleSubmit = e => {
    e.preventDefault();
    const { form, onSubmit } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        onSubmit(values);
        if (this.simplemde) {
          this.simplemde.clearAutosavedValue();
        }
      }
    });
  };

  toggleddTagsModalVisible = () => {
    const { addTagsModalVisible } = this.state;
    this.setState({
      addTagsModalVisible: !addTagsModalVisible,
    });
  };

  handleAddTagsChange = tags => {
    this.setState({ tags });
  };

  handelAddTags = async () => {
    this.setState({ addTagsLoading: true });
    const { allTags, tags } = this.state;
    const { data } = await addTags({ tags });
    this.setState({
      addTagsModalVisible: false,
      addTagsLoading: false,
      allTags: allTags.concat(data),
      tags: [],
    });
  };

  handlePreviewChange = info => {
    if (info.file.status === 'uploading') {
      this.setState({ previewUploading: true });
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      const { setFieldsValue } = this.props.form;
      getBase64(info.file.originFileObj, previewBase64 =>
        this.setState(
          {
            previewBase64,
            previewUploading: false,
          },
          () => {
            setFieldsValue({ preview: info.file.response.data.filename });
          },
        ),
      );
    }
  };

  renderMarkdown = text => {
    const html = marked(text, { breaks: true });
    if (/language-/.test(html)) {
      const container = document.createElement('div');
      container.innerHTML = html;
      Prism.highlightAllUnder(container);
      return container.innerHTML;
    }

    return html;
  };

  render () {
    const { form, formData, submitLoading } = this.props;
    const { getFieldDecorator } = form;
    const { previewBase64 } = this.state;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    const submitFormLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 16, offset: 4 },
      },
    };

    const uploadButton = (
      <div>
        <Icon type={this.state.previewUploading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    const editorProps = {
      options: {
        // see https://github.com/sparksuite/simplemde-markdown-editor#configuration
        getMdeInstance: simplemde => {
          this.simplemde = simplemde
        },
        mode: 'markdown',
        spellChecker: false,
        lineNumbers: false,
        styleActiveLine: false,
        matchBrackets: false,
        forceSync: true,
        autosave: {
          enabled: true,
          delay: 5000,
          unique_id: `article_content_${formData.id ? formData.id : '0'}`,
        },
        renderingConfig: {
          // codeSyntaxHighlighting: true,
        },
        previewRender: this.renderMarkdown,
        tabSize: 4,
        toolbar: [
          'bold',
          'italic',
          'heading',
          '|',
          'quote',
          'code',
          'table',
          'horizontal-rule',
          'unordered-list',
          'ordered-list',
          '|',
          'link',
          'image',
          '|',
          'side-by-side',
          'fullscreen',
          '|',
          {
            name: 'guide',
            action () {
              const win = window.open(
                'https://github.com/riku/Markdown-Syntax-CN/blob/master/syntax.md',
                '_blank',
              );
              if (win) {
                // Browser has allowed it to be opened
                win.focus();
              } else {
                // Browser has blocked it
                Modal.info({
                  title: 'info',
                  content: 'Please allow popups for this website',
                });
              }
            },
            className: 'fa fa-info-circle',
            title: 'Markdown 语法！',
          },
        ],
      },
      uploadOptions: {
        uploadUrl,
        jsonFieldName: 'data.filename',
        extraHeaders: {
          Accept: 'application/x.sheng.v1+json',
          Authorization: getAuthorization(),
          'X-XSRF-TOKEN': cookie.parse(document.cookie)['XSRF-TOKEN'],
        },
      },
    };

    return (
      <div>
        <Form onSubmit={this.handleSubmit} hideRequiredMark style={{ marginTop: 8 }}>
          <FormItem {...formItemLayout} label="标题">
            {getFieldDecorator('title', {
              initialValue: formData.title,
              rules: [{ required: true, message: '请输入标题' }],
            })(<Input placeholder="给文章起个名字" />)}
          </FormItem>
          <FormItem {...formItemLayout} label="状态">
            {getFieldDecorator('status', {
              initialValue: formData.status,
            })(
              <Radio.Group>
                <Radio value={1}>显示</Radio>
                <Radio value={0}>隐藏</Radio>
              </Radio.Group>,
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="标签">
            {getFieldDecorator('tags', {
              initialValue: formData.tags,
              rules: [{ required: true, message: '请选择标签' }],
            })(
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                tokenSeparators={[',']}
                placeholder="给文章选择标签"
              >
                {this.state.allTags.map(tag => (
                  <Option key={tag.id} value={tag.id}>
                    {tag.name}
                  </Option>
                ))}
              </Select>,
            )}
            <a onClick={this.toggleddTagsModalVisible}>添加标签</a>
          </FormItem>
          <FormItem {...formItemLayout} label="预览图">
            {getFieldDecorator('preview', {
              initialValue: formData.preview,
            })(
              <Upload
                accept="image/*"
                name="file"
                listType="picture-card"
                className={styles.previewUploader}
                showUploadList={false}
                action={uploadUrl}
                data={{ token: getToken() }}
                headers={{ Authorization: getAuthorization() }}
                beforeUpload={beforeUpload}
                onChange={this.handlePreviewChange}
              >
                {previewBase64 ? (
                  <img style={{ maxWidth: '100%' }} src={previewBase64} alt="preview" />
                ) : (
                  uploadButton
                )}
              </Upload>,
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="内容">
            {getFieldDecorator('content', {
              initialValue: formData.content,
              rules: [{ required: true, message: '请输入文章内容' }],
            })(<SimpleMDEEditor {...editorProps} />)}
          </FormItem>
          <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
            <Button type="primary" htmlType="submit" loading={submitLoading}>
              提交
            </Button>
          </FormItem>
        </Form>
        {this.state.addTagsModalVisible && (
          <Modal
            title="添加标签"
            visible={this.state.addTagsModalVisible}
            confirmLoading={this.state.addTagsLoading}
            onOk={this.handelAddTags}
            onCancel={this.toggleddTagsModalVisible}
          >
            <FormItem {...formItemLayout} label="标签名">
              <Select
                mode="tags"
                style={{ width: '100%' }}
                placeholder="请输入标签名"
                onChange={this.handleAddTagsChange}
              />
            </FormItem>
          </Modal>
        )}
      </div>
    );
  }
}
