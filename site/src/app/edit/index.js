import React from 'react'
import dayjs from 'dayjs'
import { inject } from 'mobx-react'
import { notification,Spin,Switch,Skeleton,Input,Modal,DatePicker,Select,Tabs,Button,Table,message } from 'antd'
import { API_SERVER } from 'constant/apis'
import moment from 'moment'
import style from './style.less';
import * as urls from 'constant/urls'
import Draggable from 'react-draggable'; 
import fileToBlobScaled from 'util/fileToBlobScaled'
import clone from 'util/clone'
import {fieldList,unitByVal,isN,msg} from 'util/fn'

const { RangePicker } = DatePicker
const { Option } = Select
const { TabPane } = Tabs
const { Search } = Input
const { confirm } = Modal

import icon_img from "img/icon_img.svg"
import icon_ani from "img/icon_ani.svg"
import icon_mix from "img/icon_mix.svg"
import icon_fil from "img/icon_fil.svg"
import icon_col from "img/icon_cool.svg"
import icon_oth from "img/icon_oth.svg"
import icon_fan from "img/icon_fan.svg"
import icon_add from "img/icon_add.svg"
import icon_del from "img/icon_del.svg"
import icon_win from "img/icon_wind.svg"
import icon_mod from "img/icon_mod.svg"


var img_fan  = "img/fan.png"
var img_wind = "img/wind.gif"

var part = { id:null, code:null, type:null, season:0, ord: null, x:10, y:30, title:'', list:[{key:'',val:null,unt:''}]} 
var menuList = [{name:'添加混风段', icon: icon_mix, type: 'mix', pn: 4}, 
                {name:'添加过滤段', icon: icon_fil, type: 'fil', pn: 4},
                {name:'添加盘管段', icon: icon_col, type: 'col', pn: 6},
                {name:'添加其他段', icon: icon_oth, type: 'oth', pn: 4},
                {name:'添加风机段', icon: icon_fan, type: 'fan', pn: 2}]


@inject('mainStore')
class Edit extends React.Component {
  constructor(props) {
    super(props)
    this.store = this.props.mainStore
    this.state = {
      loading: false,
      codeList: [],
      bk: null,
      fan: [],
      wind: [],
      items: [],
      selItem: null,
      sel: [0,0,0,0,0],
      edit: false,
      code: null,
      cloneCode:null,
    }
  }

  initVar =()=>{
    this.setState({
      fan: [],
      bk: null,
      items: [],
      selItem: null,
      sel: [0,0,0,0,0],
      edit: false,
    })
  }



  async componentDidMount() {
    if (isN(this.store.currUser)) {
      this.props.history.push("/login")
    }else{
      this.setState({ loading: true })
      let r = await this.store.post(urls.API_QRY_SYS_CODE, null)
      let codeList = r.data
      let code = (codeList.length===0)?null:codeList[0].code
      this.setState({ loading: false, codeList:codeList, code: code})
    }
  }


  doSelCode=async(e)=>{
    this.setState({code: e})
    this.initVar()
  }

  doSelCloneCode=async(e)=>{
    this.setState({cloneCode: e})
  }

  doLoadSysData=async()=>{
    this.initVar()
    let params = { code: this.state.code }
    this.setState({ loading: true })
    let r = await this.props.mainStore.post(urls.API_LOAD_SYS_DATA, params)
    // console.log(r.data)
    this.setState({ loading: false, code: this.state.code, edit: true })
    this.renderData(r.data)
  }

  renderData=async(d)=>{
    let items = []
    d.map((item,i)=>{
      if (item.type === 'sys') {
        // console.log(item)
        this.setState({ 
          bk:item.list.bk, 
          fan:clone(item.list.list),
          wind:clone(item.list.wind),
          sid: item.id 
        })
      }else{
        items.push(item)
      }
    })
    console.log(items)
    this.setState({ items:items })
  }

