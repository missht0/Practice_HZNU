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


import icon_img from "../../img/icon_img.svg"
import icon_add from "../../img/icon_add.svg"
import icon_del from "../../img/icon_del.svg"


const formatDt = (d, t) => {
  d = d.replaceAll('-', '')
  t = t.replaceAll(':', '')
  return parseInt(`${d}${t}`)
}

const menuList = ['全部', '基本信息', '教学进度', '实验进度']


@inject('mainStore')
class Tech extends React.Component {
  constructor(props) {
    super(props)
    this.store = this.props.mainStore
    this.state = {
      loading: false,
      clsDetail: [],//课程详细信息
      partList: [1, 1, 1],
      selMenu: 0,
      tecList: [],//教学进度
      expList: [],//实验进度
      showDlgT: false,
      showDlgE: false,
      showDlgH: false,
      showDlgS: false,
      batchT: { week: 16 },
      batchE: { week: 16, gnum: 1, type: '验证', prop: '必做' },
      week: 16,
      cls: '',
      code: "",
    }
  }


  async componentDidMount() {
    if (isN(this.store.currUser)) {
      this.props.history.push("/login")
    } else {
      this.setState({ loading: true })
      let r = await this.props.mainStore.post(urls.API_QRY_CLS, null)//从tab_tech_main中获得班级信息
      this.setState({ loading: false, clsList: r.data })
      console.log('clsList', r.data);

      // this.doSelCls('225037001,225037301')//查询默认课程代码
    }
  }


  doSelCls = async (e) => {//根据 u_id 和 课程代码查询课程信息，u_id储存在token中
    let params = { code: e }
    // debug(params)
    this.setState({ loading: true, code: e })
    let r = await this.props.mainStore.post(urls.API_QRY_CLS_MAIN, params)
    console.log(r);
    let { batchE } = this.state
    batchE.addr = r.data[0]?.addr
    r.data.map((item, i) => {
      item.web = (item.web === 1) ? true : false
    })
    this.setState({ loading: false, clsDetail: r.data, code: e, batchE: batchE, tecList: r.tecList, expList: r.expList,cls:r.data[0] })
    console.log("clsDetail", this.state.clsDetail);
    console.log("tecList", this.state.tecList);
    console.log("expList", this.state.expList);
  }

  doSelWeb = (e) => {
    let { clsDetail } = this.state
    clsDetail[0].web = (!clsDetail[0].web) ? 1 : 0
    this.setState({ clsDetail: clsDetail })
  }

  selMenu = (e) => {

    this.setState({ selMenu: e })
  }

  doSave = () => {
    this.props.form.validateFields(async (err, values) => {//form是Form.create()返回的对象，validateFields是form的方法,用于校验表单
      if (err) { return }

      values.web = (values.web) ? 1 : 0
      let { tecList, code, expList } = this.state
      let params = { code: code, tecList: tecList, expList: expList, ...values }
      debug(params)
      this.setState({ loading: true })
      let r = await this.props.mainStore.post(urls.API_SAV_CLS, params)//mainStore是注入的store，用于管理全局的状态，post是mainStore的方法
      this.setState({ loading: false, clsDetail: r.data, techList: r.techList, expList: r.expList })
      message.info("保存数据成功！")
    })
  }


  doChgVal = (k, e) => {
    let val = e.currentTarget.value
    let { clsDetail } = this.state
    clsDetail[0][k] = val
    this.setState(clsDetail)
  }


  doChgFieldT = (k, e) => {
    let val = e.currentTarget.value
    let { batchT } = this.state
    batchT[k] = val
    this.setState({ batchT: batchT })
  }

  doChgFieldE = (k, e) => {
    let val = e.currentTarget.value
    let { batchE } = this.state
    batchE[k] = val
    this.setState({ batchE: batchE })
  }

  doShowDlgT = () => {
    this.setState({ showDlgT: true })
  }
  doShowDlgE = () => {
    this.setState({ showDlgE: true })
  }
  doShowDlgH = () => {
    this.setState({ showDlgH: true })
  }
  doShowDlgS = () => {
    this.setState({ showDlgS: true })
  }
  doCloseDlgT = () => {
    this.setState({ showDlgT: false })
  }
  doCloseDlgE = () => {
    this.setState({ showDlgE: false })
  }
  doCloseDlgH = () => {
    this.setState({ showDlgH: false })
  }
  doCloseDlgS = () => {
    this.setState({ showDlgS: false })
  }


