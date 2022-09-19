import React from 'react'
import { Link } from 'react-router-dom'
import { inject, observer } from 'mobx-react'
import {withRouter} from "react-router-dom";
import { Icon } from 'antd'
import {isN,msg} from '../../util/fn'
import {loadUser} from '../../util/token'



import logo from "../../img/logo.svg"
import './index.less'


var MENU_MAIN = [{name:'教务统计',key:'/tech',role:0, list: []},]

var $ = (o) =>{ return document.querySelector(o) }


@inject('mainStore')
@observer
class NavWrapper extends React.Component {
	constructor(props) {
		super(props)
    this.store = this.props.mainStore
    this.state = {
      cur: '/',
      show: true,
      sel: 0,
      menu: [],
    }
	}

  async componentDidMount() {
    let user = loadUser()
    // console.log(user)
    if (!isN(user)) {
      let role = user.role.split('|')
      let {menu}= this.state
      MENU_MAIN.map((item,i)=>{
        if (parseInt(role[i])) { menu.push(item) }
      })
      this.setState({menu:menu})
    }
  }

  doMenu = (item,i) => {

    if (isN(item.key)) return

    this.setState({ sel: i })
    this.props.history.push(item.key)
  }


  logout = ()=>{
    this.store.logout()
    this.props.history.push('/')
  }



	render() {
    const { menu,sel } = this.state
    const { currUser } = this.store

    return (
      <div className="g-nav">
        <div className="m-nav">
          <a className="navbar-brand" href="/">
            <img src={logo} className="d-inline-block align-top" />
          </a>
          <label>慢清尘作坊</label>
          <div className="m-menu_wrap">
            {menu.map((item,i)=>
              <div key={i} className={(i==sel)?"m-item sel":"m-item"} onClick={this.doMenu.bind(this,item,i)}>
                {item.name}
                <div className="m-sub_menu">
                  {item.list.map((o,j)=>
                    <div key={j} className="m-sub" onClick={this.doMenu.bind(this,o,i)}>{o.name}</div>
                  )}
                </div>
              </div>
            )}

            {(!isN(currUser)) &&
            <div className="m-item" onClick={this.logout}>
              <span>退出登录</span>
            </div>}
          </div>

        </div>

        <div className="g-main">
          {this.props.children}
        </div>

        <div className="m-footer">
          <p>
            <small>© 杭州师范大学信息科学与技术学院 All Rights Reserved. <a href="https://icp.chinaz.com/info?q=hznu.edu.cn">浙ICP备2022006063号-1</a> </small>
          </p>
        </div>
      </div>
    )
  }
}

export default withRouter(NavWrapper)
