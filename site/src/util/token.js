import decode from 'jwt-decode'
import {isN} from './fn'

const TOKEN_KEY = 'HZNU_TOKEN'
const USER_KEY  = 'HZNU_USER'

export const getToken = () => {
  let t = loadUser()

  if (isN(t)) {
    token = null
  }else{
    var {uname,...token} = t
  }

  return JSON.stringify(token)
}


export const removeUser = () => {
  window.localStorage.removeItem(USER_KEY)
}

export const loadUser = () => {
  return JSON.parse(window.localStorage.getItem(USER_KEY))
}

export const saveUser = (data) => {
  window.localStorage.setItem(USER_KEY, JSON.stringify(data))
}


export default { loadUser, saveUser, removeUser, getToken }