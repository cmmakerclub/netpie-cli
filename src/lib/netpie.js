import Constants from '../constants/Constants'
import _ from 'underscore'
import cheerio from 'cheerio'
import extend from 'xtend'
import superagent from 'superagent'
const requestAgent = superagent.agent()

const parseHtmlContent = (html, type) => {
  return new Promise((resolve, reject) => {
    let $, domId, filterdDom
    $ = cheerio.load(html)

    if (type === Constants.TYPE_APP_LIST) {
      domId = '#app_list'
    } else if (type === Constants.TYPE_APP_DETAIL) {
      domId = '#key_list'
    } else {
      reject(new Error('not compatible netpie website'))
    }

    filterdDom = $(domId).text()

    resolve(filterdDom)
  })
}

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

const parseAppDetail = _.partial(parseHtmlContent, _, Constants.TYPE_APP_DETAIL)
const parseAppList = _.partial(parseHtmlContent, _, Constants.TYPE_APP_LIST)

const getAppDetail = (app) => get('https://netpie.io/app/' + app.appid, Constants.TYPE_APP_DETAIL).then(parseAppDetail).then(JSON.parse)
const getAllAppDetail = (apps) => Promise.all(_.collect(apps.app, getAppDetail))

const getAppList = (request) => {
  return new Promise((resolve, reject) => {
    get('https://netpie.io/app', Constants.TYPE_APP_LIST)
    .then(parseAppList)
    .then(JSON.parse)
    .then((json) => {
      resolve(extend({}, {apps: json, request}))
    })
    .catch(() => {
      reject(new Error('GET APP LIST FAILED.'))
    })
  })
}

let login = (request) => {
  return new Promise((resolve, reject) => {
    requestAgent.post('https://netpie.io/actions/login')
    .redirects(5)
    .type('form')
    .timeout(3000)
    // .send(request.params)
    .send({username: request.username, password: request.password, redirectpath: ''})
    .end(function (err, res) {
      if (!(err || !res.ok)) {
        requestAgent.saveCookies(res)
        let $ = cheerio.load(res.text)
        let title = $('title').text()
        // LOGGED-IN
        if (title !== 'NETPIE | Login') {
          resolve(requestAgent)
        } else {
          reject(new Error('[X] invalid login'))
        }
      } else {
        reject(err)
      }
    })
  })
}

export { login, parseAppDetail, parseAppList, getAppList, getAllAppDetail }
