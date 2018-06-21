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
    const { form, currentRole, ...modalProps } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Modal {...modalProps} onOk={this.okHandle}>
        <FormItem {...formItemLayout} label="角色标识" hasFeedback>
          {getFieldDecorator('name', {
            initialValue: currentRole.name,
            validateTrigger: 'onBlur',
            rules: [{ required: true, message: '请填写角色标识' }],
          })(<Input placeholder="请输入角色标识" />)}
        </FormItem>
        <FormItem {...formItemLayout} label="角色名称" hasFeedback>
          {getFieldDecorator('display_name', {
            initialValue: currentRole.display_name,
            validateTrigger: 'onBlur',
            rules: [{ required: true, message: '请填写角色名称' }],
          })(<Input placeholder="请输入角色名称" />)}
        </FormItem>
        <FormItem {...formItemLayout} label="角色描述" validateStatus="success" hasFeedback>
          {getFieldDecorator('description', {
            initialValue: currentRole.description,
          })(<Input placeholder="请输入角色描述" />)}
        </FormItem>
      </Modal>
    );
  }
}
