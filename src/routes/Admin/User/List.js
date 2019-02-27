import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Form, Row, Col, Input, Button, Table, Divider, message } from 'antd';
import PageHeaderLayout from 'layouts/Admin/PageHeaderLayout';
import { queryUserRoles, queryUserPermissions } from 'services/Admin/api';
import ModalForm from './ModalForm';
import ModalAssignRoles from './ModalAssignRoles';
import ModalAssignPermissions from './ModalAssignPermissions';
import styles from './List.less';

const FormItem = Form.Item;

const defaultQueryParams = {};

@connect(({ adminUser, loading }) => ({ adminUser, loading }))
@Form.create()
export default class List extends PureComponent {
  state = {
    modalType: 'create',
    modalVisible: false,
    currentUser: {},
    modalAssignRolesVisible: false,
    modalAssignPermissionsVisible: false,
    currentRoles: [],
    currentPermissions: [],
    search: {},
  };

  componentWillMount () {
    this.props.dispatch({
      type: 'adminUser/fetch',
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
      type: 'adminUser/fetch',
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
      type: 'adminUser/fetch',
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
        type: 'adminUser/fetch',
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
      currentUser: {},
      modalType: 'create',
      modalVisible: true,
    });
  };

  handleEdit = currentUser => {
    this.setState({
      currentUser,
      modalType: 'edit',
      modalVisible: true,
    });
  };

  handleAssignRoles = async currentUser => {
    const { data: currentRoles } = await queryUserRoles(currentUser.id);
    this.setState({
      currentUser,
      currentRoles,
      modalAssignRolesVisible: true,
    });
  };

  handleAssignPermissions = async user => {
    const { data: currentPermissions } = await queryUserPermissions(user.id);
    this.setState({
      currentUser: user,
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

  toggleModalAssignRolesVisible = () => {
    const { modalAssignRolesVisible } = this.state;
    this.setState({
      modalAssignRolesVisible: !modalAssignRolesVisible,
    });
  };

  toggleModalAssignPermissionsVisible = () => {
    const { modalAssignPermissionsVisible } = this.state;
    this.setState({
      modalAssignPermissionsVisible: !modalAssignPermissionsVisible,
    });
  };

  renderSearchForm () {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="用户名称">
              {getFieldDecorator('search.name')(<Input placeholder="请输入用户名称" />)}
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
                <Button icon="user-add" type="primary" onClick={this.handleCreate}>
                  新建
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Form>
    );
  }

  render () {
    const { adminUser: { data, pagination }, loading, dispatch } = this.props;
    const {
      modalType,
      modalVisible,
      modalAssignRolesVisible,
      modalAssignPermissionsVisible,
      currentUser,
      currentRoles,
      currentPermissions,
    } = this.state;

    const columns = [
      {
        title: '用户编号',
        dataIndex: 'id',
      },
      {
        title: '用户名称',
        dataIndex: 'name',
      },
      {
        title: '邮箱号码',
        dataIndex: 'email',
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
      },
      {
        title: '更新时间',
        dataIndex: 'updated_at',
      },
      {
        title: '操作',
        render: (text, record) => (
          <Fragment>
            <a onClick={() => this.handleEdit(record)}>编辑</a>
            <Divider type="vertical" />
            <a disabled={!record.is_admin} onClick={() => this.handleAssignRoles(record)}>分配角色</a>
            <Divider type="vertical" />
            <a disabled={!record.is_admin} onClick={() => this.handleAssignPermissions(record)}>分配权限</a>
          </Fragment>
        ),
      },
    ];

    const effect = `adminUser/${modalType === 'create' ? 'add' : 'update'}`;
    const modalFormPorps = {
      currentUser: modalType === 'create' ? {} : currentUser,
      title: modalType === 'create' ? '添加用户' : '编辑用户',
      visible: modalVisible,
      confirmLoading: loading.effects[effect],
      onOk: payload => {
        dispatch({
          type: effect,
          id: currentUser.id,
          payload,
          callback: () => {
            message.success(modalType === 'create' ? '添加成功' : '修改成功');
            this.toggleModalVisible();
            dispatch({ type: 'adminUser/fetch' });
          },
        });
      },
      onCancel: this.toggleModalVisible,
    };

    const modalAssignRolesProps = {
      currentRoles,
      title: `给【${currentUser.name}】用户分配角色`,
      visible: modalAssignRolesVisible,
      confirmLoading: loading.effects['adminUser/assignRoles'],
      onOk: payload => {
        dispatch({
          type: 'adminUser/assignRoles',
          id: currentUser.id,
          payload,
          callback: () => {
            message.success('角色分配成功');
            this.toggleModalAssignRolesVisible();
          },
        });
      },
      onCancel: this.toggleModalAssignRolesVisible,
    };

    const modalAssignPermissionsProps = {
      currentPermissions,
      title: `给【${currentUser.username}】用户分配权限`,
      visible: modalAssignPermissionsVisible,
      width: 1000,
      confirmLoading: loading.effects['user/assignPermissions'],
      onOk: payload => {
        dispatch({
          type: 'adminUser/assignPermissions',
          id: currentUser.id,
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
              loading={loading.effects['adminUser/fetch']}
              onChange={this.handleTableChange}
              rowKey={record => record.id}
              scroll={{ x: 800 }}
            />
          </div>
        </Card>
        {modalVisible && <ModalForm {...modalFormPorps} />}
        {modalAssignRolesVisible && <ModalAssignRoles {...modalAssignRolesProps} />}
        {modalAssignPermissionsVisible && (
          <ModalAssignPermissions {...modalAssignPermissionsProps} />
        )}
      </PageHeaderLayout>
    );
  }
}
