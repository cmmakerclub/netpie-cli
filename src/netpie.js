import Constants from './Constants'
import _ from 'underscore'
import cheerio from 'cheerio'
import extend from 'xtend'
import superagent from 'superagent'
const requestAgent = superagent.agent()

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0
process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const parse = (html, type) => {
  return new Promise((resolve, reject) => {
    let text
    let $ = cheerio.load(html)
    if (type !== Constants.TYPE_APP_LIST) {
      if (type !== Constants.TYPE_APP_DETAIL) {
        text = JSON.stringify({'data': 'NOT IN CASE'})
        reject(text)
      } else {
        text = $('#key_list').text()
      }
    } else {
      text = $('#app_list').text()
    }
    resolve(text)
  })
}

const parseAppDetail = _.partial(parse, _, Constants.TYPE_APP_DETAIL)
const parseAppList = _.partial(parse, _, Constants.TYPE_APP_LIST)

const get = (url) => {
  return new Promise((resolve, reject) => {
    requestAgent.get(url).end(function (err, res) {
      if (!err) {
        let text = res.text
        resolve(text)
      } else {
        reject(err)
      }
    })
  })
}

const getAppList = (request) => {
  return new Promise((resolve, reject) => {
    get('https://netpie.io/app', Constants.TYPE_APP_LIST)
    .then(parseAppList)
    .then(JSON.parse)
    .then((json) => {
      return extend({}, {apps: json})
    })
    .then((object) => {
      const tasks = _.collect(object.apps.app,
        (app) => get('https://netpie.io/app/' + app.appid, Constants.TYPE_APP_DETAIL))
      return Promise.all(tasks)
    })
    .then((apps) => {
      return new Promise((resolve, reject) => {
        const tasks = _.collect(apps, (content) => parseAppDetail(content).then(JSON.parse))
        resolve(tasks)
      })
    })
    .then((tasks) => Promise.all(tasks))
    .then(JSON.stringify)
    .then((...args) => resolve(...args))
    .catch(reject)
  })
}

export let login = (request, callback) => {
  return new Promise((resolve, reject) => {
    requestAgent.post('https://netpie.io:443/actions/login')
    .redirects(5)
    .type('form')
    // .send(request.params)
    .send({username: request.username, password: request.password, redirectpath: ''})
    .end(function (err, res) {
      if (!(err || !res.ok)) {
        requestAgent.saveCookies(res)
        // getAppList(request, (...args) => { resolve(callback(...args)) })
        console.log('must be resolved')
        getAppList(request, (cb) => {
          console.log('must be resolved 2')
          resolve(cb)
        }).catch(reject)
      } else {
        console.log('Oh no! error ', err)
        reject(err)
      }
    })
  })
}
