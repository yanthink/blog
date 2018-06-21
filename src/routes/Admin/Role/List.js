import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Form, Row, Col, Input, Button, Table, Divider, message } from 'antd';
import PageHeaderLayout from 'layouts/Admin/PageHeaderLayout';
import { queryRolePermissions } from 'services/Admin/api';
import ModalForm from './ModalForm';
import ModalAssignPermissions from './ModalAssignPermissions';
import styles from './List.less';

const FormItem = Form.Item;

const defaultQueryParams = {};

@connect(({ adminRole, loading }) => ({ adminRole, loading }))
@Form.create()
export default class List extends PureComponent {
  state = {
    modalType: 'create',
    modalVisible: false,
    currentRole: {},
    modalAssignPermissionsVisible: false,
    currentPermissions: [],
    search: {},
  };

  componentWillMount() {
    this.props.dispatch({
      type: 'adminRole/fetch',
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
      type: 'adminRole/fetch',
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
      type: 'adminRole/fetch',
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
        type: 'adminRole/fetch',
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
      currentRole: {},
      modalType: 'create',
      modalVisible: true,
    });
  };

  handleEdit = currentRole => {
    this.setState({
      currentRole,
      modalType: 'edit',
      modalVisible: true,
    });
  };

  handleAssignPermissions = async currentRole => {
    const { data: currentPermissions } = await queryRolePermissions(currentRole.id);
    this.setState({
      currentRole,
      currentPermissions,
      modalAssignPermissionsVisible: true,
    });
  };

  toggleModalVisible = () => {
    const { modalVisible } = this.state;
    this.setState({
      modalVisible: !modalVisible,
    });
  };

  toggleModalAssignPermissionsVisible = () => {
    const { modalAssignPermissionsVisible } = this.state;
    this.setState({
      modalAssignPermissionsVisible: !modalAssignPermissionsVisible,
    });
  };

  renderSearchForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="角色标识">
              {getFieldDecorator('search.name')(<Input placeholder="请输入角色标识" />)}
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
    const { adminRole: { data, pagination }, loading, dispatch } = this.props;
    const {
      modalType,
      modalVisible,
      currentRole,
      currentPermissions,
      modalAssignPermissionsVisible,
    } = this.state;

    const columns = [
      {
        title: '角色标识',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '角色名称',
        dataIndex: 'display_name',
        key: 'display_name',
      },
      {
        title: '角色描述',
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
        render: (text, record) => (
          <Fragment>
            <a onClick={() => this.handleEdit(record)}>编辑</a>
            <Divider type="vertical" />
            <a onClick={() => this.handleAssignPermissions(record)}>分配权限</a>
          </Fragment>
        ),
      },
    ];

    const effect = `adminRole/${modalType === 'create' ? 'add' : 'update'}`;
    const modalFormPorps = {
      currentRole: modalType === 'create' ? {} : currentRole,
      title: modalType === 'create' ? '添加角色' : '编辑角色',
      visible: modalVisible,
      confirmLoading: loading.effects[effect],
      onOk: payload => {
        dispatch({
          type: effect,
          id: currentRole.id,
          payload,
          callback: () => {
            message.success(modalType === 'create' ? '添加成功' : '修改成功');
            this.toggleModalVisible();
            dispatch({ type: 'adminRole/fetch' });
          },
        });
      },
      onCancel: this.toggleModalVisible,
    };

    const modalAssignPermissionsProps = {
      currentPermissions,
      title: `给【${currentRole.name}】角色分配权限`,
      visible: modalAssignPermissionsVisible,
      confirmLoading: loading.effects['adminRole/assignPermissions'],
      onOk: payload => {
        dispatch({
          type: 'adminRole/assignPermissions',
          id: currentRole.id,
          payload,
          callback: () => {
            message.success('权限分配成功');
            this.toggleModalAssignPermissionsVisible();
          },
        });
      },
      onCancel: this.toggleModalAssignPermissionsVisible,
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
              loading={loading.effects['adminRole/fetch']}
              onChange={this.handleTableChange}
              rowKey={record => record.id}
              scroll={{ x: 800 }}
            />
          </div>
        </Card>
        <ModalForm {...modalFormPorps} />
        <ModalAssignPermissions {...modalAssignPermissionsProps} />
      </PageHeaderLayout>
    );
  }
}
