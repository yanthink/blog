import React from 'react'
import PropTypes from 'prop-types'
import { Modal, Form, Checkbox } from 'antd'

const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group

const formItemLayout = {
  labelCol: {
    xs: 6,
    md: 4,
  },
  wrapperCol: {
    xs: 16,
    md: 18,
  },
}

const AssignRolesModal = ({ roles, allRoles, onOk, form: { getFieldDecorator, getFieldsValue }, ...modalOpts }) => {
  const handleOk = () => {
    onOk(getFieldsValue())
  }

  return (
    <Modal {...modalOpts} onOk={handleOk}>
      <Form layout="horizontal">
        <FormItem
          {...formItemLayout}
          label="角色"
        >
          {getFieldDecorator('roles', {
            initialValue: roles.map(item => item.id),
          })(
            <CheckboxGroup
              options={
                allRoles.map(item => ({ label: item.display_name, value: item.id }))
              }
            />,
          )}
        </FormItem>
      </Form>
    </Modal>
  )
}

AssignRolesModal.propTypes = {
  roles: PropTypes.array,
  allRoles: PropTypes.array,
  confirmLoading: PropTypes.bool,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
}

export default Form.create()(AssignRolesModal)
