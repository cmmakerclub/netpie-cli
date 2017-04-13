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
      const tasks = _.collect(apps, (content) => parseAppDetail(content).then(JSON.parse))
      return Promise.all(tasks)
    })
    .then((...args) => {
      resolve(...args)
    })
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
        let $ = cheerio.load(res.text)
        let title = $('title').text()
        if (title !== 'NETPIE | Login') {
          getAppList(request).then((arg0) => {
            // console.log('args', arg0)
            // console.dir(arg0, {depth: null, colors: true})
            arg0.forEach((v, k) => {
              console.log(`app[${k}] - ${v.op} - ${v.aid} - ${v.appid}`)
            })
          }).catch(reject)
        } else {
          reject(new Error('invalid login'))
        }
      } else {
        console.log('Oh no! error ', err)
        reject(err)
      }
    })
  })
}
