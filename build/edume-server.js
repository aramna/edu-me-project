'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

var _routes = require('./routes');

var _routes2 = _interopRequireDefault(_routes);

var _database = require('./database/database');

var _database2 = _interopRequireDefault(_database);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _webpackDevServer = require('webpack-dev-server');

var _webpackDevServer2 = _interopRequireDefault(_webpackDevServer);

var _config = require('./config/config');

var _config2 = _interopRequireDefault(_config);

var _webpackDev = require('../webpack.dev.config');

var _webpackDev2 = _interopRequireDefault(_webpackDev);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _socketManager = require('./socket/socketManager');

var _socketManager2 = _interopRequireDefault(_socketManager);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// 서버 실행
var app = (0, _express2.default)();

/* HTTP 요청을 로그하는 미들웨어: morgan */


// import socketio from 'socket.io';
/*
    에듀미 애플리케이션의 웹 서버
*/
app.use((0, _morgan2.default)('dev'));

app.use(_bodyParser2.default.urlencoded({ entended: true }));
app.use(_bodyParser2.default.json());

app.use((0, _cookieParser2.default)()); //쿠키설정

var sessionMiddleware = (0, _expressSession2.default)({ //세션설정
    secret: 'edu_key',
    resave: true,
    saveUninitialized: true
});

app.use(sessionMiddleware);
app.use('/', _express2.default.static(_path2.default.join(__dirname, './../public')));

app.use('/api', _routes2.default);

app.get('*', function (req, res) {
    res.sendFile(_path2.default.resolve(__dirname, './../public/index.html'));
});

/* handle error */
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// app.use('/', router);//라우터 객체 등록

var server = app.listen(_config2.default.server_port, '0.0.0.0', function () {
    console.log('서버 실행 완료:', 'http://localhost:' + _config2.default.server_port);
    _database2.default.init(app, _config2.default);
});

if (process.env.NODE_ENV == 'development') {
    console.log('Server is running on development mode');
    var compiler = (0, _webpack2.default)(_webpackDev2.default);
    var devServer = new _webpackDevServer2.default(compiler, _webpackDev2.default.devServer);
    devServer.listen(_webpackDev2.default.devServer_port, function () {
        console.log('webpack-dev-server is listening on port', _webpackDev2.default.devServer_port);
    });
}

var io = module.exports.io = _socket2.default.listen(server);

io.use(function (socket, next) {
    sessionMiddleware(socket.request, {}, next);
});

io.sockets.on('connection', _socketManager2.default);