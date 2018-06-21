import React, { PureComponent } from 'react';
import { Modal, Form, Checkbox } from 'antd';
import { groupBy } from 'lodash';
import { queryAllPermissions } from 'services/Admin/api';

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
export default class ModalAssignPermissions extends PureComponent {
  state = {
    allPermissions: [],
  };

  async componentWillMount() {
    const { data: allPermissions } = await queryAllPermissions();
    this.setState({ allPermissions });
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
    const { currentPermissions, form, ...modalOpts } = this.props;
    const { getFieldDecorator } = form;
    const { allPermissions } = this.state;

    const groupPerms = groupBy(allPermissions, item => item.name.split('.')[0]);

    return (
      <Modal {...modalOpts} onOk={this.okHandle}>
        <Form layout="horizontal">
          {Object.keys(groupPerms).map(key => (
            <FormItem {...formItemLayout} key={key} label={key}>
              {getFieldDecorator('permissions', {
                initialValue: currentPermissions.map(item => item.id),
              })(
                <CheckboxGroup
                  options={groupPerms[key].map(item => ({
                    label: item.display_name,
                    value: item.id,
                  }))}
                />
              )}
            </FormItem>
          ))}
        </Form>
      </Modal>
    );
  }
}