  doSaveSysData=async()=>{
    let {fan,bk,items,code,sid,wind} = this.state
    sid = isN(sid)?-1:sid

    let invalid = false
    items.map((item,i)=>{
      item.id = isN(item.id)?-1:item.id
      item.list.map((o,j)=>{
        // console.log(isN(o.key))
        if (isN(o.key)||isN(o.val)) {
          invalid = true
        } 
      })
    })

    if (invalid) {
      msg('请输入空调段的属性')
      return
    }

    let params = {
      sys: {sid: sid, code:code, bk:bk, list: fan, wind: wind},
      items: items
    }

    console.log(params)


    this.setState({ loading: true })
    let r = await this.props.mainStore.post(urls.API_SAVE_SYS_DATA, params)
    this.setState({ loading: false })

    notification.success({
      message:'提示',
      description: '保存系统数据成功',
      placement: 'topLeft',
      style: {
        width: 300,
        color:'#00c062',
        background: 'rgba(255,255,255,.9)',
      },
    })
  }


  doCloneSys=async()=>{
    let that = this
    let {code,cloneCode} = this.state

    if (isN(cloneCode)) {
      msg("请选择复制的系统编号！")
      return
    }

    confirm({
      title: '提示',
      content: '通过模板复制会将原系统数据会全部删除，确认执行？',
      async onOk() {
        let params = {code: code, cloneCode:cloneCode}
        that.setState({ loading: true })
        let r = await that.props.mainStore.post(urls.API_CLON_SYS_DATA, params)
        that.setState({ loading: false, code: code, edit: true })
        that.renderData(r.data)
      },
      onCancel() {
        console.log('Cancel');
      },
    });


    
  }


  doUpload=async(e)=>{
    
    if (e.target.files.length > 0) {
      let file = e.target.files[0]
      const blob = await fileToBlobScaled(file, 1300, 800, 0.7)
      let formData = new FormData()
      formData.append('file', blob)
      this.setState({ loading: true })
      let r = await this.props.mainStore.post(urls.API_UPLOAD, formData)
      if (r.code === 200) {
        this.setState({ loading: false,  bk: r.data.path })
        // console.log(r)
        message.info('系统结构图更新成功')
      } else {
        message.error(r.msg)
      }
    }
  }


  doAddFanPic=async()=>{
    let { fan } = this.state
    if (fan.length===2) {
      msg('风机动画不能超过2个！')
      return
    }
    fan.push({type:'fanpic',x:0,y:0,url:img_fan})
    this.setState({fan:fan})
  }


  delFanPic=async(i)=>{
    let { fan } = this.state
    fan.splice(i,1)
    this.setState({fan:fan})
  }

  doAddWindPic=async()=>{
    let { wind } = this.state
    if (wind.length===2) {
      msg(' 气流动画不能超过2个！')
      return
    }
    wind.push({type:'wind',x:0,y:0,url:img_wind})
    this.setState({wind:wind})
  }

  delWindPic=async(i)=>{
    let { wind } = this.state
    wind.splice(i,1)
    this.setState({wind:wind})
  }


  getIdByType = (type)=>{
    switch(type) {
      case 'mix': return 0;break;
      case 'fil': return 1;break;
      case 'col': return 2;break;
      case 'oth': return 3;break;
      case 'fan': return 4;break;
    }
  }

  doAddItem=async(type)=>{
    let {items,sel,code} = this.state
    let item = clone(part)
    item.code = code
    item.type = type
    item.ord = sel[this.getIdByType(type)]+1
    items.push(item)
    this.setState({items:items})
  }