  doBatchT = () => {
    let { tecList, week } = this.state
    let { method, task, cnt } = this.state.batchT
    tecList = []
    for (let i = 0; i < week; i++) {
      tecList.push({ cnt: cnt || '', method: method || '', task: task || '' })
    }
    this.setState({ tecList: tecList, showDlgT: false })
  }

  doBatchE = () => {
    let { expList, week } = this.state
    let { name, type, prop, addr, gnum } = this.state.batchE
    expList = []
    for (let i = 0; i < week; i++) {
      expList.push({ name: name || '', type: type, prop: prop, addr: addr, gnum: gnum })
    }
    console.log(expList)
    this.setState({ expList: expList, showDlgE: false })
  }

  doBatchH = (i) => {
    return () => {
      console.log(i);
      this.setState({ showDlgH: false ,cls:i})
    }
  }
  doBatchS = (i) => {
    return () => {
      console.log(i);
      this.setState({ showDlgS: false ,cls:i})
    }
  }

  doDelTechItem = (i) => {
    let { tecList } = this.state
    tecList.splice(i, 1)
    this.setState({ tecList: tecList })
  }

  doDelExpItem = (i) => {
    let { expList } = this.state
    expList.splice(i, 1)
    this.setState({ expList: expList })
  }

  doChgTecList = (i, k, e) => {
    let val = e.currentTarget.value
    let { tecList } = this.state
    tecList[i][k] = val
    this.setState({ tecList: tecList })
  }

  doChgExpList = (i, k, e) => {
    let val = e.currentTarget.value
    let { expList } = this.state
    expList[i][k] = val
    this.setState({ expList: expList })
  }

  doChgExpSel = (i, k, e) => {
    let { batchE, expList } = this.state
    expList[i][k] = e

    console.log(expList)
    this.setState({ expList: expList })
  }

  doChgWeek = (e) => {
    this.setState({ week: e })
  }

  doChgNumE = (e) => {
    let { batchE } = this.state
    batchE.gnum = e
    this.setState({ batchE: batchE })
  }


  doChgSel = (k, e) => {
    let { batchE } = this.state
    switch (k) {
      case 'prop': batchE.prop = e; break;
      case 'type': batchE.type = e; break;
    }
    this.setState({ batchE: batchE })
  }


  doImportH = async () => {
    let { code } = this.state;
    this.setState({ loading:true })
    let r = await this.props.mainStore.post(urls.API_QRY_CLS_HIS, { code: code })
    r.data.map((item, i) => {
      item.web = (item.web === 1) ? true : false
    })
    this.setState({ showDlgH: true,loading:false,oldclsList:r.data })
  }
  doImportS = async () => {
    let { code } = this.state;
    this.setState({ loading:true })
    let r = await this.props.mainStore.post(urls.API_QRY_CLS_SIM, { code: code })
    r.data.map((item, i) => {
      item.web = (item.web === 1) ? true : false
    })
    this.setState({ showDlgS: true,loading:false,simclsList:r.data })
    console.log(this.state);
  }

  doImportT = async () => {
    let that = this
    confirm({
      title: '提示',
      content: '您确认要将剪贴板的数据导入到教学进度？（原教学进度数据会被全部替换）',
      async onOk() {
        const t = await navigator.clipboard.readText();//navigator的作用是获取浏览器的信息，clipboard是剪贴板的意思,readText是读取剪贴板的文本
        const ret = []
        const list = t.split('\r\n')
        list.map((item, i) => {
          if (i !== list.length - 1) {
            let r = item.split('\t')
            ret.push({ cnt: r[0], method: r[1], task: r[2] })
          }
        })

        if (ret.length > 16) {
          message.error('剪贴数据不能操过16周！')
        } else if (ret.length === 0) {
          message.error('剪贴数据错误！')
        } else {
          that.setState({ tecList: ret })
        }

      }
    });
  }

