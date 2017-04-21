'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAllAppDetail = exports.getAppList = exports.parseAppList = exports.parseAppDetail = exports.login = undefined;

var _Constants = require('../constants/Constants');

var _Constants2 = _interopRequireDefault(_Constants);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _xtend = require('xtend');

var _xtend2 = _interopRequireDefault(_xtend);

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var requestAgent = _superagent2.default.agent();

var parseHtmlContent = function parseHtmlContent(html, type) {
  return new Promise(function (resolve, reject) {
    var $ = void 0,
        domId = void 0,
        filterdDom = void 0;
    $ = _cheerio2.default.load(html);

    if (type === _Constants2.default.TYPE_APP_LIST) {
      domId = '#app_list';
    } else if (type === _Constants2.default.TYPE_APP_DETAIL) {
      domId = '#key_list';
    } else {
      reject(new Error('not compatible netpie website'));
    }

    filterdDom = $(domId).text();

    resolve(filterdDom);
  });
};

var get = function get(url) {
  return new Promise(function (resolve, reject) {
    requestAgent.get(url).end(function (err, res) {
      if (!err) {
        var text = res.text;
        resolve(text);
      } else {
        reject(err);
      }
    });
  });
};

var parseAppDetail = _underscore2.default.partial(parseHtmlContent, _underscore2.default, _Constants2.default.TYPE_APP_DETAIL);
var parseAppList = _underscore2.default.partial(parseHtmlContent, _underscore2.default, _Constants2.default.TYPE_APP_LIST);

var getAppDetail = function getAppDetail(app) {
  return get('https://netpie.io/app/' + app.appid, _Constants2.default.TYPE_APP_DETAIL).then(parseAppDetail).then(JSON.parse);
};
var getAllAppDetail = function getAllAppDetail(apps) {
  return Promise.all(_underscore2.default.collect(apps.app, getAppDetail));
};

var getAppList = function getAppList(request) {
  return new Promise(function (resolve, reject) {
    get('https://netpie.io/app', _Constants2.default.TYPE_APP_LIST).then(parseAppList).then(JSON.parse).then(function (json) {
      resolve((0, _xtend2.default)({}, { apps: json, request: request }));
    }).catch(function () {
      reject(new Error('GET APP LIST FAILED.'));
    });
  });
};

var login = function login(request) {
  return new Promise(function (resolve, reject) {
    requestAgent.post('https://netpie.io/actions/login').redirects(5).type('form').timeout(3000)
    // .send(request.params)
    .send({ username: request.username, password: request.password, redirectpath: '' }).end(function (err, res) {
      if (!(err || !res.ok)) {
        requestAgent.saveCookies(res);
        var $ = _cheerio2.default.load(res.text);
        var title = $('title').text();
        // LOGGED-IN
        if (title !== 'NETPIE | Login') {
          resolve(requestAgent);
        } else {
          reject(new Error('[X] invalid login'));
        }
      } else {
        reject(err);
      }
    });
  });
};

exports.login = login;
exports.parseAppDetail = parseAppDetail;
exports.parseAppList = parseAppList;
exports.getAppList = getAppList;
exports.getAllAppDetail = getAllAppDetail;