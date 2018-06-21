import React, { Component } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Checkbox } from 'antd';
import Login from 'components/Login';
import styles from './Login.less';

const { Tab, UserName, Password, Submit } = Login;

@connect(({ loading }) => ({ loading }))
export default class LoginPage extends Component {
  state = {
    type: 'account',
    remember: false,
  };

  onTabChange = type => {
    this.setState({ type });
  };

  handleSubmit = (err, values) => {
    if (!err) {
      this.props.dispatch({
        type: 'adminLogin/login',
        payload: {
          ...values,
          remember: this.state.remember,
        },
      });
    }
  };

  changeRemember = e => {
    this.setState({
      remember: e.target.checked,
    });
  };

  render() {
    const { loading } = this.props;
    const { type, remember } = this.state;
    return (
      <div className={styles.main}>
        <Login defaultActiveKey={type} onTabChange={this.onTabChange} onSubmit={this.handleSubmit}>
          <Tab key="account" tab="账户密码登录">
            <UserName name="account" placeholder="请输入账户名称" />
            <Password name="password" placeholder="请输入账户密码" />
          </Tab>
          <Tab key="email" tab="邮箱密码登录">
            <UserName name="email" type="email" placeholder="请输入邮箱号码" />
            <Password name="password" placeholder="请输入账户密码" />
          </Tab>
          <div>
            <Checkbox checked={remember} onChange={this.changeRemember}>
              自动登录
            </Checkbox>
            <Link style={{ float: 'right' }} to="">
              忘记密码
            </Link>
          </div>
          <Submit loading={loading.effects['adminLogin/login']}>登录</Submit>
        </Login>
      </div>
    );
  }
}