  doDelItem=(i)=>{
    let that = this
    confirm({
      title: '提示',
      content: '您确认要删除该部件？',
      onOk() {
        let {items}= that.state
        items.splice(i,1)
        that.setState({items:items})
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  doAddItemAttr=(i)=>{
    let {items}= this.state
    items[i].list.push({key:'',val:null,unt:''})
    this.setState({items:items})
  }

  doDelItemAttr=(i,j)=>{
    let {items}= this.state
    items[i].list.splice(j,1)
    this.setState({items:items})
  }

  

  doSearch=async()=>{

  }


  chgVal =(type,i,j,e)=>{
    let val = e.currentTarget.value
    let {items}=this.state
    switch(type) {
      case 'title':
        items[i].title = val
        break;
      case 'attr':
        items[i].list[j].key = val
        break;
    }
    this.setState({items:items})
  }


  chgSeason=(i,e)=>{
    let {items}=this.state
    items[i].season=(e)?0:1
    this.setState({items:items})
  }

  doSelField=(i,j,val)=>{
    let {items}=this.state
    items[i].list[j].val = val
    let unt = unitByVal(val.substr(6))
    items[i].list[j].unt = unt
    this.setState({items:items})
  }

  selPartIndex=(i,j)=>{
    let {sel} = this.state
    sel[i]=j
    this.setState({sel:sel})
  }

  onStop = (item,i,e,pos) => {
    // console.log(item)
    switch(item.type) {
      case 'fanpic':
        let { fan } = this.state
        fan[i].x = pos.x
        fan[i].y = pos.y
        this.setState({fan:fan})
        break;
      case 'wind':
        let { wind } = this.state
        wind[i].x = pos.x
        wind[i].y = pos.y
        this.setState({wind:wind})
        break;
      default:
        let {items}= this.state
        items[i].x = pos.x
        items[i].y = pos.y
        this.setState((items))
        // console.log('mix')
    }
  }

  
  
  render() {
    let {codeList,code,cloneCode,fan,bk,items,sel,wind} = this.state
    // fan = (fan.length!==0)?fan:{x:0,y:0,url:''}

    // console.log(fan)
    
    return (
      <Spin spinning={this.state.loading}>
        <div className="g-home">
          
          <div className="m-bd">
            <div className="m-tab_list">
              <div className="m-query">
                <Search placeholder="输入关键字" onSearch={this.doSearch}  />
              </div>

              <div className="m-query">
                <label>请选择系统型号</label>
                <Select value={code} onChange={this.doSelCode} >
                  {codeList.map((item,i)=>
                    <Option value={item.code} key={i}>{item.code}</Option>
                  )}
                </Select>
              </div>

              <div className="m-query">

                
                <div className="m-btn" onClick={this.doLoadSysData}>编辑系统</div>

                {!isN(bk)&&
                <div className="m-btn c-red"  onClick={this.doSaveSysData}>保存系统</div>}
              </div>


              
              <div className="m-menu">

                
                <div className="m-sect" data-index="模板">
                  <div className="m-item">
                    <div className="m-row"  onClick={this.doCloneSys}>
                      <img src={icon_mod} /><span>通过模板复制</span>
                    </div>
                    <Select onChange={this.doSelCloneCode} >
                      {codeList.map((item,i)=>{
                        if (item.code !== code) return (
                          <Option value={item.code} key={i}>{item.code}</Option>)
                      }
                        
                      )}
                    </Select>
                  </div>
                </div>

                
                <div className="m-sect" data-index="步骤.1">
                  <div className="m-item">
                    <div className="m-row">
                      <img src={icon_img} /><span>添加系统结构</span>
                      <input type="file" accept="image/*;" onChange={this.doUpload} />
                    </div>
                  </div>
                </div>

                {!isN(bk)&&
                <div className="m-sect" data-index="步骤.2">
                  <div className="m-item" >
                    <div className="m-row" onClick={this.doAddFanPic}>
                      <img src={icon_ani} /><span>添加风扇动画</span>
                    </div>
                    {(fan.length>0)&&
                    <div className="m-row">
                      {fan.map((item,i)=>
                        <div key={i} className="m-id" onClick={this.delFanPic.bind(this,i)}>
                          <span>{i+1}</span> <img src={icon_del}/>
                        </div>
                      )}
                    </div>}
                  </div>
                </div>}

                {!isN(bk)&&
                <div className="m-sect" data-index="步骤.3">
                  <div className="m-item" >
                    <div className="m-row" onClick={this.doAddWindPic}>
                      <img src={icon_win} /><span>添加气流动画</span>
                    </div>
                    {( wind.length>0)&&
                    <div className="m-row">
                      {wind.map((item,i)=>
                        <div key={i} className="m-id" onClick={this.delWindPic.bind(this,i)}>
                          <span>{i+1}</span> <img src={icon_del}/>
                        </div>
                      )}
                    </div>}
                  </div>
                </div>}

               {!isN(bk)&&
                <div className="m-sect" data-index="步骤.4">
                  {menuList.map((item,i)=>
                    <div className="m-item" key={i}>
                      <div className="m-row" onClick={this.doAddItem.bind(this,item.type)}>
                        <img src={item.icon} /><span>{item.name}</span>
                      </div>
                      <div className="m-row">
                        {Array(item.pn).fill().map((x,j)=>
                          <div key={j} className={(sel[i]==j)?"m-id sel":"m-id"} onClick={this.selPartIndex.bind(this,i,j)}>{j+1}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>}
              </div>
            </div>

            <div className="m-tab_cnt">
              {(!this.state.bk)&&
              <div className="m-none"> 系统尚未初始化</div>}
              <div className="m-sys_bk">

                {(bk!==null)&& <img src={`${API_SERVER}/${bk}`} /> }

                {this.state.fan.map((item,i)=>
                  <Draggable key={i} bounds="parent" 
                             defaultPosition={{x: item.x, y: item.y}} 
                             onStop={this.onStop.bind(this,item,i)} >
                    <img src={`${API_SERVER}/${item.url}`} />
                  </Draggable>
                )}

                {this.state.wind.map((item,i)=>
                  <Draggable key={i} bounds="parent" 
                             defaultPosition={{x: item.x, y: item.y}} 
                             onStop={this.onStop.bind(this,item,i)} >
                    <img src={`${API_SERVER}/${item.url}`} />
                  </Draggable>
                )}


                {items.map((item,i)=>
                  <Draggable key={i} bounds="parent" handle="strong"
                             defaultPosition={{x: item.x, y: item.y}} 
                             position={{x: item.x, y: item.y}}
                             onStop={this.onStop.bind(this,item,i)} >
                    <div className="m-item">
                      <div className={`m-tl ${item.type}`}>
                        <strong className="m-id">{item.type}{item.ord}</strong>
                        <input type="text" value={item.title} placeholder="请输入名称" onChange={this.chgVal.bind(this,'title',i,i)} />
                        <Switch checkedChildren="夏" unCheckedChildren="冬" defaultChecked={(item.season===0)} onChange={this.chgSeason.bind(this,i)} />
                      </div>
                      {item.list.map((o,j)=>
                        <div className="m-row" key={j}>
                          <input type="text" placeholder="请输入..." maxLength={10} value={o.key} onChange={this.chgVal.bind(this,'attr',i,j)} />
                          <Select size="small" value={o.val} onChange={this.doSelField.bind(this,i,j)} >
                            {fieldList(item.ord,item.type).map((field,k)=>
                              <Option value={field} key={k}>{field.substr(6).toUpperCase()}</Option>
                            )}
                          </Select>
                          <i>{o.unt}</i>
                          <div className="m-del_item">
                            <img src={icon_del} onClick={this.doDelItemAttr.bind(this,i,j)}/>
                          </div>
                        </div>
                      )}
                      <div className="m-fun">
                        <div className="m-btn">
                          <img src={icon_add} onClick={this.doAddItemAttr.bind(this,i)}/>
                        </div>
                        <div className="m-btn">
                          <img src={icon_del} onClick={this.doDelItem.bind(this,i)}/>
                        </div>
                      </div>
                    </div>
                  </Draggable>
                )}
              </div>
            </div>
          </div>
        </div>
      </Spin>
    );
  }
}

export default Edit