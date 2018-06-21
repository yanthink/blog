import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Form, Row, Col, Input, Button, Table, message } from 'antd';
import PageHeaderLayout from 'layouts/Admin/PageHeaderLayout';
import ModalForm from './ModalForm';
import styles from './List.less';

const FormItem = Form.Item;

const defaultQueryParams = {};

@connect(({ adminPermission, loading }) => ({ adminPermission, loading }))
@Form.create()
export default class List extends PureComponent {
  state = {
    modalType: 'create',
    modalVisible: false,
    currentPermission: {},
    search: {},
  };

  componentWillMount() {
    this.props.dispatch({
      type: 'adminPermission/fetch',
      payload: {
        ...defaultQueryParams,
      },
    });
  }

  handleTableChange = (pagination, filters) => {
    const { dispatch } = this.props;
    const { search } = this.state;

    const params = {
      ...defaultQueryParams,
      ...search,
      ...filters,
      page: pagination.current,
      pageSize: pagination.pageSize,
    };

    dispatch({
      type: 'adminPermission/fetch',
      payload: params,
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      search: {},
    });
    dispatch({
      type: 'adminPermission/fetch',
      payload: {
        ...defaultQueryParams,
      },
    });
  };

  handleSearch = e => {
    e.preventDefault();

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
        type: 'adminPermission/fetch',
        payload: {
          ...defaultQueryParams,
          ...search,
          ...values.search,
        },
      });
    });
  };

  handleCreate = () => {
    this.setState({
      currentPermission: {},
      modalType: 'create',
      modalVisible: true,
    });
  };

  handleEdit = currentPermission => {
    this.setState({
      currentPermission,
      modalType: 'edit',
      modalVisible: true,
    });
  };

  toggleModalVisible = () => {
    const { modalVisible } = this.state;
    this.setState({
      modalVisible: !modalVisible,
    });
  };

  renderSearchForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="权限标识">
              {getFieldDecorator('search.name')(<Input placeholder="请输入权限标识" />)}
            </FormItem>
          </Col>
          <Col md={16} sm={24}>
            <div className={styles.action}>
              <div className={styles.submitButtons}>
                <Button type="primary" htmlType="submit">
                  查询
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                  重置
                </Button>
              </div>
              <div className={styles.operator}>
                <Button icon="plus" type="primary" onClick={this.handleCreate}>
                  新建
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { adminPermission: { data, pagination }, loading, dispatch } = this.props;
    const { modalType, modalVisible, currentPermission } = this.state;

    const columns = [
      {
        title: '权限标识',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '权限名称',
        dataIndex: 'display_name',
        key: 'display_name',
      },
      {
        title: '权限描述',
        dataIndex: 'description',
        key: 'description',
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        key: 'created_at',
      },
      {
        title: '更新时间',
        dataIndex: 'updated_at',
        key: 'updated_at',
      },
      {
        title: '操作',
        key: 'action',
        render: (text, record) => <a onClick={() => this.handleEdit(record)}>编辑</a>,
      },
    ];

    const effect = `adminPermission/${modalType === 'create' ? 'add' : 'update'}`;
    const modalFormPorps = {
      currentPermission: modalType === 'create' ? {} : currentPermission,
      title: modalType === 'create' ? '添加权限' : '编辑权限',
      visible: modalVisible,
      confirmLoading: loading.effects[effect],
      onOk: payload => {
        dispatch({
          type: effect,
          id: currentPermission.id,
          payload,
          callback: () => {
            message.success(modalType === 'create' ? '添加成功' : '修改成功');
            this.toggleModalVisible();
            dispatch({ type: 'adminPermission/fetch' });
          },
        });
      },
      onCancel: this.toggleModalVisible,
    };

    const paginationProps = {
      showSizeChanger: true,
      showQuickJumper: true,
      ...pagination,
    };

    return (
      <PageHeaderLayout>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.searchForm}>{this.renderSearchForm()}</div>
            <Table
              dataSource={data}
              pagination={paginationProps}
              columns={columns}
              loading={loading.effects['adminPermission/fetch']}
              onChange={this.handleTableChange}
              rowKey={record => record.id}
              scroll={{ x: 800 }}
            />
          </div>
        </Card>
        <ModalForm {...modalFormPorps} />
      </PageHeaderLayout>
    );
  }
}
