'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _database = require('../database/database');

var _database2 = _interopRequireDefault(_database);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();


// 회원가입 구현
router.post('/adduser', function (req, res) {
    console.log('회원가입 라우팅 응답');
    // username의 형식 체크(영어 기준 -> 한글 기준으로 바꿀 것)
    var usernameRegex = /^[a-zA-Z가-힣]+$/;

    if (!usernameRegex.test(req.body.username)) {
        return res.status(400).json({
            error: "잘못된 이름",
            code: 1
        });
    }

    // email의 형식 체크
    var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!emailRegex.test(req.body.email)) {
        return res.status(400).json({
            error: "잘못된 이메일 형식",
            code: 2
        });
    }

    // password 길이 체크
    if (req.body.password.length < 4 || typeof req.body.password !== "string") {
        return res.status(400).json({
            error: "잘못된 비밀번호",
            code: 3
        });
    }

    // email 존재 유무 체크
    _database2.default.UserModel.findOne({ email: req.body.email }, function (err, exists) {
        if (err) throw err;
        if (exists) {
            return res.status(409).json({
                error: "이미 이메일이 존재해요",
                code: 4
            });
        }
        var bot = new _database2.default.BotModel({
            name: req.body.email,
            state: 'general'
        });

        bot.save(function (err) {
            if (err) throw err;
            return console.log("개인 봇이 생성되었습니다.");
        });

        // 계정 생성 (스키마생성)
        var user = new _database2.default.UserModel({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        });

        user.password = user.generateHash(user.password);

        // 데이터베이스에 저장
        user.save(function (err) {
            if (err) throw err;
            return console.log("계정정보가 저장되었습니다.\n" + user);
        });

        var list = new _database2.default.ListModel({
            email: req.body.email
        });

        list.save(function (err) {
            if (err) throw err;
            return console.log("roomlist가 생성되었습니다.\n" + list);
        });

        var file = '../sheltered-oasis-78981/config/name.txt';
        var data = user.username + ',' + user.username + '\n';

        _fs2.default.open(file, 'a+', function (err, fd) {
            if (err) throw err;
            if (fd == '9') {
                console.log('file create.');
                _fs2.default.writeFile(file, data, 'utf8', function (err) {
                    if (err) throw err;
                });
            } else {
                _fs2.default.appendFile(file, data, function (err) {
                    if (err) throw err;
                });
            }
        });

        var data2 = user.username + '이';

        return res.json({ success: true });
    });
});

// 로그인 구현
router.route('/login').post(function (req, res) {
    console.log('로그인 라우트 응답 받음');

    if (typeof req.body.password !== "string") {
        return res.status(401).json({
            error: "로그인 실패",
            code: 1
        });
    }

    _database2.default.UserModel.findOne({ email: req.body.email }, function (err, user) {
        if (err) throw err;

        // 계정 존재 유무 확인
        if (!user) {
            console.log('계정이 존재하지 않습니다.');
            return res.status(401).json({
                error: "이메일이 존재하지 않아",
                code: 1
            });
        }

        //비밀번호 확인
        if (!user.validateHash(req.body.password)) {
            console.log('비밀번호가 일치하지 않습니다.');
            return res.status(401).json({
                error: "비밀번호 불일치",
                code: 1
            });
        }

        // session 바꿔줌
        var session = req.session;
        session.loginInfo = {
            _id: user._id,
            username: user.username,
            email: user.email
        };
        console.log('로그인 성공!');

        // success와 저장된 로그인정보 반환
        var data = {};
        return res.json({ info: req.session.loginInfo });
    });
});

router.post('/logout', function (req, res) {
    console.log('로그아웃 라우트 요청받음');
    req.session.destroy(function (err) {
        if (err) throw err;
    });

    return res.json({ success: true });
});

// 세션확인 구현
router.get('/getinfo', function (req, res) {
    if (typeof req.session.loginInfo === "undefined") {
        return res.status(401).json({
            error: 1
        });
    }

    res.json({ info: req.session.loginInfo });
});

exports.default = router;