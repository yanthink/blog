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
    const { form, currentPermission, ...modalProps } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Modal {...modalProps} onOk={this.okHandle}>
        <FormItem {...formItemLayout} label="权限标识" hasFeedback>
          {getFieldDecorator('name', {
            initialValue: currentPermission.name,
            validateTrigger: 'onBlur',
            rules: [{ required: true, message: '请填写权限标识' }],
          })(<Input placeholder="请输入权限标识" />)}
        </FormItem>
        <FormItem {...formItemLayout} label="权限名称" hasFeedback>
          {getFieldDecorator('display_name', {
            initialValue: currentPermission.display_name,
            validateTrigger: 'onBlur',
            rules: [{ required: true, message: '请填写权限名称' }],
          })(<Input placeholder="请输入权限名称" />)}
        </FormItem>
        <FormItem {...formItemLayout} label="权限描述" validateStatus="success" hasFeedback>
          {getFieldDecorator('description', {
            initialValue: currentPermission.description,
          })(<Input placeholder="请填写权限描述" />)}
        </FormItem>
      </Modal>
    );
  }
}
