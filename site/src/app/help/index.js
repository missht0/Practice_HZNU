import React from 'react'
import dayjs from 'dayjs'
import { inject } from 'mobx-react'
import { Form, notification, Drawer, Spin, Switch, Tooltip, Input, InputNumber, Modal, TimePicker, DatePicker, Select, Tabs, Button, Table, message } from 'antd'
import { API_SERVER } from '../../constant/apis'
import moment from 'moment'
import style from './style.less';
import * as urls from '../../constant/urls'
import { debug, isN } from '../../util/fn'

const { RangePicker } = DatePicker
const { Option } = Select
const { TabPane } = Tabs
const { Search } = Input
const { confirm } = Modal
const { TextArea } = Input

const menuList = ['全部', '基本信息', '教学进度', '实验进度']


@inject('mainStore')
class Help extends React.Component {
  constructor(props) {
    super(props)
    this.store = this.props.mainStore
    this.state = {
      loading: false,
      clsDetail: [],
      partList: [1, 1, 1],
      selMenu: 0,
      tecList: [],
      expList: [],
      showDlgT: false,
      showDlgE: false,
      batchT: { week: 16 },
      batchE: { week: 16, gnum: 1, type: '验证', prop: '必做' },
      week: 16,
    }
  }

  export =async () => {
    this.setState({ loading: true })
    let r = await this.props.mainStore.post(urls.API_EXPORT, null)
    if (r.code === 200) {
      this.setState({ loading: false })
      // 打开绝对地址
      window.open(r.url)
      message.success('导出成功！')
    }
  }















  render() {



    const { getFieldDecorator } = this.props.form

    return (
      <Spin spinning={this.state.loading}>

          <Button className="m-item" style={{ 'background': '#21a557', 'color': '#fff' }} onClick={this.export}>导出所有数据</Button>

      </Spin>
    );
  }
}

export default Form.create()(Help)