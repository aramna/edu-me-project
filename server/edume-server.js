// --------------------------------------------------------
// 에듀미 애플리케이션의 웹 서버
// --------------------------------------------------------
import express from 'express'

import bodyParser from 'body-parser'
import morgan from 'morgan'
import session from 'express-session'
import mongoose from 'mongoose'
import api from './routes'
import database from './database/database'

import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
const config = require('./config/config');
const webConfig = require('../webpack.dev.config');
const path = require('path');
const http = require('http');

var cookieParser = require('cookie-parser');
// 서버 실행
const app = express()
/////////////////////////////////////////////////////////////
/* HTTP 요청을 로그하는 미들웨어: morgan */
app.use(morgan('dev'))

/////////////////////////////////////////////////////////////
app.use(bodyParser.urlencoded({ entended : true }));
app.use(bodyParser.json());
///////////////////////////////////////////
app.use(cookieParser());//쿠키설정

app.use(session({//세션설정
    secret:'edu_key',
    resave:true,
    saveUninitialized:true
}));

app.use('/', express.static(path.join(__dirname, './../public')));

app.use('/api', api)

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, './../public/index.html'));
});
///////////////////////////////////////////
/* handle error */
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// app.use('/', router);//라우터 객체 등록

var server = app.listen(config.server_port, () => {
    console.log('서버 실행 완료:', `http://localhost:` + config.server_port)
    database.init(app,config);
})

// socket.io
const socketio = require('socket.io')
const io = socketio.listen(server)
io.on('connection', (socket) => {
    console.log('사용자 접속:', socket.client.id)
    socket.on('chat-msg', (msg) => {
        console.log('message:', msg)
        io.emit('chat-msg', msg)
    })
})


if(process.env.NODE_ENV == 'development') {
    console.log('Server is running on development mode');
    const compiler = webpack(webConfig);
    const devServer = new WebpackDevServer(compiler, webConfig.devServer);
    devServer.listen(
        webConfig.devServer_port, () => {
            console.log('webpack-dev-server is listening on port', webConfig.devServer_port);
        }
    );
}