var express = require('express');
var axios = require('axios');
var fs = require('fs');
var path = require('path')
var jwt = require('jsonwebtoken')
var formidable = require('formidable')
var router = express.Router()
var dayjs = require('dayjs')
var db = require("../db/db")
var PizZip = require('pizzip')
var Docxtemplater = require('docxtemplater');
const { stringify } = require('querystring');

var root = path.resolve(__dirname, '../')
var clone = (e) => {
  return JSON.parse(JSON.stringify(e))
}

const SECRET_KEY = 'ANSAIR-SYSTEM'

var callSQLProc = (sql, params, res) => {
  return new Promise(resolve => {
    db.procedureSQL(sql, JSON.stringify(params), (err, ret) => {
      if (err) {
        res.status(500).json({ code: -1, msg: '提交请求失败，请联系管理员！', data: null })
      } else {
        resolve(ret)
      }
    })
  })
}

var callP = async (sql, params, res) => {
  return await callSQLProc(sql, params, res)
}


var decodeUser = (req) => {
  let token = req.headers.authorization
  return JSON.parse(token?.split(' ')[1])
}


router.post('/export', async (req, res, next) => {
  let sql = `CALL PROC_EXPORT`
  let r = await callP(sql, null, res)
  // 导出docx
  for (let i = 0; i < r.length; i++) {
    console.log(i);
    // for(let i=0;i<1;i++){
    let uid = r[i].uid.split(',')
    while (uid.length > 0) {
      let params = { uid: uid[uid.length-1], code: r[i].code }
      console.log(uid,r[i].code);
      let sql2 = `CALL PROC_QRY_TECH(?)`//用u_id和code在tab_tech中查询子表（教学进度）
      let sql3 = `CALL PROC_QRY_EXP(?)`//用u_id和code在tab_exp中查询子表（实验进度）
      let r2 = await callP(sql2, params, res)
      let r3 = await callP(sql3, params, res)
      console.log(r2);

      let content = fs.readFileSync(path.resolve(__dirname, '../template.docx'), 'binary');
      let zip = new PizZip(content);
      try { doc = new Docxtemplater(zip) } catch (error) { console.log(error); }

      let data = r[i]
      for (let key in data) { data[key] = (data[key] === null) ? '' : data[key] }
      for (let key in data) { data[key] = (data[key] === undefined) ? '' : data[key] }
      data.w_hour = parseInt(data.t_hour) + parseInt(data.e_hour)
      data.a_hour = data.w_hour * 16
      if (data.m_tech === undefined) data.m_tech = data.uname
      data.tech = r2
      data.exp = r3
      doc.setData(data);

      try { doc.render() } catch (error) { errorHandler(error); }
      let buf = doc.getZip().generate({ type: 'nodebuffer', compression: "DEFLATE", });

      // fs.writeFileSync(path.resolve(__dirname, '../export/'+data.uname+' '+data.code+' '+data.wt+'.docx' ), buf);
      fs.writeFileSync(path.resolve(__dirname, `../export/${i} ${data.uname} ${data.code} ${data.wt}.docx`), buf);
      uid.pop()
    }
  }
  // 用jszip将export文件夹打包
  var JSZip = require("jszip");
  var zip = new JSZip();
  var dir = path.resolve(__dirname, '../export')
  var files = fs.readdirSync(dir)
  for (let i = 0; i < files.length; i++) {//遍历文件夹
    let file = files[i]
    let data = fs.readFileSync(path.resolve(__dirname, `../export/${file}`))//读取文件
    zip.file(file, data)//添加文件
  }
  zip.generateAsync({ type: "nodebuffer" }).then(function (content) {
    fs.writeFileSync(path.resolve(__dirname, '../export.zip'), content);
  });

  res.status(200).json({ code: 200 ,url:'http://121.5.5.157:8000/export.zip'})
})


router.post('/login', async (req, res, next) => {
  let params = req.body
  let sql = `CALL PROC_LOGIN(?)`
  let r = await callP(sql, params, res)

  if (r.length > 0) {
    let ret = clone(r[0])
    let token = jwt.sign(ret, SECRET_KEY)
    res.status(200).json({ code: 200, data: ret, token: token, msg: '登录成功' })
  } else {
    res.status(200).json({ code: 301, data: null, msg: '用户名或密码错误' })
  }
})


router.post('/qryCls', async (req, res, next) => {
  let uid = decodeUser(req).uid
  let params = { uid: uid }
  let sql = `CALL PROC_QRY_CLS(?)`
  let r = await callP(sql, params, res)
  res.status(200).json({ code: 200, data: r })
});

router.post('/qryClsMain', async (req, res, next) => {
  let uid = decodeUser(req).uid//从token中获取用户id
  let params = { uid: uid, code: req.body.code }

  // console.log(params)
  let sql1 = `CALL PROC_QRY_CLS_MAIN(?)`//用u_id和code在tab_tech_main中查询主表
  let sql2 = `CALL PROC_QRY_TECH(?)`//用u_id和code在tab_tech中查询子表（教学进度）
  let sql3 = `CALL PROC_QRY_EXP(?)`//用u_id和code在tab_exp中查询子表（实验进度）
  let r = await callP(sql1, params, res)
  let s = await callP(sql2, params, res)
  let t = await callP(sql3, params, res)
  res.status(200).json({ code: 200, data: r, tecList: s, expList: t })
});




router.post('/qryclsHis', async (req, res, next) => {
  let uid = decodeUser(req).uid//从token中获取用户id
  let params = { uid: uid, code: req.body.code }

  // console.log(params)
  let sql1 = `CALL PROC_QRY_CLS_HIS(?)`//用u_id和code在tab_tech_main_old中查询
  let r = await callP(sql1, params, res)
  res.status(200).json({ code: 200, data: r })
});

router.post('/qryclsSim', async (req, res, next) => {
  let params = { code: req.body.code }
  // console.log(params)
  let sql1 = `CALL PROC_QRY_CLS_SIM(?)`//用code在tab_tech_main中查询
  let r = await callP(sql1, params, res)
  res.status(200).json({ code: 200, data: r })
});

router.post('/savCls', async (req, res, next) => {
  let uid = decodeUser(req).uid
  req.body.uid = uid
  let params = req.body
  console.log(params)
  let sql1 = `CALL PROC_SAV_CLS(?)`
  let sql2 = `CALL PROC_SAV_TECH(?)`
  let sql3 = `CALL PROC_SAV_EXP(?)`
  let r = await callP(sql1, params, res)
  let s = await callP(sql2, params, res)
  let t = await callP(sql3, params, res)
  res.status(200).json({ code: 200, data: r, tecList: s, expList: t })
});


// 上传文件
router.post('/upload', function (req, res) {
  const form = formidable({ uploadDir: `${__dirname}/../img` });

  form.on('fileBegin', function (name, file) {
    file.filepath = `img/sys_${dayjs().format('YYYYMMDDhhmmss')}.jpeg`
  })

  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    res.status(200).json({
      code: 200,
      msg: '上传照片成功',
      data: { path: files.file.filepath }
    })
  });
})



module.exports = router