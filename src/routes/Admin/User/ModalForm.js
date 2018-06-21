import React, { PureComponent } from 'react';
import { Form, Input, Modal } from 'antd';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 15,
  },
};

@Form.create()
export default class ModalForm extends PureComponent {
  okHandle = () => {
    const { form, onOk } = this.props;
    const { validateFields, resetFields } = form;

    validateFields((err, values) => {
      if (err) return;
      resetFields();
      onOk(values);
    });
  };

  render() {
    const { form, currentUser, ...modalProps } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Modal {...modalProps} onOk={this.okHandle}>
        <FormItem {...formItemLayout} label="用户名称">
          {getFieldDecorator('name', {
            initialValue: currentUser.name,
            validateTrigger: 'onBlur',
            rules: [{ required: true, message: '请输入用户名称...' }],
          })(<Input placeholder="请输入用户名称" />)}
        </FormItem>
        <FormItem {...formItemLayout} label="邮箱号码">
          {getFieldDecorator('email', {
            initialValue: currentUser.email,
            validateTrigger: 'onBlur',
            rules: [{ required: true, type: 'email', message: '请输入邮箱号码...' }],
          })(<Input type="email" placeholder="请输入邮箱号码" />)}
        </FormItem>
        <FormItem {...formItemLayout} label="用户密码">
          {getFieldDecorator('password', {
            validateTrigger: 'onBlur',
            rules: [{ required: !currentUser.name, message: '请输入用户密码...' }],
          })(<Input type="password" placeholder="请输入用户密码" />)}
        </FormItem>
      </Modal>
    );
  }
}
