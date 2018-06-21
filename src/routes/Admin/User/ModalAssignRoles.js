import React, { PureComponent } from 'react';
import { Modal, Form, Checkbox } from 'antd';
import { queryAllRoles } from 'services/Admin/api';

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 15,
  },
};

@Form.create()
export default class ModalAssignRoles extends PureComponent {
  state = {
    allRoles: [],
  };

  async componentWillMount() {
    const { data: allRoles } = await queryAllRoles();
    this.setState({ allRoles });
  }

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
    const { currentRoles, form, ...modalOpts } = this.props;
    const { getFieldDecorator } = form;
    const { allRoles } = this.state;

    return (
      <Modal {...modalOpts} onOk={this.okHandle}>
        <Form layout="horizontal">
          <FormItem {...formItemLayout} label="角色">
            {getFieldDecorator('roles', {
              initialValue: currentRoles.map(item => item.id),
            })(
              <CheckboxGroup
                options={allRoles.map(item => ({ label: item.display_name, value: item.id }))}
              />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
