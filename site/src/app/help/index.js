import React from 'react'
import dayjs from 'dayjs'
import { inject } from 'mobx-react'
import { Form,notification,Drawer,Spin,Switch,Tooltip,Input,InputNumber,Modal,TimePicker,DatePicker,Select,Tabs,Button,Table,message } from 'antd'
import { API_SERVER } from '../../constant/apis'
import moment from 'moment'
import style from './style.less';
import * as urls from '../../constant/urls'
import {debug,isN} from '../../util/fn'

const { RangePicker } = DatePicker
const { Option } = Select
const { TabPane } = Tabs
const { Search } = Input
const { confirm } = Modal
const { TextArea } = Input

const menuList = ['全部','基本信息','教学进度','实验进度']


@inject('mainStore')
class Help extends React.Component {
  constructor(props) {
    super(props)
    this.store = this.props.mainStore
    this.state = {
      loading: false,
      clsDetail:[],
      partList: [1,1,1],
      selMenu: 0,
      tecList: [],
      expList: [],
      showDlgT: false,
      showDlgE: false,
      batchT: {week:16},
      batchE: {week:16,gnum:1,type:'验证',prop:'必做'},
      week:16,
    }
  }


  async componentDidMount() {
    if (isN(this.store.currUser)) {
      this.props.history.push("/login")
    }else{
      this.setState({ loading: true })
      let r = await this.props.mainStore.post(urls.API_QRY_CLS, null)
      this.setState({ loading: false, clsList:r.data})
  
      this.doSelCls('225037001,225037301')
    }
  }

 
  doSelCls =async(e)=>{
    let params = { code: e}
    // debug(params)
    this.setState({ loading: true })
    let r = await this.props.mainStore.post(urls.API_QRY_CLS_MAIN, params)
    let {batchE} = this.state
    batchE.addr = r.data[0]?.addr
    this.setState({ loading: false, clsDetail:r.data, code:e, batchE:batchE, tecList:r.tecList, expList:r.expList  })
    // console.log(r)
  }

  doSelWeb=(e)=>{
    let {clsDetail} = this.state
    clsDetail[0].web = (!clsDetail[0].web)?1:0
    this.setState({clsDetail:clsDetail})
  }

  selMenu =(e)=>{
    this.setState({selMenu:e})
  }






  
  
  render() {
    let {clsList,clsDetail,funList,partList,selMenu,tecList,expList} = this.state
    let cls = clsDetail[0]


    if (!isN(cls)) {
      cls.w_hour = parseInt(cls?.t_hour) + parseInt(cls?.e_hour)
      cls.a_hour = cls.w_hour*16
    }
    

    const {getFieldDecorator} = this.props.form
    
    return (
      <Spin spinning={this.state.loading}>
        <div className="g-sysa">
          <div className="m-bd">
            <div className="m-tab_list">

              <div className="m-fun">
                <div className="m-tl">
                  {cls?.term}课程
                </div>
                {clsList?.map((item,i)=>
                  <div className="m-cls" key={i}>{item.name}</div>
                )}
              </div>


              {(clsDetail.length!==0)&&
              <>
                <div className="m-fun">
                  <div className="m-item" onClick={this.doSave}>保存数据</div>
                </div>
                <div className="m-fun">
                  <div className="m-item">导入历史课程</div>
                  <div className="m-item">导入同类课程</div>
                </div>
                <div className="m-fun">
                  <div className="m-item" onClick={this.doImportT}>剪贴导入教学</div>
                  <div className="m-item" onClick={this.doImportE}>剪贴导入实验</div>
                </div>
                <div className="m-fun">
                  <div className="m-item" onClick={this.doShowDlgT}>批量教学进度</div>
                  <div className="m-item" onClick={this.doShowDlgE}>批量实验进度</div>
                </div>
              </>}
            </div>

            {(clsDetail.length!==0)&&
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
                        initialValue: (cls?.web)?true:false
                      })(<Switch checkedChildren="网" unCheckedChildren="普" />)}
                    </Form.Item>
                  </div>

                  <div className="m-menu">
                    {menuList.map((item,i)=>
                      <div key={i} className={(item.val==1)?"m-item sel":"m-item"} onClick={this.selMenu.bind(this,i)}>{item}</div>
                    )}
                  </div>
                </div>

                

