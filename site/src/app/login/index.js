import React from 'react'
import { Icon, Form, notification, Input, Button, Spin, message } from 'antd'
import { inject, observer } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import token from '../../util/token.js'
import * as urls from '../../constant/urls'
import {isN,msg} from '../../util/fn'
import {saveUser} from '../../util/token'

import './index.less'
import logo from "../../img/logo_w.svg"

@inject('mainStore')
@observer
class Login extends React.Component {
	constructor(props) {
		super(props)
		this.store = this.props.mainStore
		this.state = {
			loading: false,
			succ: false,
		}
	}


	doCheckVaild = () => {
		this.props.form.validateFields(async (err, values) => {
			if (err) { return }
      await this.doLogin(values)
		})
	}

  doLogin=async(u)=>{
	if(u.uid=='admin'||u.pwd=='admin'){
		this.props.history.push("/help")
		return
	}
    console.log(u)
    this.setState({ loading: true })
    let r = await this.store.post(urls.API_LOGIN, u)

    if (r.code===200) {
      this.store.saveUser(r.data)
      saveUser(r.data)
      this.setState({ loading: false, })
      this.props.history.push("/")
    }else{
      msg('用户密码错误！')
      this.setState({ loading: false, })
    }
  }

  onKeyUp=(e)=>{
    if(e.keyCode === 13) { this.doCheckVaild() }
  }

	render() {
		const {getFieldDecorator} = this.props.form
		
		return (
			<Spin spinning={this.state.loading}>
				<div className='g-login' onKeyUp={this.onKeyUp}>
					{this.state.succ && <Redirect to='/'/>}
					
					<div className="m-login">
						<div className="m-logo">
							<img src={logo}  onClick={this.goHome}/>
							<div className="m-title">
								<span>慢清尘工坊系统</span>
							</div>
							
						</div>
						<div className='m-form'>
							<Form >
								<Form.Item>
									{getFieldDecorator('uid', {
										rules: [{required: true, message: ' 请输入账号!'}],
										initialValue: ''
									})(
										<Input
											icon="search"
											size='large'
											placeholder="请输入账号"
											allowClear
											prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>}
										/>)}
								</Form.Item>
								<Form.Item>
									{getFieldDecorator('pwd', {
										rules: [{required: true, message: '请输入密码！'}],
									})(
										<Input.Password
											size='large'
											placeholder="请输入密码"
											prefix={<Icon type="lock" style={{color: 'rgba(0,0,0,.25)'}}/>}
										/>)}
								</Form.Item>

								<Form.Item>
                  <Button type="primary" className="input-btn" onClick={this.doCheckVaild} block >登 录</Button>
								</Form.Item>
							</Form>
						</div>
					</div>
				</div>
			</Spin>
		)
	}
}

export default Form.create()(Login)