  doImportE = async () => {
    let that = this
    confirm({
      title: '提示',
      content: '您确认要将剪贴板的数据导入到实验进度？（原实验进度数据会被全部替换）',
      async onOk() {
        const t = await navigator.clipboard.readText();
        const ret = []
        const list = t.split('\r\n')
        list.map((item, i) => {
          if (i !== list.length - 1) {
            let r = item.split('\t')
            ret.push({ name: r[0], type: r[1], prop: r[2], addr: r[3], gnum: r[4] })
          }
        })

        if (ret.length > 16) {
          message.error('剪贴数据不能操过16周！')
        } else if (ret.length === 0) {
          message.error('剪贴数据错误！')
        } else {
          that.setState({ expList: ret })
        }

      }
    });
  }





  render() {
    let { clsList, clsDetail, funList, partList, selMenu, tecList, expList, clsindex,cls ,oldclsList,simclsList} = this.state

    if (!isN(cls)) {
      cls.w_hour = parseInt(cls?.t_hour) + parseInt(cls?.e_hour)
      cls.a_hour = cls.w_hour * 16
    }

    const { getFieldDecorator } = this.props.form

    return (
      <Spin spinning={this.state.loading}>
        <div className="g-sysa">

          <div className="m-bd">
            <div className="m-tab_list">

              <div className="m-fun">
                <div className="m-tl">
                  {cls?.term}课程
                </div>
                {clsList?.map((item, i) =>
                  <div className="m-cls" key={i} onClick={this.doSelCls.bind(this, item.code)}>{item.name}</div>
                )}
              </div>


              {(clsDetail.length !== 0) &&
                <>
                  <div className="m-fun">
                    <div className="m-item" style={{ 'background': '#21a557', 'color': '#fff' }} onClick={this.doSave}>保存数据</div>
                  </div>
                  <div className="m-fun">
                    <Tooltip placement="right" title="导入历史课程">
                      <div className="m-item" style={{ 'background': '#21a500', 'color': '#fff' }} onClick={this.doImportH}  >导入历史课程</div>
                    </Tooltip>
                    <Tooltip placement="right" title="尚未支持">
                      <div className="m-item" style={{ 'background': '#21a500', 'color': '#fff' }} onClick={this.doImportS} >导入同类课程</div>
                    </Tooltip>
                  </div>
                  <div className="m-fun">
                    <Tooltip placement="right" title="Excel选择16行3列拷贝">
                      <div className="m-item" style={{ 'background': '#41ba00', 'color': '#fff' }} onClick={this.doImportT}>剪贴导入教学</div>
                    </Tooltip>
                    <Tooltip placement="right" title="Excel选择16行5列拷贝">
                      <div className="m-item" style={{ 'background': '#41ba00', 'color': '#fff' }} onClick={this.doImportE}>剪贴导入实验</div>
                    </Tooltip>


                  </div>
                  <div className="m-fun">
                    <Tooltip placement="right" title="批量生成若干周教学数据">
                      <div className="m-item" style={{ 'background': '#b8d800', 'color': '#fff' }} onClick={this.doShowDlgT}>批量教学进度</div>
                    </Tooltip>
                    <Tooltip placement="right" title="批量生成若干周实验数据">
                      <div className="m-item" style={{ 'background': '#b8d800', 'color': '#fff' }} onClick={this.doShowDlgE}>批量实验进度</div>
                    </Tooltip>


                  </div>
                </>}
            </div>

            {(clsDetail.length !== 0) &&
              <div className="m-tab_cnt">
                <Form className="m-form" layout="horizontal" >
                  <div className="m-hd">
                    <div className="m-term">{cls?.term}学年</div>
                    <div className="m-title">
                      <span>{cls?.name}</span>
                      <span>{cls?.ename}</span>
                    </div>
                    <div className="m-info">
                      <span>{cls?.cform}</span>
                      <span>{cls?.cprop}</span>
                      <Form.Item>
                        {getFieldDecorator('web', {
                          valuePropName: 'checked',
                          initialValue: cls?.web
                        })(<Switch checkedChildren="网" unCheckedChildren="普" onClick={this.doSelWeb} />)}
                      </Form.Item>
                    </div>

                    <div className="m-menu">
                      {menuList.map((item, i) =>
                        <div key={i} className={(item.val == 1) ? "m-item sel" : "m-item"} onClick={this.selMenu.bind(this, i)}>{item}</div>
                      )}
                    </div>
                  </div>



                  <>
                    <div className={((selMenu == 0) || (selMenu == 1)) ? "m-main" : "m-main fn-hide"} >
                      <div className="m-tl">基本信息</div>

                      <div className="m-sect">
                        <div className="m-item">
                          <label>授课校区</label>
                          <span>{cls?.pos}</span>
                        </div>
                        <div className="m-item">
                          <label>开课学院</label>
                          <span>{cls?.col}</span>
                        </div>
                        <div className="m-item">
                          <label>课程学分</label>
                          <span>{cls?.mark}</span>
                        </div>
                        <div className="m-item">
                          <label>教学周期</label>
                          <span>{cls?.week}</span>
                        </div>
                      </div>
                      <div className="m-sect">
                        <div className="m-item">
                          <label>理论课时</label>
                          <Form.Item>
                            {getFieldDecorator('t_hour', {
                              rules: [{ required: true, message: ' 请输入理论课时!' }],
                              initialValue: cls?.t_hour
                            })(<Input onChange={this.doChgVal.bind(this, 't_hour')} />)}
                          </Form.Item>
                        </div>
                        <div className="m-item">
                          <label>实验课时</label>
                          <Form.Item>
                            {getFieldDecorator('e_hour', {
                              rules: [{ required: true, message: ' 请输入实验课时!' }],
                              initialValue: cls?.e_hour
                            })(<Input onChange={this.doChgVal.bind(this, 'e_hour')} />)}
                          </Form.Item>
                        </div>
                        <div className="m-item">
                          <label>周学时数</label>
                          <span>{cls?.w_hour}</span>
                        </div>
                        <div className="m-item">
                          <label>总课时数</label>
                          <span>{cls?.a_hour}</span>
                        </div>
                      </div>

                      <div className="m-sect">
                        <div className="m-item">
                          <label>主讲教师</label>
                          <Form.Item>
                            {getFieldDecorator('m_tech', {
                              rules: [{ required: true, message: ' 请输入主讲教师!' }],
                              initialValue: cls?.m_tech||cls.uname
                            })(<Input />)}
                          </Form.Item>
                        </div>
                        <div className="m-item">
                          <label>辅导教师</label>
                          <Form.Item>
                            {getFieldDecorator('s_tech', {
                              rules: [{ required: false, message: ' 请输入辅导教师!' }],
                              initialValue: cls?.s_tech
                            })(<Input />)}
                          </Form.Item>
                        </div>
                        <div className="m-item">
                          <label>答疑时间</label>
                          <Form.Item>
                            {getFieldDecorator('q_time', {
                              rules: [{ required: false, message: ' 请输入答疑时间!' }],
                              initialValue: cls?.q_time
                            })(<Input />)}
                          </Form.Item>
                        </div>
                        <div className="m-item">
                          <label>答疑地点</label>
                          <Form.Item>
                            {getFieldDecorator('q_addr', {
                              rules: [{ required: false, message: ' 请输入答疑地点!' }],
                              initialValue: cls?.q_addr
                            })(<Input />)}
                          </Form.Item>
                        </div>
                      </div>

                      {(cls?.web) &&
                        <div className="m-sect">
                          <div className="m-item">
                            <label>教学网站</label>
                            <Form.Item>
                              {getFieldDecorator('url', {
                                rules: [{ required: true, message: ' 请输入教学网站地址!' }],
                                initialValue: cls?.url
                              })(<Input />)}
                            </Form.Item>
                          </div>
                          <div className="m-item">
                            <label>点击次数</label>
                            <Form.Item>
                              {getFieldDecorator('click', {
                                rules: [{ required: true, message: ' 请输入点击次数!' }],
                                initialValue: cls?.click
                              })(<Input />)}
                            </Form.Item>
                          </div>
                          <div className="m-item">
                            <label>账号名称</label>
                            <Form.Item>
                              {getFieldDecorator('usr', {
                                rules: [{ required: true, message: ' 请输入账号!' }],
                                initialValue: cls?.usr
                              })(<Input />)}
                            </Form.Item>
                          </div>
                          <div className="m-item">
                            <label>登录密码</label>
                            <Form.Item>
                              {getFieldDecorator('pwd', {
                                rules: [{ required: true, message: ' 请输入登录密码!' }],
                                initialValue: cls?.pwd
                              })(<Input />)}
                            </Form.Item>
                          </div>
                        </div>}
                    </div>

                    <div className={((selMenu == 0) || (selMenu == 1)) ? "m-main" : "m-main fn-hide"}>
                      <div className="m-tab">
                        {clsDetail.map((item, i) =>
                          <div className="m-row" key={i}>
                            <span>{i + 1}</span>
                            <span>{item.name}</span>
                            <span>{item.cls}</span>
                            <span>{item.st_num}</span>
                            <span>{item.wt}</span>
                            <span>{item.addr}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={((selMenu == 0) || (selMenu == 1)) ? "m-main" : "m-main fn-hide"}>
                      <div className="m-tab">
                        <label>课程描述及与其他课程关系<em>(不超过200字)</em></label>
                        <Form.Item>
                          {getFieldDecorator('desc', {
                            initialValue: cls?.desc
                          })(<TextArea maxLength={200} />)}
                        </Form.Item>
                        <label>使用教材与参考书目<em>(不超过200字)</em></label>
                        {getFieldDecorator('mate', {
                          initialValue: cls?.mate
                        })(<TextArea maxLength={200} />)}
                        <label>课程考核<em>(不超过200字)</em></label>
                        {getFieldDecorator('exam', {
                          initialValue: cls?.exam
                        })(<TextArea maxLength={200} />)}
                        <label>教学方法与手段及相关要求<em>(不超过200字)</em></label>
                        {getFieldDecorator('method', {
                          initialValue: cls?.method
                        })(<TextArea maxLength={200} />)}
                      </div>
                    </div>
                  </>


                  <div className={((selMenu == 0) || (selMenu == 2)) ? "m-main" : "m-main fn-hide"} style={{ 'margin': '35px 0 0 0' }}>
                    <div className="m-tl">教学进度</div>
                    <div className="m-tech">
                      <div className="m-row-t">
                        <span className="fn-hide"></span>
                        <span>主要教学内容</span>
                        <span>教学形式及内容资料</span>
                        <span>作业与辅导安排</span>
                      </div>

                      {(tecList.length == 0) && <div className="m-none">暂无数据</div>}

                      {tecList.map((item, i) =>
                        <div className="m-row-t" key={i}>
                          <span onClick={this.doDelTechItem.bind(this, i)}>{i + 1}</span>
                          <Input onChange={this.doChgTecList.bind(this, i, 'cnt')} value={item.cnt} />
                          <Input onChange={this.doChgTecList.bind(this, i, 'method')} value={item.method} />
                          <Input onChange={this.doChgTecList.bind(this, i, 'task')} value={item.task} />
                        </div>
                      )}
                    </div>
                  </div>



                  <div className={((selMenu == 0) || (selMenu == 3)) ? "m-main" : "m-main fn-hide"} style={{ 'margin': '35px 0 0 0' }}>
                    <div className="m-tl">实验进度</div>
                    <div className="m-tech">
                      <div className="m-row-e">
                        <span className="fn-hide"></span>
                        <span>实验项目名称</span>
                        <span>实验性质</span>
                        <span>实验要求</span>
                        <span>实验教室</span>
                        <span>每组人数</span>
                      </div>
                      {(expList.length == 0) && <div className="m-none">暂无数据</div>}

                      {expList.map((item, i) =>
                        <div className="m-row-e" key={i}>
                          <span onClick={this.doDelExpItem.bind(this, i)}>{i + 1}</span>
                          <Input onChange={this.doChgExpList.bind(this, i, 'name')} value={item.name} />
                          <Select value={item.type} onChange={this.doChgExpSel.bind(this, i, 'type')} style={{ 'width': '80px', 'margin': '0 5px' }} size='small' >
                            <Option value="验证">验证</Option>
                            <Option value="设计">设计</Option>
                            <Option value="研究">研究</Option>
                            <Option value="综合">综合</Option>
                            <Option value="演示">演示</Option>
                          </Select>
                          <Select value={item.prop} onChange={this.doChgExpSel.bind(this, i, 'prop')} style={{ 'width': '80px', 'margin': '0 5px' }} size='small'>
                            <Option value="验证">必做</Option>
                            <Option value="设计">选做</Option>
                          </Select>
                          <Input onChange={this.doChgExpList.bind(this, i, 'addr')} value={item.addr} />
                          <Input onChange={this.doChgExpList.bind(this, i, 'gnum')} value={item.gnum} />
                        </div>
                      )}
                    </div>
                  </div>

                </Form>
              </div>}

            {(clsDetail.length === 0) && <div className="m-tab_none"></div>}
          </div>
        </div>

        <Drawer title="批量教学进度" width="300" onClose={this.doCloseDlgT} visible={this.state.showDlgT}>
          <div className="g-field">
            <label>教学周</label>
            <InputNumber min={1} max={16} defaultValue={16} style={{ 'width': '100%' }} onChange={this.doChgWeek} />
          </div>
          <div className="g-field">
            <label>主要教学内容</label>
            <TextArea rows={4} onChange={this.doChgFieldT.bind(this, 'cnt')} defaultValue='' />
          </div>
          <div className="g-field">
            <label>教学形式及内容资料</label>
            <TextArea rows={4} onChange={this.doChgFieldT.bind(this, 'method')} defaultValue='' />
          </div>
          <div className="g-field">
            <label>作业与辅导安排</label>
            <TextArea rows={4} onChange={this.doChgFieldT.bind(this, 'task')} defaultValue='' />
          </div>
          <div className="g-fun">
            <Button onClick={this.doCloseDlgT}>取消</Button>
            <Button type="primary" onClick={this.doBatchT}>生成数据</Button>
          </div>
        </Drawer>

        <Drawer title="批量实验进度" width="300" onClose={this.doCloseDlgE} visible={this.state.showDlgE}>
          <div className="g-field">
            <label>教学周</label>
            <InputNumber min={1} max={16} defaultValue={16} style={{ 'width': '100%' }} onChange={this.doChgWeek} />
          </div>
          <div className="g-field">
            <label>实验项目名称</label>
            <TextArea rows={1} onChange={this.doChgFieldE.bind(this, 'name')} />
          </div>
          <div className="g-field">
            <label>实验性质</label>
            <Select defaultValue="验证" onChange={this.doChgSel.bind(this, 'type')} >
              <Option value="验证">验证</Option>
              <Option value="设计">设计</Option>
              <Option value="研究">研究</Option>
              <Option value="综合">综合</Option>
              <Option value="演示">演示</Option>
            </Select>
          </div>
          <div className="g-field">
            <label>实验要求</label>
            <Select defaultValue="必做" onChange={this.doChgSel.bind(this, 'prop')} >
              <Option value="验证">必做</Option>
              <Option value="设计">选做</Option>
            </Select>
          </div>
          <div className="g-field">
            <label>实验教室</label>
            <Input onChange={this.doChgFieldE.bind(this, 'addr')} defaultValue={cls?.addr} />
          </div>
          <div className="g-field">
            <label>每组人数</label>
            <InputNumber min={1} max={10} defaultValue={1} onChange={this.doChgNumE} style={{ 'width': '100%' }} />
          </div>
          <div className="g-fun">
            <Button onClick={this.doCloseDlgE}>取消</Button>
            <Button type="primary" onClick={this.doBatchE}>生成数据</Button>
          </div>
        </Drawer>


        <Drawer title="选择历史课程" width="300" onClose={this.doCloseDlgH} visible={this.state.showDlgH}>
          {
            oldclsList?.map((item, i) => {
              return (
                <div className="checkcls g-field" key={i}>
                  <Button type="primary" onClick={this.doBatchH(item)}>{item.term+" "+item.wt}</Button>
                </div>
              )
            })
          }
        </Drawer>
        <Drawer title="选择同类课程" width="300" onClose={this.doCloseDlgS} visible={this.state.showDlgS}>
          {
            simclsList?.map((item, i) => {
              return (
                <div className="checkcls g-field" key={i}>
                  <Button type="primary" onClick={this.doBatchS(item)}>{item.uname+" "+item.wt}</Button>
                </div>
              )
            })
          }
        </Drawer>

      </Spin>
    );
  }
}

export default Form.create()(Tech)