                {((selMenu==0)||(selMenu==1))&&
                <>
                  <div className="m-main">
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
                            rules: [{required: true, message: ' 请输入理论课时!'}], 
                            initialValue: cls?.t_hour 
                          })(<Input  />)}
                        </Form.Item>
                      </div>
                      <div className="m-item">
                        <label>实验课时</label>
                        <Form.Item>
                          {getFieldDecorator('e_hour', { 
                            rules: [{required: true, message: ' 请输入实验课时!'}], 
                            initialValue: cls?.e_hour 
                          })(<Input />)}
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
                            rules: [{required: true, message: ' 请输入主讲教师!'}], 
                            initialValue: cls?.m_tech 
                          })(<Input/>)}
                        </Form.Item>
                      </div>
                      <div className="m-item">
                        <label>辅导教师</label>
                        <Form.Item>
                          {getFieldDecorator('s_tech', { 
                            rules: [{required: false, message: ' 请输入辅导教师!'}], 
                            initialValue: cls?.s_tech 
                          })(<Input/>)}
                        </Form.Item>
                      </div>
                      <div className="m-item">
                        <label>答疑时间</label>
                        <Form.Item>
                          {getFieldDecorator('q_time', { 
                            rules: [{required: false, message: ' 请输入答疑时间!'}], 
                            initialValue: cls?.q_time 
                          })(<Input/>)}
                        </Form.Item>
                      </div>
                      <div className="m-item">
                        <label>答疑地点</label>
                        <Form.Item>
                          {getFieldDecorator('q_addr', { 
                            rules: [{required: false, message: ' 请输入答疑地点!'}], 
                            initialValue: cls?.q_addr 
                          })(<Input/>)}
                        </Form.Item>
                      </div>
                    </div>

                    {(cls?.web===1)&&
                    <div className="m-sect">
                      <div className="m-item">
                        <label>教学网站</label>
                        <Form.Item>
                          {getFieldDecorator('url', { 
                            rules: [{required: true, message: ' 请输入教学网站地址!'}], 
                            initialValue: cls?.url 
                          })(<Input/>)}
                        </Form.Item>
                      </div>
                      <div className="m-item">
                        <label>点击次数</label>
                        <Form.Item>
                          {getFieldDecorator('click', { 
                            rules: [{required: true, message: ' 请输入点击次数!'}], 
                            initialValue: cls?.click 
                          })(<Input/>)}
                        </Form.Item>
                      </div>
                      <div className="m-item">
                        <label>账号名称</label>
                        <Form.Item>
                          {getFieldDecorator('usr', { 
                            rules: [{required: true, message: ' 请输入账号!'}], 
                            initialValue: cls?.usr 
                          })(<Input/>)}
                        </Form.Item>
                      </div>
                      <div className="m-item">
                        <label>登录密码</label>
                        <Form.Item>
                          {getFieldDecorator('pwd', { 
                            rules: [{required: true, message: ' 请输入登录密码!'}], 
                            initialValue: cls?.pwd 
                          })(<Input/>)}
                        </Form.Item>
                      </div>
                    </div>}
                  </div>

                  <div className="m-main">
                    <div className="m-tab">
                      {clsDetail.map((item,i)=>
                        <div className="m-row" key={i}>
                          <span>{i+1}</span>
                          <span>{item.name}</span>
                          <span>{item.cls}</span>
                          <span>{item.st_num}</span>
                          <span>{item.wt}</span>
                          <span>{item.addr}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="m-main">
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
                      })(<TextArea maxLength={200}/>)}
                      <label>课程考核<em>(不超过200字)</em></label>
                      {getFieldDecorator('exam', { 
                        initialValue: cls?.exam 
                      })(<TextArea maxLength={200}/>)}
                      <label>教学方法与手段及相关要求<em>(不超过200字)</em></label>
                      {getFieldDecorator('method', { 
                        initialValue: cls?.method 
                      })(<TextArea maxLength={200}/>)}
                    </div>
                  </div>
                </>}

                {((selMenu==0)||(selMenu==2))&&
                <>
                  <div className="m-main" style={{'margin':'35px 0 0 0'}}>
                    <div className="m-tl">教学进度</div>
                    <div className="m-tech">
                      <div className="m-row-t">
                        <span className="fn-hide"></span>
                        <span>主要教学内容</span>
                        <span>教学形式及内容资料</span>
                        <span>作业与辅导安排</span>
                      </div>

                      {(tecList.length==0)&&<div className="m-none">暂无数据</div>}

                      {tecList.map((item,i)=>
                        <div className="m-row-t" key={i}>
                          <span>{i+1}</span>
                          <Input value={item.cnt} />
                          <Input value={item.method} />
                          <Input value={item.task} />
                        </div>
                      )}
                    </div>
                  </div>
                </>}

                {((selMenu==0)||(selMenu==3))&&
                <>
                  <div className="m-main" style={{'margin':'35px 0 0 0'}}>
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
                      {(expList.length==0)&&<div className="m-none">暂无数据</div>}

                      {expList.map((item,i)=>
                        <div className="m-row-e" key={i}>
                          <span >{i+1}</span>
                          <Input  value={item.name} />
                          <Select value={item.type}  style={{'width':'80px','margin':'0 5px'}} size='small' > 
                            <Option value="验证">验证</Option>
                            <Option value="设计">设计</Option>
                            <Option value="研究">研究</Option>
                            <Option value="综合">综合</Option>
                            <Option value="演示">演示</Option>
                          </Select>
                          <Select value={item.prop} style={{'width':'80px','margin':'0 5px'}} size='small'> 
                            <Option value="验证">必做</Option>
                            <Option value="设计">选做</Option>
                          </Select>
                          <Input  value={item.addr} />
                          <Input  value={item.gnum} />
                        </div>
                      )}
                    </div>
                  </div>
                </>}
              </Form>
            </div>}

            {(clsDetail.length===0)&&<div className="m-tab_none"></div>}
          </div>
        </div>

        <div className="g-help">
          
          <div className="m-web">切换是否是网络课程</div>
        </div>

        <Drawer title="批量教学进度" width="300" onClose={this.doCloseDlgT} visible={this.state.showDlgT}>
          <div className="g-field">
            <label>教学周</label>
            <InputNumber min={1} max={16} defaultValue={16} style={{'width':'100%'}} />
          </div>
          <div className="g-field">
            <label>主要教学内容</label>
            <TextArea rows={4}  defaultValue=''/>
          </div>
          <div className="g-field">
            <label>教学形式及内容资料</label>
            <TextArea rows={4} defaultValue=''/>
          </div>
          <div className="g-field">
            <label>作业与辅导安排</label>
            <TextArea rows={4} defaultValue=''/>
          </div>
          <div className="g-fun">
            <Button onClick={this.doCloseDlgT}>取消</Button>
            <Button type="primary">生成数据</Button>
          </div>
        </Drawer>

        <Drawer title="批量实验进度" width="300" onClose={this.doCloseDlgE} visible={this.state.showDlgE}>
          <div className="g-field">
            <label>教学周</label>
            <InputNumber min={1} max={16} defaultValue={16} style={{'width':'100%'}}/>
          </div>
          <div className="g-field">
            <label>实验项目名称</label>
            <TextArea rows={1}/>
          </div>
          <div className="g-field">
            <label>实验性质</label>
            <Select defaultValue="验证"> 
              <Option value="验证">验证</Option>
              <Option value="设计">设计</Option>
              <Option value="研究">研究</Option>
              <Option value="综合">综合</Option>
              <Option value="演示">演示</Option>
            </Select>
          </div>
          <div className="g-field">
            <label>实验要求</label>
            <Select defaultValue="必做" > 
              <Option value="验证">必做</Option>
              <Option value="设计">选做</Option>
            </Select>
          </div>
          <div className="g-field">
            <label>实验教室</label>
            <Input defaultValue={cls?.addr}/>
          </div>
          <div className="g-field">
            <label>每组人数</label>
            <InputNumber min={1} max={10} defaultValue={1} style={{'width':'100%'}}/>
          </div>
          <div className="g-fun">
            <Button >取消</Button>
            <Button type="primary">生成数据</Button>
          </div>
        </Drawer>
      </Spin>
    );
  }
}

export default Form.create()(Help)