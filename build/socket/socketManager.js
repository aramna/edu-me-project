'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _database = require('../database/database');

var _database2 = _interopRequireDefault(_database);

var _bayes = require('bayes');

var _bayes2 = _interopRequireDefault(_bayes);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//const users = {socketId: String, email: String};
var login_ids = [];
var recentMsg = [];

module.exports = function (socket) {
    var io = require('../edume-server').io;
    var sendReceiver = 'who';
    var category = '';
    var contents = [];
    var content1 = '';
    var content2 = '';
    var receiverList = [];
    var receiverEmail = 'who';
    var saveMsg = [];
    var rooms = [];
    var sentence_receiver = '';
    var newText;

    var nickname;

    //마스터봇 없으면 생성
    /*database.BotModel.find({name: MASTER}, function(err, master){
        if (err) throw err
        if (master)
            console.log(master+"봇 객체 존재함")
        else
        {
            console.log("봇 객체 존재하지 않아 생성하여 저장함")
            let masterBot = new database.BotModel({
                name: MASTER,
                state: MASTER,
                check: ['응,yes','예,yes','맞아,yes','응그거,yes','어,yes','예아,yes','예압,yes','옛,yes','잉,yes','옹,yes','웅,yes','앙,yes','아니,no','노,no','그거말고,no','말고,no','아냐,no','그거아냐,no','그거아니야,no','아니야,no','틀렸어,no','달라,no','틀려,no','다른거,no','안되,no','아니라고,no'],
                order: ['보내줘,send','전송해줘,send','보내,send','전송,send','전송해줄래,send','보내봐,send','전송해,send','전송해봐,send','전송좀,send','보내봐라,send','메시지 보내줘,send','메시지 보내 줘,send','메시지 전송해줘,send','메시지 보내,send','메시지 전송,send','메시지 보내줄래,send','메시지 전송해줄래,send','메시지 보내봐,send','메시지 전송해,send','메시지 전송해봐,send','메시지 전송좀 해줘,send','메시지좀 보내줘,send','메시지좀 보내 줘,send','메시지좀 전송해줘,send','메시지좀 보내,send','메시지좀 전송,send','메시지좀 보내줄래,send','메시지좀 전송해줄래,send','메시지좀 보내봐,send','메시지좀 전송해,send','메시지좀 전송해봐,send','메시지좀 전송좀 해줘,send','문자 보내 줘,send','문자 보내줘,send','문자 전송해줘,send','문자 보내,send','문자 전송,send','문자 보내줄래,send','문자 전송해줄래,send','문자 보내봐,send','문자 전송해,send','문자 전송해봐,send','문자 전송좀 해줘,send','문자좀 보내줘,send','문자좀 보내 줘,send','문자좀 전송해줘,send','문자좀 보내,send','문자좀 전송,send','문자좀 보내줄래,send','문자좀 전송해줄래,send','문자좀 보내봐,send','문자좀 전송해,send','문자좀 전송해봐,send','문자좀 전송좀 해줘,send','문자온거 있어?,receive','문자 확인해줘,receive','메시지 확인해줘,receive','수신된 메시지 확인해줘?,receive','메세지가 왔는지 확인좀 해줘,receive','문자 왔니?,receive','메시지 온거 있나?,receive','수신된 문자 있어?,receive','문자 온것좀 확인해줘,receive','메시지 온것좀 확인해줘,receive','온 메시지 확인좀 해줘,receive','메시지 왔어?,receive','메시지 누구한테 왔니?,receivelist','누구한테 문자 왔는지 확인좀,receivelist','누구한테 메시지 왔었어?,receivelist','문자 누구한테 왔었는지 확인해줘,receivelist','메시지 누구한테 왔는지 확인해줘,receivelist','메세지 누구한테 왔어?,receivelist'],
                nick: []
            })
              masterBot.save(err =>{
                if (err) throw err
            });
          }
    })*/

    console.log('connection info :', socket.request.connection._peername);

    socket.remoteAddress = socket.request.connection._peername.address;
    socket.remotePort = socket.request.connection._peername.port;

    console.log(socket.remoteAddress);
    console.log(socket.remotePort);

    //'login' 이벤트를 받았을 떄의 처리
    socket.on('login', function (login) {
        console.log('login 이벤트를 받았습니다.');
        console.dir(login);
        _database2.default.BotModel.findOne({ name: login.userEmail }, function (err, userBot) {
            console.log('봇초기화여');
            userBot.state = 'general';
            userBot.sendReceiver = null;
            userBot.receiverName = null;

            console.log("유저봇상태 확인" + userBot);
            userBot.save(function (err) {
                if (err) throw err;
            });
        });
        //main방 존재 여부 확인
        _database2.default.RoomModel.findOne({ roomId: login.roomId }, function (err, room) {

            //main방 존재하여 입장
            if (room) {
                console.log(login.roomId + "방에 입장합니다.");
                socket.join(login.roomId);

                //main방 member list에 사용자 존재 여부 확인 후 없으면 추가
                if (!room.member.includes(login.id)) {
                    console.log("id가 없으므로 id 추가");
                    room.member.push(login.id);
                } else {
                    console.log("id가 존재함");
                }
                //main방 상태 저장
                room.save(function (err) {
                    if (err) throw err;
                });
                console.log("1", room.member);

                console.log("????????????????" + room);
                io.sockets.in(login.roomId).emit('memberlist', room);
                _database2.default.ListModel.findOne({ email: login.userEmail }, function (err, list) {
                    console.log("login에서진행해이자식아");
                    var channellist = addList(list, room);
                    socket.emit('channellist', channellist);
                    socket.emit('oneononelist', channellist);
                    console.log('login에서보여주는 list' + channellist);
                });
            } else {
                console.log(login.roomId + "방을 생성합니다.");
                //main 방 생성
                var _room = new _database2.default.RoomModel({
                    roomId: login.roomId,
                    roomTitle: login.roomId,
                    member: [],
                    oneonone: false
                });

                _room.member.push(login.id);

                _room.save(function (err) {
                    if (err) throw err;
                });

                console.log("메인의 멤버 : " + _room.member);
                //main방 생성
                socket.join(login.roomId);

                io.sockets.in(login.roomId).emit('memberlist', _room);
                _database2.default.ListModel.findOne({ email: login.userEmail }, function (err, list) {
                    console.log("login에서진행해이자식아");
                    var channellist = addList(list, _room);
                    socket.emit('channellist', channellist);
                    console.log('login에서보여주는 list' + channellist);
                });
            }
        });

        //기존 클라이언트 ID가 없으면 클라이언트 ID를 맵에 추가
        console.log('접속한 소켓의 ID : ' + socket.id);
        var newSocket = { email: login.userEmail, socketId: socket.id };
        login_ids.push(newSocket);
        console.log('login_ids', login_ids);
        console.log('login.roomId는 ' + login.roomId);

        //메시지 불러오기
        _database2.default.ChatModel.find({ roomId: login.roomId }, function (err, premsg) {
            console.log("%%%%%%%%%%%%" + premsg);
            if (premsg) {
                var fn = premsg.length;
                if (fn < 15) {
                    st = 0;
                } else {
                    var st = fn - 15;
                }
                console.log("fn : " + fn + ", st : " + st);
                var premsg_slice = premsg.slice(st, fn);
                console.log("프리메시지다 : " + premsg);
                socket.emit('premsg', premsg);
            } else {
                console.log("아무것도없어");
            }
        });
        _database2.default.ChatModel.find(function (err, premsg) {
            if (recentMsg !== null) {
                recentMsg.splice(0, recentMsg.length);
            }
            var classified = [];
            var classifyRoomId = _underscore2.default.uniq(premsg, 'roomId');
            console.log('classifyRoomId: ', classifyRoomId);
            for (var i = 0; i < classifyRoomId.length; i++) {
                for (var j = 0; j < premsg.length; j++) {
                    if (classifyRoomId[i].roomId === premsg[j].roomId) {
                        classified.push(premsg[j]);
                    }
                }
            }
            for (var k = 0; k < classifyRoomId.length; k++) {
                var temp = [];
                classified.map(function (e) {
                    if (e.roomId === classifyRoomId[k].roomId) {
                        temp.push({ chatCount: e.chatCount, roomId: e.roomId, message: e.message });
                    }
                });
                recentMsg.push(_underscore2.default.max(temp, function (obj) {
                    return obj.chatCount;
                }));
            }

            var slice = _underscore2.default.uniq(recentMsg, 'roomId');

            console.log('recentMsg:', slice);
            socket.emit('recentmsg', slice);
        });
        _database2.default.ListModel.find(function (err, roomlist) {
            io.sockets.emit('roomsearch', roomlist);
            console.log('룸리스트서치요' + roomlist);
        });

        _database2.default.UserModel.find(function (err, userslist) {
            var useridx = 0;
            var userFind = userslist.find(function (item) {
                return item.email === login.userEmail;
            });
            useridx = userslist.indexOf(userFind);
            userslist.splice(useridx, 1);
            console.log("내가누구냐" + userFind);
            console.log("useridx" + useridx);
            io.sockets.emit('usersearch', userslist);
            console.log('유저리스트서치요' + userslist);
        });
    });

    socket.on('logout', function (logout) {
        console.log('로그아웃 합니다. logout email은' + logout);
        var logoutFind = login_ids.find(function (ids) {
            return ids.email === logout;
        });
        console.log('logoutFind' + logoutFind);
        var i = login_ids.indexOf(logoutFind);
        console.log("인덱스위치" + i);
        login_ids.splice(i, 1);
        console.log('로긴아이디쑤');
        console.dir(login_ids);
        _database2.default.BotModel.findOne({ name: logout }, function (err, logoutBot) {
            console.log("로그아웃하여 봇을 초기화함");
            logoutBot.state = 'general';
            logoutBot.sendReceiver = null;
            logoutBot.receiverName = null;

            logoutBot.save(function (err) {
                if (err) throw err;
            });
        });
    });

    socket.on('oneonone', function (oneonone) {
        console.log('oneonone 이벤트를 받았습니다.');
        console.log(oneonone);
        if (oneonone.command === 'create') {
            _database2.default.RoomModel.findOne({ creater: oneonone.creater, receiver: oneonone.receiver }, function (err, created_room) {
                if (created_room) {
                    console.log('이미 방이 존재해요 ' + created_room);
                    _database2.default.ListModel.findOne({ email: oneonone.userEmail }, function (err, list) {
                        console.log("워너원의 create에서진행해이자식아");
                        created_room.roomTitle = created_room.receiver;
                        addOne(list, created_room);
                        if (list) {
                            var newArr = list.oneonones.filter(function (data) {
                                return data.text === created_room.roomTitle;
                            });
                            if (newArr.length > 0) {
                                console.log("list의 roomids에" + created_room.receiver + "가 이미 존재합니다.");
                            } else {
                                console.log("list의 roomids에" + created_room.receiver + "를 추가합니다.");
                                list.oneonones.push({ "text": created_room.receiver });
                                list.save(function (err) {
                                    if (err) throw err;
                                });
                            }
                        }
                    });
                } else {
                    console.log(oneonone.receiver + '일대일 채팅방을 새로 만듭니다.');
                    var roomId = oneonone.creater + Math.random().toString(26).slice(2) + oneonone.receiver;
                    socket.join(roomId);

                    var croom = new _database2.default.RoomModel({
                        roomId: roomId,
                        creater: oneonone.creater,
                        receiver: oneonone.receiver,
                        receiverEmail: oneonone.receiverEmail,
                        oneonone: true
                    });
                    croom.member.push(oneonone.creater);
                    croom.member.push(oneonone.receiver);
                    console.log(croom + "croom 입니다");
                    croom.save(function (err) {
                        if (err) throw err;
                    });

                    _database2.default.ListModel.findOne({ email: oneonone.userEmail }, function (err, list) {
                        console.log("create에서진행해이자식아");
                        //방제
                        croom.roomTitle = oneonone.receiver;
                        var channellist = addOne(list, croom);
                        socket.emit('oneononelist', channellist);
                    });
                    console.dir('새로만든 방정보' + croom);
                }
            });
        }
    });

    socket.on('transcript', function (chatbot) {
        console.log(chatbot);

        //텍스트 분석 api 적용
        var openApiURL = 'http://aiopen.etri.re.kr:8000/WiseNLU';
        var access_key = '23a07699-433a-4978-9cd3-c680017ac4c9';
        var analysisCode = 'morp';
        contents = []; //띄워줄 내용 전송할껀데
        content1 = null; //띄워줄 내용에 들어갈 임시 content1
        content2 = null; //띄워줄 내용에 들어갈 임시 content2

        _database2.default.BotModel.findOne({ name: chatbot.email }, function (err, bot) {
            console.log("봇 객체 = " + bot);
            console.log("봇 상태 = " + bot.state);
            if (chatbot.transcript === '다시') {
                bot.state = 'general';
                bot.sendReceiver = null;
                bot.receiverList = [];
                bot.receiverName = null;
                bot.save(function (err) {
                    if (err) throw err;
                    console.log("Bot의 state가 " + bot.state + " 로 업데이트 되었습니다.");
                });
                content1 = '말씀하세요';
                content2 = '듣는중';
                contents.push(content1);
                contents.push(content2);
                socket.emit('request', contents);
            } else {
                if (bot.state == 'general') //챗봇 명령 처음단계
                    {
                        console.log("######general start######");
                        bot.sendReceiver = null;
                        sendReceiver = null; //수신인 이름 초기화
                        category = null; //명령 카테고리
                        receiverList = [];
                        receiverEmail = null; //동일이름일 경우 수신인의 이메일 초기화
                        sentence_receiver = "";
                        nickname = null;

                        var classifier = (0, _bayes2.default)({ //카테고리 분류
                            tokenizer: function tokenizer(text) {
                                return text.split('');
                            }
                        });

                        var str = chatbot.transcript; //text를 str에 저장
                        var requestJson = { //api요청
                            'access_key': access_key,
                            'argument': {
                                'text': str, //분석할 텍스트
                                'analysis_code': analysisCode
                            }
                        };
                        var options = { //api옵션
                            url: openApiURL,
                            body: JSON.stringify(requestJson),
                            headers: { 'Content-Type': 'application/json; charset=UTF-8' }
                        };

                        //베이지안 알고리즘으로 텍스트분석
                        var ch = ""; //"ㅇㅇ한테"를 가져올 변수
                        var article = _fs2.default.readFileSync("../edu-me-project/config/test.txt");
                        var lineArray = article.toString();
                        var line = lineArray.split('\r\n');
                        for (var i in line) {
                            var s = line[i].split(",");
                            classifier.learn(s[0], s[1]);
                        }

                        _request2.default.post(options, function (error, response, body) {
                            //형태소 분석
                            var s = body;
                            var res = JSON.parse(s);
                            var sentence_NNG = [];
                            for (var i in res.return_object.sentence[0].morp) {
                                sentence_NNG.push(res.return_object.sentence[0].morp[i].lemma);
                                console.log("sentence_NNG : " + sentence_NNG);
                                //console.log(res.return_object.sentence[0].morp[i])
                                if (res.return_object.sentence[0].morp[i].type == 'JKB' && (res.return_object.sentence[0].morp[i].lemma == '한테' || res.return_object.sentence[0].morp[i].lemma == '에게')) {
                                    if (res.return_object.sentence[0].morp[Number(i) - 1].type == 'NNG' || res.return_object.sentence[0].morp[Number(i) - 1].type == 'NNP') {
                                        if (res.return_object.sentence[0].morp[i - 1].lemma == '형' || res.return_object.sentence[0].morp[i - 1].lemma == '누나' || res.return_object.sentence[0].morp[i - 1].lemma == '언니' || res.return_object.sentence[0].morp[i - 1].lemma == '오빠') {
                                            console.log('res.return_object.sentence[0].morp.length : ' + res.return_object.sentence[0].morp.length);
                                            for (var j = 0; j < sentence_NNG.length; j++) {
                                                ch = res.return_object.sentence[0].morp[i - j].lemma + ch;
                                                console.log("ch 바뀌는거 : " + ch);
                                            }

                                            for (var k = 1; k < sentence_NNG.length; k++) {
                                                sentence_receiver = res.return_object.sentence[0].morp[i - k].lemma + sentence_receiver;
                                                console.log('sentence_receiver 바뀌는거 : ' + sentence_receiver);
                                            }

                                            /*if(res.return_object.sentence[0].morp[i - 3].lemma)
                                            {
                                                ch = res.return_object.sentence[0].morp[i - 3].lema + res.return_object.sentence[0].morp[i - 2].lema + res.return_object.sentence[0].morp[Number(i) - 1].lemma + res.return_object.sentence[0].morp[i].lemma
                                                sentence_receiver = res.return_object.sentence[0].morp[i - 3].lemma + res.return_object.sentence[0].morp[i - 2].lemma + res.return_object.sentence[0].morp[i - 1].lemma
                                            } else
                                            {
                                                ch =res.return_object.sentence[0].morp[i - 2].lema + res.return_object.sentence[0].morp[Number(i) - 1].lemma + res.return_object.sentence[0].morp[i].lemma
                                                sentence_receiver = res.return_object.sentence[0].morp[i - 2].lemma + res.return_object.sentence[0].morp[i - 1].lemma
                                            }*/
                                        } else {
                                            ch = res.return_object.sentence[0].morp[Number(i) - 1].lemma + res.return_object.sentence[0].morp[i].lemma;
                                            sentence_receiver = res.return_object.sentence[0].morp[i - 1].lemma;
                                        }
                                    } //"주희한테 문자 보내줘"->ch = "주희한테"
                                }
                            }
                        });

                        setTimeout(function () {
                            console.log('ch >>' + ch);
                            if (ch !== "") {
                                var idx = str.indexOf(ch);
                                if (idx == 0) {
                                    //"ㅇㅇ한테"가 문장 처음에 있는 경우
                                    str = str.substring(ch.length + 1, str.length);
                                } else {
                                    //그 외의 경우
                                    str = str.substring(0, idx - 1) + str.substring(idx + ch.length, str.length);
                                } //str ="주희한테 문자 보내줘"에서 "문자 보내줘"만 추출
                            }
                            console.log('str >> ' + str);
                            category = classifier.categorize(str); //카테고리 분류
                            console.log("category - " + category);

                            //카테고리 분석이 끝남
                            //카테고리 send
                            if (category == 'send') {
                                content1 = '메시지를전송합니다';
                                contents.push(content1);
                                console.log("카테고리가", category, "로 결정");
                                console.log("sentence_receiver = " + sentence_receiver);
                                //그냥 메시지 보내줘인지 확인
                                if (sentence_receiver !== null) {
                                    console.log("sentence_receiver가 존재함");
                                    var classifier2 = (0, _bayes2.default)({ //사용자 분류
                                        tokenizer: function tokenizer(text) {
                                            return text.split('');
                                        }
                                    });

                                    var article2 = _fs2.default.readFileSync("../edu-me-project/config/name.txt");
                                    var lineArray2 = article2.toString();
                                    var line2 = lineArray2.split('\n');
                                    for (var i in line2) {
                                        var s2 = line2[i].split(",");
                                        classifier2.learn(s2[0], s2[1]);
                                    }
                                    //수신자 분류 찾기
                                    var sendReceiver = classifier2.categorize(sentence_receiver);

                                    //수신자 이름과 매치되는 데이터베이스 찾기
                                    _database2.default.UserModel.find({ username: sendReceiver }, function (err, sendRe) {
                                        console.log('sendRe' + sendRe); //다시하기
                                        console.log("sendReceiver = " + sendReceiver);
                                        if (sendReceiver == chatbot.name) {
                                            console.log('나랑같은사람찾음');
                                            sendRe = null;
                                        }

                                        if (sendRe) {
                                            console.log("타입은" + (typeof sendRe === 'undefined' ? 'undefined' : _typeof(sendRe)));
                                            console.log("수신인 이름" + sendReceiver);
                                            content2 = sendReceiver + '님이 맞나요?';
                                            console.log('수신인 찾음' + sendRe);
                                            nickname = sentence_receiver;
                                            bot.sendReceiver = sendRe[0];
                                            bot.state = 'send-find';
                                            bot.save(function (err) {
                                                if (err) throw err;
                                                console.log("Bot의 state가 " + bot.state + " 로 업데이트 되었습니다.");
                                            });
                                        } else {
                                            content2 = '수신인의 이름을 정확히 말씀해 주세요';
                                            nickname = null;
                                            bot.state = 'send-receiver';
                                            bot.save(function (err) {
                                                if (err) throw err;
                                                console.log("Bot의 state가 " + bot.state + " 로 업데이트 되었습니다.");
                                            });
                                        }
                                        contents.push(content2);
                                        //소켓 request 발생
                                        socket.emit('request', contents);
                                    });
                                } else {
                                    content2 = '누구에게 전송하시겠습니까?';
                                    var content3 = '이름을 말씀해 주세요';
                                    contents.push(content2);
                                    contents.push(content3);
                                    bot.state = 'send-receiver';
                                    bot.save(function (err) {
                                        if (err) throw err;
                                        console.log("Bot의 state가 " + bot.state + " 로 업데이트 되었습니다.");
                                    });
                                    socket.emit('request', contents);
                                }
                                //send가 되었으므로 사용자를 분류함
                            } else if (category == 'check') {}
                            console.log("######general end######");
                        }, 2500);
                    } else if (bot.state == 'send-receiver') {
                    if (chatbot.transcript.length < 5) {
                        var classifier2 = (0, _bayes2.default)({ //사용자 분류
                            tokenizer: function tokenizer(text) {
                                return text.split('');
                            }
                        });

                        var article2 = _fs2.default.readFileSync("../edu-me-project/config/name.txt");
                        var lineArray2 = article2.toString();
                        var line2 = lineArray2.split('\n');
                        for (var i in line2) {
                            var s2 = line2[i].split(",");
                            classifier2.learn(s2[0], s2[1]);
                        }

                        var receiverData = classifier2.categorize(chatbot.transcript);
                        //수신자 분류 찾기
                        setTimeout(function () {
                            console.log('새로받은 정보의 수신자 찾기' + receiverData);
                            _database2.default.UserModel.find({ username: receiverData }, function (err, sendRec) {
                                if (receiverData == chatbot.name) {
                                    console.log('나랑 같은사람 찾음');
                                    sendRec = null;
                                }
                                if (sendRec != null) {
                                    console.log("sendRe : " + sendRec);
                                    console.log("sendRe.email : " + receiverData);
                                    content1 = receiverData + '님이 맞나요?';
                                    console.log('수신인 찾음' + sendRec);
                                    nickname = chatbot.transcript;
                                    bot.sendReceiver = sendRec[0];
                                    bot.state = 'send-find';
                                    bot.save(function (err) {
                                        if (err) throw err;
                                        console.log("Bot의 state가 " + bot.state + " 로 업데이트 되었습니다.");
                                    });
                                    contents.push(content1);
                                    socket.emit('request', contents);
                                } else {
                                    console.log('찾지못했다.');
                                    nickname = null;
                                    content1 = '이름만 정확히 말씀해 주세요';
                                    contents.push(content1);
                                    socket.emit('request', contents);
                                }
                            });
                        }, 2500);
                    } else {
                        console.log('찾지못했다.');
                        nickname = null;
                        content1 = '이름만 정확히 말씀해 주세요';
                        contents.push(content1);
                        socket.emit('request', contents);
                    }
                } else if (bot.state == 'send-find') {
                    var classifier3 = (0, _bayes2.default)({ //응답 분류
                        tokenizer: function tokenizer(text) {
                            return text.split('');
                        }
                    });

                    var article3 = _fs2.default.readFileSync("../edu-me-project/config/yesNo.txt");
                    var lineArray3 = article3.toString();
                    var line3 = lineArray3.split('\r\n');
                    for (var i in line3) {
                        var s3 = line3[i].split(",");
                        classifier3.learn(s3[0], s3[1]);
                    }
                    var choose = classifier3.categorize(chatbot.transcript);

                    if (choose == 'yes') {
                        bot.state = 'send';
                        bot.save(function (err) {
                            if (err) throw err;
                            console.log("Bot의 state가 " + bot.state + " 로 업데이트 되었습니다.");
                        });
                        content1 = '메세지를 전송합니다';
                        content2 = '내용을 말씀해 주세요';
                        contents.push(content1);
                        contents.push(content2);

                        var file = '../edu-me-project/config/name.txt';
                        //파일에 내용 쓰려고함
                        var _article = _fs2.default.readFileSync("../edu-me-project/config/name.txt");
                        var lineArray2 = _article.toString();
                        var line2 = lineArray2.split('\n');
                        var check = true;
                        for (var i in line2) {
                            var s2 = line2[i].split(",");
                            if (s2[0] === nickname) {
                                check = false;
                            }
                        }

                        setTimeout(function () {
                            if (check) {
                                var data = nickname + ',' + bot.sendReceiver.username + '\n';
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
                            }
                        }, 700);

                        socket.emit('request', contents);
                    } else {
                        bot.state = 'send-receiver';
                        bot.receiverList = [];
                        bot.sendReceiver = null;
                        bot.save(function (err) {
                            if (err) throw err;
                            console.log("Bot의 state가 " + bot.state + " 로 업데이트 되었습니다.");
                        });
                        sendReceiver = null;
                        content1 = '다시 수신자 이름만 말씀해 주세요';
                        contents.push(content1);
                        socket.emit('request', contents);
                    }
                } else if (bot.state == 'send') {
                    //안영민
                    console.log("######send start######");
                    if (bot.sendReceiver == null) {
                        contents = '수신자가 지정되지 않았습니다. 수신자를 말씀해 주세요';
                        bot.state = 'send-receiver';
                        bot.save(function (err) {
                            if (err) throw err;
                            console.log("Bot의 state가 " + bot.state + " 로 업데이트 되었습니다.");
                        });
                        socket.emit('request', contents);
                    } else {
                        //chatbot.email, sendReceiver, chatbot.transcript -> 메시지내용
                        //메시지전송하는 행위를 씀.
                        //우선 일대일 채팅방이 있는지 확인 후 있으면 입장, 없으면 생성
                        var sendRoomId = null;
                        console.log('bot.sendReceiver = ');
                        console.dir(bot.sendReceiver);
                        console.log('bot.sendReceiver.username = ' + bot.sendReceiver.username);
                        var receiverName = bot.sendReceiver.username;
                        var receiverEmail = bot.sendReceiver.email;
                        setTimeout(function () {
                            var countNum;
                            _database2.default.RoomModel.findOne({ creater: chatbot.name, receiver: receiverName }, function (err, oneonone) {
                                console.log('데이터베이스에서 적절한 방 찾기');
                                console.log('bot.sendReceiver = ' + receiverName);
                                if (err) throw err;
                                if (oneonone) {
                                    console.log('일대일 채팅방이 존재하여 입장 creater : ' + chatbot.name);
                                    sendRoomId = oneonone.roomId;
                                    //존재하여 룸입장
                                    socket.join(sendRoomId);
                                    console.log('roomid는 ' + oneonone.roomId);
                                    console.log("확인해보자 chatCount : " + oneonone.chatCount);
                                    countNum = oneonone.chatCount + 1;
                                    oneonone.chatCount = countNum;
                                    console.log("증가 후 chatCount : " + oneonone.chatCount);
                                    oneonone.save(function (err) {
                                        if (err) throw err;
                                    });
                                    var countNum;
                                    if (oneonone.chatCount == 0) {
                                        _database2.default.ListModel.findOne({ email: oneonone.receiverEmail }, function (err, oneononelist) {
                                            var croom = new _database2.default.RoomModel({
                                                roomTitle: oneonone.creater
                                            });
                                            var channellist = addOne(oneononelist, croom);
                                            /*login_ids.find({email: jroom.receiverEmail}, function(err, you){
                                                if(err) throw err
                                                if(you) {
                                                    console.log('흠 이거 소켓아이디 하나 찾아서 따로 보낼거임')
                                                    io.to(you.socketid).emit('oneononelist', channellist);
                                                }
                                                })*/
                                            var receiverSocket = login_ids.find(function (you) {
                                                return you.email === oneonone.receiverEmail;
                                            });
                                            if (receiverSocket) {
                                                console.log("받는놈소켓아이디찾는다" + receiverSocket.socketId);
                                                io.sockets.to(receiverSocket.socketId).emit('oneononelist', channellist);
                                            } else {
                                                console.log("받는놈이 접속을 안했다");
                                                socket.broadcast.to(oneonone.roomId).emit('oneononelist', channellist);
                                            }
                                            //io.sockets.in(jroom.roomId).emit('oneononelist', channellist);
                                        });
                                    }
                                    console.log("에듀미가봐야할내용이잖아");
                                    console.log("확인해보자 chatCount : " + oneonone.chatCount);
                                    countNum = oneonone.chatCount + 1;
                                    oneonone.chatCount = countNum;
                                    console.log("증가 후 chatCount : " + oneonone.chatCount);
                                    oneonone.save(function (err) {
                                        if (err) throw err;
                                    });
                                    console.log(socket.request.sessionID);
                                    if (socket.request.sessionID) {
                                        console.log('로그인되어 있음.');
                                    } else {
                                        console.log('로그인 안되어 있음');
                                    }
                                    var chat = new _database2.default.ChatModel({
                                        name: chatbot.name,
                                        message: chatbot.transcript,
                                        email: chatbot.email,
                                        roomId: oneonone.roomId,
                                        chatCount: countNum
                                    });
                                    var message_time = chat.created.getHours() + ':' + ("0" + chat.created.getMinutes()).slice(-2);
                                    chat.time = message_time;
                                    // 데이터베이스에 저장
                                    chat.save(function (err) {
                                        if (err) throw err;
                                    });
                                    console.log('쳌쳌쳌체셋쳇쳇쳇' + chat);
                                    io.sockets.in(oneonone.roomId).emit('message', chat);
                                } else {
                                    //일대일 방 찾기 2번째
                                    console.log('일대일 채팅방이 존재하지 않습니다.');
                                    _database2.default.RoomModel.findOne({ creater: receiverName, receiver: chatbot.name }, function (err, oneonone2) {
                                        console.log('다른 일대일 채팅방 찾기');
                                        if (err) throw err;
                                        if (oneonone2) {
                                            console.log('일대일 채팅방이 존재하여 입장 creater : ' + receiverName);
                                            sendRoomId = oneonone2.roomId;
                                            //존재하여 룸입장
                                            socket.join(sendRoomId);
                                            var countNum;
                                            console.log('하긴하는거냐');
                                            if (oneonone2.countNum == 0) {
                                                _database2.default.ListModel.findOne({ email: oneonone2.receiverEmail }, function (err, oneononelist) {
                                                    var croom = new _database2.default.RoomModel({
                                                        roomTitle: oneonone2.creater
                                                    });
                                                    var channellist = addOne(oneononelist, croom);
                                                    /*login_ids.find({email: jroom.receiverEmail}, function(err, you){
                                                        if(err) throw err
                                                        if(you) {
                                                            console.log('흠 이거 소켓아이디 하나 찾아서 따로 보낼거임')
                                                            io.to(you.socketid).emit('oneononelist', channellist);
                                                        }
                                                        })*/
                                                    var receiverSocket = login_ids.find(function (you) {
                                                        return you.email === oneonone2.receiverEmail;
                                                    });
                                                    if (receiverSocket) {
                                                        console.log("받는놈소켓아이디찾는다" + receiverSocket.socketId);
                                                        io.sockets.to(receiverSocket.socketId).emit('oneononelist', channellist);
                                                    } else {
                                                        console.log("받는놈이 접속을 안했다");
                                                        socket.broadcast.to(oneonone2.roomId).emit('oneononelist', channellist);
                                                    }
                                                    console.log("에듀미가봐야할내용이잖아");
                                                    console.log("확인해보자 chatCount : " + oneonone2.chatCount);
                                                    countNum = oneonone2.chatCount + 1;
                                                    oneonone2.chatCount = countNum;
                                                    console.log("증가 후 chatCount : " + oneonone2.chatCount);
                                                    oneonone2.save(function (err) {
                                                        if (err) throw err;
                                                    });
                                                    console.log(socket.request.sessionID);
                                                    if (socket.request.sessionID) {
                                                        console.log('로그인되어 있음.');
                                                    } else {
                                                        console.log('로그인 안되어 있음');
                                                    }
                                                    var chat = new _database2.default.ChatModel({
                                                        name: chatbot.name,
                                                        message: chatbot.transcript,
                                                        email: chatbot.email,
                                                        roomId: oneonone2.roomId,
                                                        chatCount: countNum
                                                    });
                                                    var message_time = chat.created.getHours() + ':' + ("0" + chat.created.getMinutes()).slice(-2);
                                                    chat.time = message_time;
                                                    // 데이터베이스에 저장
                                                    chat.save(function (err) {
                                                        if (err) throw err;
                                                    });
                                                    console.log('쳌쳌쳌체셋쳇쳇쳇' + chat);
                                                    io.sockets.in(oneonone2.roomId).emit('message', chat);
                                                    //io.sockets.in(jroom.roomId).emit('oneononelist', channellist);
                                                });
                                            }
                                        } else {
                                            console.log('일대일 채팅방이 존재하지 않아 생성');
                                            //룸아이디 해쉬
                                            var sendRoomId = chatbot.name + Math.random().toString(26).slice(2) + receiverName;
                                            //해당 룸아이디로 입장
                                            socket.join(sendRoomId);
                                            //룸 정보 데베 저장
                                            var Troom = new _database2.default.RoomModel({
                                                roomId: sendRoomId,
                                                creater: chatbot.name,
                                                receiver: receiverName,
                                                receiverEmail: receiverEmail,
                                                oneonone: true
                                            });
                                            Troom.member.push(chatbot.name);
                                            Troom.member.push(receiverName);
                                            console.log(Troom + "croom 입니다");
                                            Troom.save(function (err) {
                                                if (err) throw err;
                                            });
                                            //list에 룸정보 추가
                                            _database2.default.ListModel.findOne({ email: chatbot.email }, function (err, list) {
                                                console.log("create에서진행해이자식아");
                                                //방제
                                                Troom.roomTitle = receiverName;
                                                var channellist = addOne(list, Troom);
                                                socket.emit('oneononelist', channellist);
                                            });
                                            console.dir('새로만든 방정보' + Troom);
                                            var countNum;
                                            console.log('하긴하는거냐');
                                            if (Troom.chatCount == 0) {
                                                _database2.default.ListModel.findOne({ email: Troom.receiverEmail }, function (err, oneononelist) {
                                                    var croom = new _database2.default.RoomModel({
                                                        roomTitle: Troom.creater
                                                    });
                                                    var channellist = addOne(oneononelist, croom);
                                                    /*login_ids.find({email: jroom.receiverEmail}, function(err, you){
                                                        if(err) throw err
                                                        if(you) {
                                                            console.log('흠 이거 소켓아이디 하나 찾아서 따로 보낼거임')
                                                            io.to(you.socketid).emit('oneononelist', channellist);
                                                        }
                                                        })*/
                                                    var receiverSocket = login_ids.find(function (you) {
                                                        return you.email === Troom.receiverEmail;
                                                    });
                                                    if (receiverSocket) {
                                                        console.log("받는놈소켓아이디찾는다" + receiverSocket.socketId);
                                                        io.sockets.to(receiverSocket.socketId).emit('oneononelist', channellist);
                                                    } else {
                                                        console.log("받는놈이 접속을 안했다");
                                                        socket.broadcast.to(Troom.roomId).emit('oneononelist', channellist);
                                                    }
                                                    //io.sockets.in(jroom.roomId).emit('oneononelist', channellist);
                                                });
                                            }
                                            console.log("에듀미가봐야할내용이잖아");
                                            console.log("확인해보자 chatCount : " + Troom.chatCount);
                                            countNum = Troom.chatCount + 1;
                                            Troom.chatCount = countNum;
                                            console.log("증가 후 chatCount : " + Troom.chatCount);
                                            Troom.save(function (err) {
                                                if (err) throw err;
                                            });
                                            console.log(socket.request.sessionID);
                                            if (socket.request.sessionID) {
                                                console.log('로그인되어 있음.');
                                            } else {
                                                console.log('로그인 안되어 있음');
                                            }
                                            var _chat = new _database2.default.ChatModel({
                                                name: chatbot.name,
                                                message: chatbot.transcript,
                                                email: chatbot.email,
                                                roomId: Troom.roomId,
                                                chatCount: countNum
                                            });
                                            var message_time = _chat.created.getHours() + ':' + ("0" + _chat.created.getMinutes()).slice(-2);
                                            _chat.time = message_time;
                                            // 데이터베이스에 저장
                                            _chat.save(function (err) {
                                                if (err) throw err;
                                            });
                                            console.log('쳌쳌쳌체셋쳇쳇쳇' + _chat);
                                            io.sockets.in(Troom.roomId).emit('message', _chat);
                                        }
                                    });
                                }
                            });
                        }, 500);
                        bot.state = 'general';
                        bot.receiverList = [];
                        bot.sendReceiver = null;
                        bot.save(function (err) {
                            if (err) throw err;
                        });
                        console.log("전송성공 후 Bot의 state " + bot.state);
                        console.log("######send end######");
                        var modal = true;
                        socket.emit('request', modal);
                    }
                }
            }
        });
    });

    socket.on('room', function (room) {
        console.log('room 이벤트를 받았습니다.');
        if (room.command === 'create') {

            _database2.default.RoomModel.findOne({ roomId: room.roomId }, function (err, created_room) {

                if (created_room) {
                    console.log('이미 방이 존재해요 ' + created_room);
                    _database2.default.ListModel.findOne({ email: room.userEmail }, function (err, list) {
                        console.log("create에서진행해이자식아");
                        addList(list, created_room);
                    });
                } else {
                    console.log(room.roomId + '방을 새로 만듭니다.');

                    socket.join(room.roomId);

                    var croom = new _database2.default.RoomModel({
                        roomId: room.roomId,
                        roomTitle: room.roomId,
                        oneonone: false
                    });
                    croom.member.push(room.id);

                    croom.save(function (err) {
                        if (err) throw err;
                    });
                    _database2.default.ListModel.findOne({ email: room.userEmail }, function (err, list) {
                        console.log("create에서진행해이자식아");
                        var channellist = addList(list, croom);
                        socket.emit('channellist', channellist);
                    });
                    console.dir('새로만든 방정보' + croom);
                }
            });
        } else if (room.command === 'message') {
            //******************chatbot 예제코드******************//

            console.log('message 이벤트를 받았습니다.');
            console.log('room객체알려주세요룸룸룸', room);
            if (room.oneonone == true) {
                var countNum;
                _database2.default.RoomModel.findOne({ creater: room.roomId, receiver: room.name }, function (err, jroom) {
                    if (err) throw err;
                    if (jroom) {
                        console.log("에듀미가봐야할내용이잖아");
                        console.log("확인해보자 chatCount : " + jroom.chatCount);
                        countNum = jroom.chatCount + 1;
                        jroom.chatCount = countNum;
                        console.log("증가 후 chatCount : " + jroom.chatCount);
                        jroom.save(function (err) {
                            if (err) throw err;
                        });
                        console.log(socket.request.sessionID);
                        if (socket.request.sessionID) {
                            console.log('로그인되어 있음.');
                        } else {
                            console.log('로그인 안되어 있음');
                        }
                        var chat = new _database2.default.ChatModel({
                            name: room.name,
                            message: room.message,
                            email: room.email,
                            roomId: jroom.roomId,
                            chatCount: countNum
                        });
                        var message_time = chat.created.getHours() + ':' + ("0" + chat.created.getMinutes()).slice(-2);
                        chat.time = message_time;
                        // 데이터베이스에 저장
                        chat.save(function (err) {
                            if (err) throw err;
                        });
                        console.log('쳌쳌쳌체셋쳇쳇쳇' + chat);

                        for (var i = 0; i < recentMsg.length; i++) {
                            if (recentMsg[i].roomId === jroom.roomId) {
                                recentMsg.splice(i, 1);
                            }
                        }

                        recentMsg.push({ chatCount: countNum, roomId: jroom.roomId, message: room.message });
                        //object
                        console.log('recentMsg시방', recentMsg);
                        io.sockets.in(chat.roomId).emit('message', chat);
                        io.sockets.in(chat.roomId).emit('recentmsg', recentMsg);
                    }
                });
                _database2.default.RoomModel.findOne({ creater: room.name, receiver: room.roomId }, function (err, jroom) {
                    if (err) throw err;
                    if (jroom) {
                        if (jroom.chatCount == 0) {
                            _database2.default.ListModel.findOne({ email: jroom.receiverEmail }, function (err, oneononelist) {
                                var croom = new _database2.default.RoomModel({
                                    roomTitle: jroom.creater
                                });
                                var channellist = addOne(oneononelist, croom);
                                /*login_ids.find({email: jroom.receiverEmail}, function(err, you){
                                    if(err) throw err
                                    if(you) {
                                        console.log('흠 이거 소켓아이디 하나 찾아서 따로 보낼거임')
                                        io.to(you.socketid).emit('oneononelist', channellist);
                                    }
                                  })*/
                                var receiverSocket = login_ids.find(function (you) {
                                    return you.email === jroom.receiverEmail;
                                });
                                if (receiverSocket) {
                                    console.log("받는놈소켓아이디찾는다" + receiverSocket.socketId);
                                    io.sockets.to(receiverSocket.socketId).emit('oneononelist', channellist);
                                } else {
                                    console.log("받는놈이 접속을 안했다");
                                    io.sockets.in(jroom.roomId).emit('oneononelist', channellist);
                                }

                                //io.sockets.in(jroom.roomId).emit('oneononelist', channellist);
                            });
                        }
                        console.log("확인해보자 chatCount : " + jroom.chatCount);
                        countNum = jroom.chatCount + 1;
                        jroom.chatCount = countNum;
                        console.log("증가 후 chatCount : " + jroom.chatCount);
                        jroom.save(function (err) {
                            if (err) throw err;
                        });
                        console.log(socket.request.sessionID);
                        if (socket.request.sessionID) {
                            console.log('로그인되어 있음.');
                        } else {
                            console.log('로그인 안되어 있음');
                        }
                        var chat = new _database2.default.ChatModel({
                            name: room.name,
                            message: room.message,
                            email: room.email,
                            roomId: jroom.roomId,
                            chatCount: countNum
                        });
                        var message_time = chat.created.getHours() + ':' + ("0" + chat.created.getMinutes()).slice(-2);
                        chat.time = message_time;
                        // 데이터베이스에 저장
                        chat.save(function (err) {
                            if (err) throw err;
                        });
                        console.log(chat);

                        for (var i = 0; i < recentMsg.length; i++) {
                            if (recentMsg[i].roomId === jroom.roomId) {
                                recentMsg.splice(i, 1);
                            }
                        }

                        recentMsg.push({ chatCount: countNum, roomId: jroom.roomId, message: room.message });
                        //object
                        console.log('recentMsg시방', recentMsg);
                        io.sockets.in(chat.roomId).emit('message', chat);
                        io.sockets.in(chat.roomId).emit('recentmsg', recentMsg);
                    }
                });
            } else {

                var countNum;

                _database2.default.RoomModel.findOne({ roomId: room.roomId }, function (err, croom) {
                    if (err) throw err;
                    if (croom) {
                        console.log("확인해보자 chatCount : " + croom.chatCount);
                        countNum = croom.chatCount + 1;
                        croom.chatCount = countNum;
                        console.log("증가 후 chatCount : " + croom.chatCount);
                        croom.save(function (err) {
                            if (err) throw err;
                        });
                        console.log(socket.request.sessionID);
                        if (socket.request.sessionID) {
                            console.log('로그인되어 있음.');
                        } else {
                            console.log('로그인 안되어 있음');
                        }
                        var chat = new _database2.default.ChatModel({
                            name: room.name,
                            message: room.message,
                            email: room.email,
                            roomId: room.roomId,
                            chatCount: countNum
                        });
                        var message_time = chat.created.getHours() + ':' + ("0" + chat.created.getMinutes()).slice(-2);
                        chat.time = message_time;
                        // 데이터베이스에 저장
                        chat.save(function (err) {
                            if (err) throw err;
                        });
                        console.log(chat);

                        for (var i = 0; i < recentMsg.length; i++) {
                            if (recentMsg[i].roomId === room.roomId) {
                                recentMsg.splice(i, 1);
                            }
                        }

                        recentMsg.push({ chatCount: countNum, roomId: room.roomId, message: room.message });
                        //object
                        console.log('recentMsg시방', recentMsg);
                        io.sockets.in(chat.roomId).emit('message', chat);
                        io.sockets.in(chat.roomId).emit('recentmsg', recentMsg);
                    }
                });
            }
        } else if (room.command === 'join') {
            console.log(room.roomId + '에 입장합니다');
            if (room.oneonone) {
                _database2.default.RoomModel.findOne({ creater: room.id, receiver: room.roomId }, function (err, joinRoom) {
                    if (err) throw err;
                    if (joinRoom) {
                        console.log("creater가 나야" + joinRoom.creater);
                        socket.join(joinRoom.roomId);
                        socket.emit('join', joinRoom); //추가
                        _database2.default.ChatModel.find({ roomId: joinRoom.roomId }, function (err, premsg) {
                            console.log('왜안뜨지');
                            if (err) throw err;
                            if (premsg) {
                                var fn = premsg.length;
                                if (fn < 15) {
                                    st = 0;
                                } else {
                                    var st = fn - 15;
                                }
                                console.log("fn : " + fn + ", st : " + st);
                                var premsg_slice = premsg.slice(st, fn);
                                console.log("프리메시지다 : " + premsg);
                                socket.emit('premsg', premsg);
                            } else {
                                console.log("아무것도없어");
                            }
                        });
                        _database2.default.RoomModel.findOne({ roomId: joinRoom.roomId }, function (err, created_room) {
                            if (created_room) {
                                console.dir("내가지금알고싶은거" + created_room);
                                if (!created_room.member.includes(room.id)) {
                                    console.log("id가 없으므로 id 추가");
                                    created_room.member.push(room.id);
                                    created_room.memberJoinNum.push({ 'email': room.id, 'chatNum': created_room.chatCount });
                                    console.log("확인해보자$%#$%@#$%@");
                                    console.dir(created_room.memberJoinNum);
                                    io.sockets.in(created_room.roomId).emit('memberlist', created_room);
                                } else {
                                    console.log("id가 존재함");
                                }
                                created_room.save(function (err) {
                                    if (err) throw err;
                                });

                                console.log(created_room.member);
                                console.log("************멤버리스트 함 볼까요************" + created_room);
                                io.sockets.in(created_room.roomId).emit('memberlist', created_room);
                            }
                        });
                    } else {
                        console.log("creater가 내가 아니네");
                        _database2.default.RoomModel.findOne({ receiver: room.id, creater: room.roomId }, function (err, joinRoom2) {
                            console.log("creater가 너야" + joinRoom2.creater);
                            socket.join(joinRoom2.roomId);
                            socket.emit('join', joinRoom2);
                            _database2.default.ChatModel.find({ roomId: joinRoom2.roomId }, function (err, premsg) {

                                if (err) throw err;
                                if (premsg) {
                                    var fn = premsg.length;
                                    if (fn < 15) {
                                        st = 0;
                                    } else {
                                        var st = fn - 15;
                                    }
                                    console.log("fn : " + fn + ", st : " + st);
                                    var premsg_slice = premsg.slice(st, fn);
                                    console.log("프리메시지다 : " + premsg);
                                    socket.emit('premsg', premsg);
                                } else {
                                    console.log("아무것도없어");
                                }
                            });
                            _database2.default.RoomModel.findOne({ roomId: joinRoom2.roomId }, function (err, created_room) {
                                if (created_room) {
                                    console.dir("내가지금알고싶은거" + created_room);
                                    if (!created_room.member.includes(room.id)) {
                                        console.log("id가 없으므로 id 추가");
                                        created_room.member.push(room.id);
                                        created_room.memberJoinNum.push({ 'email': room.id, 'chatNum': created_room.chatCount });
                                        console.log("확인해보자$%#$%@#$%@");
                                        console.dir(created_room.memberJoinNum);
                                        io.sockets.in(created_room.roomId).emit('memberlist', created_room);
                                    } else {
                                        console.log("id가 존재함");
                                    }
                                    created_room.save(function (err) {
                                        if (err) throw err;
                                    });

                                    console.log(created_room.member);
                                    console.log("************멤버리스트 함 볼까요************" + created_room);
                                    io.sockets.in(created_room.roomId).emit('memberlist', created_room);
                                }
                            });
                        });
                    }
                });
            } else {
                console.log("그룹채팅방에 입장함시바려나");
                socket.join(room.roomId);
                _database2.default.ChatModel.find({ roomId: room.roomId }, function (err, premsg) {

                    if (err) throw err;
                    if (premsg) {
                        var fn = premsg.length;
                        if (fn < 15) {
                            st = 0;
                        } else {
                            var st = fn - 15;
                        }
                        console.log("fn : " + fn + ", st : " + st);
                        var premsg_slice = premsg.slice(st, fn);
                        console.log("프리메시지다 : " + premsg);
                        socket.emit('premsg', premsg);
                    } else {
                        console.log("아무것도없어");
                    }
                });
                _database2.default.RoomModel.findOne({ roomId: room.roomId }, function (err, created_room) {
                    if (created_room) {
                        console.dir("내가지금알고싶은거" + created_room);
                        if (!created_room.member.includes(room.id)) {
                            console.log("id가 없으므로 id 추가");
                            created_room.member.push(room.id);
                            created_room.memberJoinNum.push({ 'email': room.id, 'chatNum': created_room.chatCount });
                            console.log("확인해보자$%#$%@#$%@");
                            console.dir(created_room.memberJoinNum);
                            io.sockets.in(created_room.roomId).emit('memberlist', created_room);
                        } else {
                            console.log("id가 존재함");
                        }
                        created_room.save(function (err) {
                            if (err) throw err;
                        });
                        _database2.default.ListModel.findOne({ email: room.userEmail }, function (err, list) {
                            console.log("join에서진행해이자식아");
                            var channellist = addList(list, created_room);
                            console.log("list뭐니" + channellist);
                        });

                        console.log(created_room.member);
                        console.log("************멤버리스트 함 볼까요************" + created_room);
                        io.sockets.in(created_room.roomId).emit('memberlist', created_room);
                    }
                });
            }
        } else if (room.command === 'leave') {} else if (room.command === 'loadmsg') {
            /*
            var loadCount = room.chatSize;
            console.log("빼애애액" + loadCount);
            database.ChatModel.find({roomId : room.roomId}, function(err, loadmsg){
                if (err) throw err;
                if (loadmsg) {
                    var divide = loadmsg.length - loadCount;
                    var fn = loadmsg.length;
                    console.log("빼애애애액divide" + divide);
                    if(divide < 0)
                    {
                        console.log("저장된 msg길이보다 넘어온 길이가 더 큽니다.")
                    } else if(divide == 0) {
                        console.log("끝에 도달했습니다.")
                    } else if(divide < 15) {
                        st = 0
                        console.log("fn : " + fn + ", st : " + st)
                        var premsg_slice = loadmsg.slice(st, fn)
                        console.log("로드메시지다 : " + premsg_slice);
                        socket.emit('loadmsg', premsg_slice);
                    } else {
                        var st = divide - 15
                        console.log("fn : " + fn + ", st : " + st)
                        var premsg_slice = loadmsg.slice(st, fn)
                        console.log("로드메시지다 : " + premsg_slice);
                        socket.emit('loadmsg', premsg_slice);
                    }
                } else {
                    console.log("아무것도없어");
                }
              }); */
            //일단성공한코드
            var loadCount = room.chatSize;
            _database2.default.ChatModel.find({ roomId: room.roomId }, function (err, loadmsg) {
                if (err) throw err;
                if (loadmsg) {
                    var fn = loadmsg.length - loadCount;
                    if (fn < 0) {
                        console.log("저장된 msg길이보다 넘어온 길이가 더 큽니다.");
                    } else if (fn == 0) {
                        console.log("끝에 도달했습니다.");
                    } else if (fn < 15) {
                        st = 0;
                        console.log("fn : " + fn + ", st : " + st);
                        var premsg_slice = loadmsg.slice(st, fn);
                    } else {
                        var st = fn - 15;
                        console.log("fn : " + fn + ", st : " + st);
                        var premsg_slice = loadmsg.slice(st, fn);
                    }

                    console.log("로드메시지다 : " + premsg_slice);
                    socket.emit('loadmsg', premsg_slice);
                } else {
                    console.log("아무것도없어");
                }
            });
        }
        console.dir(room);
    });
};

function addList(list, croom) {
    if (list) {
        var newArr = list.roomIds.filter(function (data) {
            return data.text === croom.roomTitle;
        });
        if (newArr.length > 0) {
            console.log("list의 roomids에" + croom.roomTitle + "가 이미 존재합니다.");
        } else {
            console.log("list의 roomids에" + croom.roomTitle + "를 추가합니다.");
            list.roomIds.push({ "text": croom.roomTitle });
            list.save(function (err) {
                if (err) throw err;
            });
        }
    }
    return list;
}

function addOne(list, croom) {
    if (list) {
        var newArr = list.oneonones.filter(function (data) {
            return data.text === croom.roomTitle;
        });
        if (newArr.length > 0) {
            console.log("list의 oneonones에" + croom.roomTitle + "가 이미 존재합니다.");
        } else {
            console.log("list의 oneonones에" + croom.roomTitle + "를 추가합니다.");
            list.oneonones.push({ "text": croom.roomTitle });
            list.save(function (err) {
                if (err) throw err;
            });
        }
    }
    return list;
}