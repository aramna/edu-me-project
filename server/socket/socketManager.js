import database from '../database/database'
import bayes from 'bayes'
import fs from 'fs'
//const users = {socketId: String, email: String};
const login_ids = [];
module.exports = function(socket) {
    var io = require('../edume-server').io;
    var request = require('request');

    var saveMsg = [];
    var rooms = [];
    var sendReceiver = "who"//수신인의 이름
    var category = ""
    var contents = ""
    var receiverList = []//동일이름을 가진 사용자들의 이메일
    var receiverEmail = "who"//동일이름일 경우 수신인의 이메일

    console.log('connection info :', socket.request.connection._peername);

    socket.remoteAddress = socket.request.connection._peername.address;
    socket.remotePort = socket.request.connection._peername.port;

    console.log(socket.remoteAddress);
    console.log(socket.remotePort);

    //'login' 이벤트를 받았을 떄의 처리
    socket.on('login', function(login){
        console.log('login 이벤트를 받았습니다.');
        console.dir(login);

        //main방 존재 여부 확인
        database.RoomModel.findOne({roomId : login.roomId}, function(err, room){

            //main방 존재하여 입장
            if (room){
                console.log(login.roomId + "방에 입장합니다.");
                socket.join(login.roomId);

                //main방 member list에 사용자 존재 여부 확인 후 없으면 추가
                if(!room.member.includes(login.id)){
                    console.log("id가 없으므로 id 추가");
                    room.member.push(login.id);
                } else {
                    console.log("id가 존재함");
                }
                //main방 상태 저장
                room.save(err =>{
                    if (err) throw err
                });
                console.log("1",room.member);

                console.log("????????????????" + room);
                io.sockets.in(login.roomId).emit('memberlist', room);
                database.ListModel.findOne({email : login.userEmail}, function(err, list){
                    console.log("login에서진행해이자식아")
                    var channellist = addList(list, room);
                    socket.emit('channellist', channellist);
                    socket.emit('oneononelist', channellist);
                    console.log('login에서보여주는 list' + channellist);
                });
            } else {
                console.log(login.roomId + "방을 생성합니다.");
                //main 방 생성
                let room = new database.RoomModel({
                    roomId : login.roomId,
                    roomTitle : login.roomId,
                    member : [],
                    oneonone : false
                });

                room.member.push(login.id);

                room.save(err =>{
                    if (err) throw err
                });

                console.log("메인의 멤버 : " + room.member);
                //main방 생성
                socket.join(login.roomId);

                io.sockets.in(login.roomId).emit('memberlist', room);
                database.ListModel.findOne({email : login.userEmail}, function(err, list){
                    console.log("login에서진행해이자식아")
                    var channellist = addList(list, room);
                    socket.emit('channellist', channellist);
                    socket.emit('oneononelist', channellist);
                    console.log('login에서보여주는 list' + channellist);
                });
            }
        });

        //기존 클라이언트 ID가 없으면 클라이언트 ID를 맵에 추가
        console.log('접속한 소켓의 ID : ' + socket.id);
        var newSocket = {email:login.userEmail, socketId:socket.id};
        login_ids.push(newSocket);
        console.log('login_ids', login_ids);
        console.log('login.roomId는 ' + login.roomId);

        //메시지 불러오기
        database.ChatModel.find({roomId : login.roomId}, function(err, premsg){
            console.log("%%%%%%%%%%%%" + premsg)
            if (premsg) {
                var fn = premsg.length
                if(fn < 15)
                {
                    st = 0
                } else {
                    var st = fn - 15
                }
                console.log("fn : " + fn + ", st : " + st)
                var premsg_slice = premsg.slice(st, fn)
                console.log("프리메시지다 : " + premsg);
                socket.emit('premsg', premsg);
            } else {
                console.log("아무것도없어");
            }
        });
        database.ListModel.find(function(err, roomlist){
            io.sockets.emit('roomsearch', roomlist);
            console.log('룸리스트서치요'+roomlist);
        });

        database.UserModel.find(function(err, userslist){
            var useridx = 0;
            var userFind = userslist.find(function(item) {return item.email === login.userEmail});
            useridx = userslist.indexOf(userFind);
            userslist.splice(useridx, 1);
            console.log("내가누구냐" + userFind);
            console.log("useridx" + useridx);
            io.sockets.emit('usersearch', userslist);
            console.log('유저리스트서치요' + userslist);
        });
    });

    socket.on('logout', function(logout) {
        console.log('로그아웃 합니다.');
        var i = login_ids.indexOf(logout);
        login_ids.splice(i, 1);
    });

    socket.on('oneonone', function(oneonone){
        console.log('oneonone 이벤트를 받았습니다.');
        console.log(oneonone)
        if(oneonone.command === 'create') {
            database.RoomModel.findOne({creater : oneonone.creater, receiver : oneonone.receiver}, function(err, created_room){
                if (created_room){
                    console.log('이미 방이 존재해요 ' + created_room);
                    database.ListModel.findOne({email : oneonone.userEmail}, function(err, list){
                        console.log("워너원의 create에서진행해이자식아")
                        created_room.roomTitle = created_room.receiver
                        addOne(list, created_room);
                        if (list) {
                            var newArr = list.oneonones.filter(function(data){
                                return data.text === created_room.roomTitle;
                            })
                            if(newArr.length>0){
                                console.log("list의 roomids에" + created_room.receiver + "가 이미 존재합니다.")
                            } else {
                                console.log("list의 roomids에" + created_room.receiver + "를 추가합니다.")
                                list.oneonones.push({"text":created_room.receiver});
                                list.save(err => {
                                    if (err) throw err
                                });
                            }
                        }
                    });
                } else {
                    console.log(oneonone.receiver + '일대일 채팅방을 새로 만듭니다.');
                    var roomId = oneonone.creater+Math.random().toString(26).slice(2)+oneonone.receiver
                    socket.join(roomId);

                    let croom = new database.RoomModel({
                        roomId: roomId,
                        creater: oneonone.creater,
                        receiver: oneonone.receiver,
                        receiverEmail: oneonone.receiverEmail,
                        oneonone: true
                    })
                    croom.member.push(oneonone.creater);
                    croom.member.push(oneonone.receiver);
                    console.log(croom+"croom 입니다")
                    croom.save(err => {
                        if (err) throw err
                    });

                    database.ListModel.findOne({email : oneonone.userEmail}, function(err, list){
                        console.log("create에서진행해이자식아")
                        //방제
                        croom.roomTitle = oneonone.receiver;
                        var channellist = addOne(list, croom);
                        socket.emit('oneononelist', channellist);
                    });
                    console.dir('새로만든 방정보' + croom);
                }
            });
        }
    })
    socket.on('transcript', function(chatbot){
        console.log(chatbot);

        //텍스트 분석 api 적용
        var openApiURL = 'http://aiopen.etri.re.kr:8000/WiseNLU';
        var access_key = '23a07699-433a-4978-9cd3-c680017ac4c9';
        var analysisCode = 'morp';

        database.BotModel.findOne({name : chatbot.email}, function(err, bot){
            console.log("봇 객체 = " + bot);
            console.log("봇 상태 = " + bot.state);
            var classifier = bayes({//카테고리 분류
                tokenizer: function(text) {
                    return text.split(' ')}
            })
            var classifier2 = bayes({//이름분류
                tokenizer: function (text) {
                    return text.split('')
                }
            })
            var classifier3 = bayes({//yes/No 분류
                tokenizer: function (text) {
                    return text.split(' ')
                }
            })
            var classifier4 = bayes({//yes/No 분류
                tokenizer: function (text) {
                    return text.split(' ')
                }
            })
            const article3 = fs.readFileSync("../edu-me-project/config/yesNo.txt");
            var lineArray3 = article3.toString();
            var line3 = lineArray3.split('\r\n');

            for (var i in line3) {
                var s = line3[i].split(',');
                classifier3.learn(s[0], s[1]);
            }
            var str = chatbot.transcript
            var requestJson = {//api요청
                'access_key': access_key,
                'argument': {
                    'text': str,//분석할 텍스트
                    'analysis_code': analysisCode
                }
            };
            var options = {//api옵션
                url: openApiURL,
                body: JSON.stringify(requestJson),
                headers: {'Content-Type':'application/json; charset=UTF-8'}
            };

            if(bot.state == 'general')//챗봇 명령 처음단계
            {
                console.log("챗봇을 실행시킵니다.");
                sendReceiver = "who"//수신인 이름 초기화
                category = ""//명령 카테고리
                contents = ""
                receiverList = []
                receiverEmail = "who"//동일이름일 경우 수신인의 이메일 초기화

                //베이지안 알고리즘으로 텍스트분석
                var ch = "not"//"ㅇㅇ한테"를 가져올 변수
                const article = fs.readFileSync("../edu-me-project/config/test.txt");
                var lineArray = article.toString();
                var line = lineArray.split('\r\n');
                for(var i in line){
                    var s = line[i].split(",");
                    classifier.learn(s[0], s[1]);
                }
                request.post(options, function (error, response, body) {//형태소 분석
                    var s = body
                    var res = JSON.parse(s)
                    for (var i in res.return_object.sentence[0].morp) {
                        //console.log(res.return_object.sentence[0].morp[i])
                        if (res.return_object.sentence[0].morp[i].type == 'JKB' && (res.return_object.sentence[0].morp[i].lemma == '한테'||
                                res.return_object.sentence[0].morp[i].lemma == '에게')) {
                            if (res.return_object.sentence[0].morp[i - 1].type == 'NNG' || res.return_object.sentence[0].morp[i - 1].type == 'NNP') {
                                ch = res.return_object.sentence[0].morp[Number(i) - 1].lemma + res.return_object.sentence[0].morp[i].lemma
                                sendReceiver = res.return_object.sentence[0].morp[i - 1].lemma
                            }else if(res.return_object.sentence[0].morp[i-1].type == 'VCP' || res.return_object.sentence[0].morp[i-1].type == 'XSN'){
                                ch = res.return_object.sentence[0].morp[Number(i) - 2].lemma+res.return_object.sentence[0].morp[Number(i) - 1].lemma + res.return_object.sentence[0].morp[i].lemma
                                sendReceiver = res.return_object.sentence[0].morp[i - 2].lemma
                            }//"주희한테 문자 보내줘"->ch = "주희한테"
                        }
                    }
                    setTimeout(function () {
                        console.log('ch >>'+ch)
                        if(ch !== "not"){
                            var idx = str.indexOf(ch)
                            if(idx == 0){//"ㅇㅇ한테"가 문장 처음에 있는 경우
                                str = str.substring(ch.length+1, str.length)
                            }else{//그 외의 경우
                                str = str.substring(0, idx-1)+str.substring(idx+ch.length, str.length)
                            }//str ="주희한테 문자 보내줘"에서 "문자 보내줘"만 추출
                        }
                        console.log('str >> '+str)
                        category = classifier.categorize(str)[0];//카테고리 분류
                        console.log("category - " + category);
                        if(category == 'send') {
                            if (sendReceiver == 'who') {
                                contents = '누구한테 보낼까요'
                                bot.state = 'send0'
                            }
                            else {
                                database.UserModel.find(function (err, resp) {
                                    if (err) console.log('에러발생 ' + err);
                                    for (var i in resp) {
                                        classifier2.learn(resp[i].username, resp[i].username)
                                    }
                                    var receiver = classifier2.categorize(sendReceiver)
                                    console.log("찾은 사용자 >> "+ receiver)
                                    sendReceiver = receiver[0]
                                    contents = receiver[0] + '님한테 보낼까요?'
                                    bot.state = 'send1'
                                })
                            }
                        }
                        else if(category == 'receive'){//문자 확인할 때
                            if(sendReceiver == 'who'){

                            }else{

                            }//나중에 추가예정
                            var list_num = 0
                            var list_message_num = []
                            database.ListModel.findOne({email: chatbot.email}, function(err, oneononelist){//채널리스트 가져오기
                                console.log("채널리스트 >> ", oneononelist, "채널리스트 수: ",oneononelist.__v)
                                list_num = oneononelist.__v
                                for(var i=0;i<oneononelist.oneonones.length; i++){
                                    console.log(oneononelist.oneonones[i].text)
                                }
                                socket.emit('receive_request',list_num)
                                console.log("프론트에 채널리스트 수 전송완료")
                            })
                            database.RoomModel.find(function(err, created_room){//존재하는 채팅방 가져오기
                              console.log("*********room정보*********")
                                for(var i=0;i<created_room.length;i++){
                                  console.log("roomId: ",created_room[i].roomId);
                                  console.log("메시지 수: ",created_room[i].messageNum);
                                  list_message_num.push({"roomID": created_room[i].roomId, "message_num": created_room[i].messageNum})
                                }
                                console.log(list_message_num)
                                socket.emit('receive_request',list_message_num)
                                console.log("프론트에 채널의 메시지 수 전송완료")
                            })
                        }
                    }, 500)
                    setTimeout(function () {
                        socket.emit('request',contents)
                        console.log("현재 sendReceiver >> "+sendReceiver)
                        console.log("챗봇 : "+contents)
                        bot.save(err => {
                            if (err) throw err
                            else {
                                console.log("Bot의 state가 " + bot.state + "로 update되었습니다.");
                            }
                        })
                    },600)
                });
            }else if(bot.state == 'send-email') {
                const article4 = fs.readFileSync("../edu-me-project/config/num.txt");
                var lineArray4 = article4.toString();
                var line4 = lineArray4.split('\r\n');

                for (var i in line4) {
                    var s = line4[i].split(',');
                    classifier4.learn(s[0], s[1]);
                }
                var res = classifier4.categorize(chatbot.transcript)[0]
                contents = '뭐라고 보낼까요?'
                if (res == 1) {
                    receiverEmail = receiverList[0]
                } else if (res == 2) {
                    receiverEmail = receiverList[1]
                } else if (res == 3) {
                    receiverEmail = receiverList[2]
                } else if (res == 4) {
                    receiverEmail = receiverList[3]
                } else if (res == 5) {
                    receiverEmail = receiverList[4]
                }
                console.log(res+"번이 선택되어 이메일이 확정되었습니다.")
                bot.state = 'send'
                socket.emit('request', contents);
                console.log("챗봇 : "+contents)
                bot.save(err => {
                    if (err) throw err
                    console.log('Bot의 state가 ' + bot.state + '로 update되었습니다.');
                })
            }
            else if (bot.state == 'send0') {
                if (sendReceiver == 'who') {
                    request.post(options, function (error, response, body) {
                        s = body
                        //console.log(s)
                        var res = JSON.parse(s)
                        for (var i in res.return_object.sentence[0].morp) {
                            if (res.return_object.sentence[0].morp[i].type == 'JKB' && (res.return_object.sentence[0].morp[i].lemma == '한테'||
                                    res.return_object.sentence[0].morp[i].lemma == '에게')) {
                                if (res.return_object.sentence[0].morp[i - 1].type == 'NNG' || res.return_object.sentence[0].morp[i - 1].type == 'NNP') {
                                    sendReceiver = res.return_object.sentence[0].morp[i - 1].lemma
                                }else if(res.return_object.sentence[0].morp[i-1].type == 'VCP' || res.return_object.sentence[0].morp[i-1].type == 'XSN'){
                                    sendReceiver = res.return_object.sentence[0].morp[i - 2].lemma
                                }
                            } else {
                                sendReceiver = chatbot.transcript
                            }
                        }
                    });
                    setTimeout(function () {
                        database.UserModel.find(function (err, resp) {
                            if (err) console.log('에러발생 ' + err);
                            for (var i in resp) {
                                classifier2.learn(resp[i].username, resp[i].username)
                            }
                            var receiver = classifier2.categorize(sendReceiver)
                            console.log("찾은 사용자 >> "+ receiver)
                            sendReceiver = receiver[0]
                            contents = receiver[0] + '님한테 보낼까요?'
                            bot.state = 'send1'
                        })
                    }, 900)
                } else {//**이메일찾는거 바꾸기
                    classifier2.learn(sendReceiver, chatbot.transcript)//이부분 파일에 추가하는걸로 바까야함
                    sendReceiver = chatbot.transcript
                    database.UserModel.find(function (err, resp) {
                        if (err) console.log('에러발생 ' + err);
                        for (var i in resp) {
                            if(resp[i].username == sendReceiver){
                                receiverEmail = resp[i].email
                            }
                        }
                    })
                    contents = '뭐라고 보낼까요'
                    bot.state = 'send'
                }
                setTimeout(function () {
                    socket.emit('request', contents);
                    console.log("현재 sendReceiver >> "+sendReceiver)
                    console.log("챗봇 : "+contents)
                    bot.save(err => {
                        if (err) throw err
                        console.log('Bot의 state가  '+ bot.state + '로 update되었습니다.');
                    })
                }, 1000)
            }
            else if (bot.state == 'send1') {
                var ans = classifier3.categorize(chatbot.transcript)
                console.log(ans[0])
                if (ans[0] == 'yes') {
                    console.log("sendReceiver - "+sendReceiver)
                    database.UserModel.find(function (err, resp) {
                        if (err) console.log('에러발생 ' + err);
                        var num = 0
                        for(var i in resp){
                            if(resp[i].username == sendReceiver){
                                num++//동일이름인 사용자 수
                                receiverEmail = resp[i].email //수신인의 이메일
                                receiverList.push(resp[i].email)
                            }
                        }
                        if(num == 1){
                            contents = '뭐라고 전송할까요'
                            bot.state = 'send'
                        }else if(num>1){
                            var sen = "동일 이름이 존재합니다. 이메일을 확인해 주세요"
                            for(var i in receiverList){
                                sen +=(Number(i)+1) +"번 "+receiverList[i]+" "
                                contents = sen
                                bot.state = 'send-email'
                            }
                        }
                    })
                } else {
                    sendReceiver = 'who'//챗봇이 찾은 사용자가 틀렸으므로 수신인 이름 다시 초기화
                    request.post(options, function (error, response, body) {
                        s = body
                        //console.log(s)
                        var res = JSON.parse(s)
                        for (var i in res.return_object.sentence[0].morp) {
                            console.log(res.return_object.sentence[0].morp[i])
                            if (res.return_object.sentence[0].morp[i].type == 'JKB' && (res.return_object.sentence[0].morp[i].lemma == '한테'||
                                    res.return_object.sentence[0].morp[i].lemma == '에게')) {
                                if (res.return_object.sentence[0].morp[i - 1].type == 'NNG' || res.return_object.sentence[0].morp[i - 1].type == 'NNP') {
                                    sendReceiver = res.return_object.sentence[0].morp[i - 1].lemma
                                }else if(res.return_object.sentence[0].morp[i-1].type == 'VCP' || res.return_object.sentence[0].morp[i-1].type == 'XSN'){
                                    sendReceiver = res.return_object.sentence[0].morp[i - 2].lemma
                                }
                            }
                        }
                    });
                    setTimeout(function () {
                        if (sendReceiver == 'who') {
                            contents = '누구한테 보낼까요'
                            bot.state = 'send0'
                        }
                        else {
                            database.UserModel.find(function (err, resp) {
                                if (err) console.log('에러발생 ' + err);
                                for (var i in resp) {
                                    classifier2.learn(resp[i].username, resp[i].username)
                                }
                                var receiver = classifier2.categorize(sendReceiver)
                                console.log("찾은 사용자 >> "+ receiver)
                                sendReceiver = receiver[0]
                                contents = receiver[0] + '님한테 보낼까요?'
                                bot.state = 'send1'
                            })
                        }
                    }, 900)
                }
                setTimeout(function () {
                    socket.emit('request', contents);
                    console.log("현재 sendReceiver >> "+sendReceiver)
                    console.log("현재 receiverEmail >> "+receiverEmail)
                    console.log("챗봇 : "+contents)
                    bot.save(err => {
                        if (err) throw err
                        console.log('Bot의 state가 ' + bot.state + '로 update되었습니다.');
                    })
                },1000)
            }
            else if(bot.state == 'send')
            {   //안영민
                if(receiverEmail == 'who')
                {
                    contents = '수신자가 지정되지 않았습니다. 수신자를 말씀해 주세요'
                    bot.state = 'send0'
                    socket.emit('request', contents);
                }

                //chatbot.email, sendReceiver, chatbot.transcript -> 메시지내용
                //메시지전송하는 행위를 씀.
                //우선 일대일 채팅방이 있는지 확인 후 있으면 입장, 없으면 생성
                var sendRoomId = null;
                setTimeout(function(){
                    database.RoomModel.findOne({creater: chatbot.email, receiver: receiverEmail}, function(err, oneonone){
                        if (err) throw err;
                        if(oneonone)
                        {
                            sendRoomId = oneonone.roomId;
                            //존재하여 룸입장
                            socket.join(sendRoomId);
                        } else
                        {
                            //일대일 방 찾기 2번째
                            database.RoomModel.findOne({creater: receiverEmail, receiver: chatbot.email}, function(err, oneonone2){
                                if (err) throw err;
                                if(oneonone2)
                                {
                                    sendRoomId = oneonone2.roomId;
                                    //존재하여 룸입장
                                    socket.join(sendRoomId);
                                } else
                                {
                                    //룸아이디 해쉬
                                    var sendRoomId = chatbot.email+Math.random().toString(26).slice(2)+receiverEmail
                                    //해당 룸아이디로 입장
                                    socket.join(sendRoomId);
                                    //룸 정보 데베 저장
                                    let croom = new database.RoomModel({
                                        roomId: sendRoomId,
                                        creater: chatbot.name,
                                        receiver: sendReceiver,
                                        receiverEmail: receiverEmail,
                                        oneonone: true
                                    })
                                    croom.member.push(chatbot.name);
                                    croom.member.push(sendReceiver);
                                    console.log(croom+"croom 입니다")
                                    croom.save(err => {
                                        if (err) throw err
                                    });
                                    //list에 룸정보 추가
                                    database.ListModel.findOne({email : chatbot.email}, function(err, list){
                                        console.log("create에서진행해이자식아")
                                        //방제
                                        croom.roomTitle = sendReceiver;
                                        var channellist = addOne(list, croom);
                                        socket.emit('oneononelist', channellist);
                                    });
                                    console.dir('새로만든 방정보' + croom);
                                }
                            })
                        }
                    })
                    setTimeout(function(){
                        let chat = new database.ChatModel({
                            name: chatbot.name,
                            message: chatbot.transcript,
                            email: chatbot.email,
                            roomId: sendRoomId
                        })
                        var message_time = `${chat.created.getHours()}:${("0" + chat.created.getMinutes()).slice(-2)}`;
                        chat.time = message_time;

                        // 데이터베이스에 저장
                        chat.save(err => {
                            if (err) throw err
                        })
                        io.sockets.in(sendRoomId).emit('message', chat);
                    }, 600)
                }, 600)

                bot.state = 'general';
                bot.save(err => {
                    if(err) throw err;
                });
                console.log("전송성공 후 Bot의 state " + bot.state);
            }
        })
    });
    socket.on('room', function(room) {
        console.log('room 이벤트를 받았습니다.')
        if(room.command === 'create') {

            database.RoomModel.findOne({roomId : room.roomId}, function(err, created_room){

                if (created_room){
                    console.log('이미 방이 존재해요 ' + created_room);
                    database.ListModel.findOne({email : room.userEmail}, function(err, list){
                        console.log("create에서진행해이자식아")
                        addList(list, created_room);
                    });
                } else {
                    console.log(room.roomId + '방을 새로 만듭니다.');

                    socket.join(room.roomId);

                    let croom = new database.RoomModel({
                        roomId: room.roomId,
                        roomTitle: room.roomId,
                        oneonone: false
                    })
                    croom.member.push(room.id);

                    croom.save(err => {
                        if (err) throw err
                    });
                    database.ListModel.findOne({email : room.userEmail}, function(err, list){
                        console.log("create에서진행해이자식아")
                        var channellist = addList(list, croom);
                        socket.emit('channellist', channellist);
                    });
                    console.dir('새로만든 방정보' + croom);
                }
            });
        } else if (room.command === 'message') {
            //******************chatbot 예제코드******************//
            console.log('message 이벤트를 받았습니다.');
            console.log('room객체알려주세요룸룸룸', room)
            if(room.oneonone == true)
            {
                var countNum;
                database.RoomModel.findOne({creater:room.roomId, receiver: room.name}, function(err, jroom){
                    if (err) throw err;
                    if (jroom) {
                        console.log("에듀미가봐야할내용이잖아")
                        console.log("확인해보자 chatCount : " + jroom.chatCount);
                        countNum = jroom.chatCount + 1;
                        jroom.chatCount = countNum;
                        console.log("증가 후 chatCount : " + jroom.chatCount);
                        jroom.save(err => {
                            if (err) throw err
                        });
                        console.log(socket.request.sessionID);
                        if (socket.request.sessionID) {
                            console.log('로그인되어 있음.');
                        } else {
                            console.log('로그인 안되어 있음');
                        }
                        let chat = new database.ChatModel({
                            name: room.name,
                            message: room.message,
                            email: room.email,
                            roomId: jroom.roomId,
                            chatCount: countNum
                        })
                        var message_time = `${chat.created.getHours()}:${("0" + chat.created.getMinutes()).slice(-2)}`;
                        chat.time = message_time;
                        // 데이터베이스에 저장
                        chat.save(err => {
                            if (err) throw err
                        })
                        console.log('쳌쳌쳌체셋쳇쳇쳇'+chat);
                        io.sockets.in(jroom.roomId).emit('message', chat);
                    }
                })
                database.RoomModel.findOne({creater:room.name, receiver: room.roomId}, function(err, jroom){
                    if (err) throw err;
                    if (jroom) {
                        if(jroom.chatCount == 0)
                        {
                            database.ListModel.findOne({email: jroom.receiverEmail}, function(err, oneononelist){
                                let croom = new database.RoomModel({
                                    roomTitle : jroom.creater
                                })
                                var channellist = addOne(oneononelist, croom);
                                /*login_ids.find({email: jroom.receiverEmail}, function(err, you){
                                    if(err) throw err
                                    if(you) {
                                        console.log('흠 이거 소켓아이디 하나 찾아서 따로 보낼거임')
                                        io.to(you.socketid).emit('oneononelist', channellist);
                                    }

                                })*/
                                var receiverSocket = login_ids.find(function(you){
                                    return you.email === jroom.receiverEmail
                                })
                                console.log("받는놈소켓아이디찾는다"+receiverSocket.socketId)
                                io.sockets.to(receiverSocket.socketId).emit('oneononelist', channellist);
                                //io.sockets.in(jroom.roomId).emit('oneononelist', channellist);
                            })
                        }
                        console.log("확인해보자 chatCount : " + jroom.chatCount);
                        countNum = jroom.chatCount + 1;
                        jroom.chatCount = countNum;
                        console.log("증가 후 chatCount : " + jroom.chatCount);
                        jroom.save(err => {
                            if (err) throw err
                        });
                        console.log(socket.request.sessionID);
                        if (socket.request.sessionID) {
                            console.log('로그인되어 있음.');
                        } else {
                            console.log('로그인 안되어 있음');
                        }
                        let chat = new database.ChatModel({
                            name: room.name,
                            message: room.message,
                            email: room.email,
                            roomId: jroom.roomId,
                            chatCount: countNum
                        })
                        var message_time = `${chat.created.getHours()}:${("0" + chat.created.getMinutes()).slice(-2)}`;
                        chat.time = message_time;
                        // 데이터베이스에 저장
                        chat.save(err => {
                            if (err) throw err
                        })
                        console.log(chat);
                        io.sockets.in(chat.roomId).emit('message', chat);
                    }
                })
            } else
            {

                var countNum;

                database.RoomModel.findOne({roomId:room.roomId}, function(err, croom){
                    if (err) throw err;
                    if (croom) {
                        console.log("확인해보자 chatCount : " + croom.chatCount);
                        countNum = croom.chatCount + 1;
                        croom.chatCount = countNum;
                        console.log("증가 후 chatCount : " + croom.chatCount);
                        croom.save(err => {
                            if (err) throw err
                        });
                        console.log(socket.request.sessionID);
                        if (socket.request.sessionID) {
                            console.log('로그인되어 있음.');
                        } else {
                            console.log('로그인 안되어 있음');
                        }
                        let chat = new database.ChatModel({
                            name: room.name,
                            message: room.message,
                            email: room.email,
                            roomId: room.roomId,
                            chatCount: countNum
                        })
                        var message_time = `${chat.created.getHours()}:${("0" + chat.created.getMinutes()).slice(-2)}`;
                        chat.time = message_time;
                        // 데이터베이스에 저장
                        chat.save(err => {
                            if (err) throw err
                        })
                        console.log(chat);
                        io.sockets.in(chat.roomId).emit('message', chat);
                    }
                })
            }


        } else if (room.command === 'join') {
            console.log(room.roomId + '에 입장합니다');
            if(room.oneonone)
            {
                database.RoomModel.findOne({creater: room.id, receiver: room.roomId}, function(err, joinRoom){
                    if (err) throw err;
                    if(joinRoom)
                    {
                        console.log("creater가 나야" + joinRoom.creater);
                        socket.join(joinRoom.roomId);
                        socket.emit('join', joinRoom);//추가
                        database.ChatModel.find({roomId : joinRoom.roomId}, function(err, premsg){
                            console.log('왜안뜨지');
                            if (err) throw err;
                            if (premsg) {
                                var fn = premsg.length
                                if(fn < 15)
                                {
                                    st = 0
                                } else {
                                    var st = fn - 15
                                }
                                console.log("fn : " + fn + ", st : " + st)
                                var premsg_slice = premsg.slice(st, fn)
                                console.log("프리메시지다 : " + premsg);
                                socket.emit('premsg', premsg);
                            } else {
                                console.log("아무것도없어");
                            }
                        });
                        database.RoomModel.findOne({roomId : joinRoom.roomId}, function(err, created_room){
                            if(created_room) {
                                console.dir("내가지금알고싶은거" + created_room)
                                if(!created_room.member.includes(room.id)){
                                    console.log("id가 없으므로 id 추가");
                                    created_room.member.push(room.id);
                                    created_room.memberJoinNum.push({'email':room.id, 'chatNum':created_room.chatCount})
                                    console.log("확인해보자$%#$%@#$%@")
                                    console.dir(created_room.memberJoinNum);
                                    io.sockets.in(created_room.roomId).emit('memberlist', created_room);
                                } else {
                                    console.log("id가 존재함");
                                }
                                created_room.save(err =>{
                                    if (err) throw err
                                });

                                console.log(created_room.member);
                                console.log("************멤버리스트 함 볼까요************" + created_room);
                                io.sockets.in(created_room.roomId).emit('memberlist', created_room);
                            }
                        });
                    } else
                    {
                        console.log("creater가 내가 아니네")
                        database.RoomModel.findOne({receiver: room.id, creater: room.roomId}, function(err, joinRoom2){
                            console.log("creater가 너야" + joinRoom2.creater)
                            socket.join(joinRoom2.roomId);
                            socket.emit('join', joinRoom2);
                            database.ChatModel.find({roomId : joinRoom2.roomId}, function(err, premsg){

                                if (err) throw err;
                                if (premsg) {
                                    var fn = premsg.length
                                    if(fn < 15)
                                    {
                                        st = 0
                                    } else {
                                        var st = fn - 15
                                    }
                                    console.log("fn : " + fn + ", st : " + st)
                                    var premsg_slice = premsg.slice(st, fn)
                                    console.log("프리메시지다 : " + premsg);
                                    socket.emit('premsg', premsg);
                                } else {
                                    console.log("아무것도없어");
                                }
                            });
                            database.RoomModel.findOne({roomId : joinRoom2.roomId}, function(err, created_room){
                                if(created_room) {
                                    console.dir("내가지금알고싶은거" + created_room)
                                    if(!created_room.member.includes(room.id)){
                                        console.log("id가 없으므로 id 추가");
                                        created_room.member.push(room.id);
                                        created_room.memberJoinNum.push({'email':room.id, 'chatNum':created_room.chatCount})
                                        console.log("확인해보자$%#$%@#$%@")
                                        console.dir(created_room.memberJoinNum);
                                        io.sockets.in(created_room.roomId).emit('memberlist', created_room);
                                    } else {
                                        console.log("id가 존재함");
                                    }
                                    created_room.save(err =>{
                                        if (err) throw err
                                    });

                                    console.log(created_room.member);
                                    console.log("************멤버리스트 함 볼까요************" + created_room);
                                    io.sockets.in(created_room.roomId).emit('memberlist', created_room);
                                }
                            });
                        });
                    }
                });
            } else
            {
                console.log("그룹채팅방에 입장함시바려나")
                socket.join(room.roomId);
                database.ChatModel.find({roomId : room.roomId}, function(err, premsg){

                    if (err) throw err;
                    if (premsg) {
                        var fn = premsg.length
                        if(fn < 15)
                        {
                            st = 0
                        } else {
                            var st = fn - 15
                        }
                        console.log("fn : " + fn + ", st : " + st)
                        var premsg_slice = premsg.slice(st, fn)
                        console.log("프리메시지다 : " + premsg);
                        socket.emit('premsg', premsg);
                    } else {
                        console.log("아무것도없어");
                    }
                });
                database.RoomModel.findOne({roomId : room.roomId}, function(err, created_room){
                    if(created_room) {
                        console.dir("내가지금알고싶은거" + created_room)
                        if(!created_room.member.includes(room.id)){
                            console.log("id가 없으므로 id 추가");
                            created_room.member.push(room.id);
                            created_room.memberJoinNum.push({'email':room.id, 'chatNum':created_room.chatCount})
                            console.log("확인해보자$%#$%@#$%@")
                            console.dir(created_room.memberJoinNum);
                            io.sockets.in(created_room.roomId).emit('memberlist', created_room);
                        } else {
                            console.log("id가 존재함");
                        }
                        created_room.save(err =>{
                            if (err) throw err
                        });
                        database.ListModel.findOne({email : room.userEmail}, function(err, list){
                            console.log("join에서진행해이자식아")
                            var channellist = addList(list, created_room);
                            console.log("list뭐니" + channellist)
                        });


                        console.log(created_room.member);
                        console.log("************멤버리스트 함 볼까요************" + created_room);
                        io.sockets.in(created_room.roomId).emit('memberlist', created_room);
                    }
                });
            }





        } else if (room.command === 'leave') {

        } else if (room.command === 'loadmsg'){
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
            database.ChatModel.find({roomId : room.roomId}, function(err, loadmsg){
                if (err) throw err;
                if (loadmsg) {
                    var fn = loadmsg.length - loadCount;
                    if(fn < 0)
                    {
                        console.log("저장된 msg길이보다 넘어온 길이가 더 큽니다.")
                    } else if(fn == 0) {
                        console.log("끝에 도달했습니다.")
                    } else if(fn < 15) {
                        st = 0
                        console.log("fn : " + fn + ", st : " + st)
                        var premsg_slice = loadmsg.slice(st, fn)
                    } else {
                        var st = fn - 15
                        console.log("fn : " + fn + ", st : " + st)
                        var premsg_slice = loadmsg.slice(st, fn)
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
}

function addList(list, croom) {
    if (list) {
        var newArr = list.roomIds.filter(function(data){
            return data.text === croom.roomTitle;
        })
        if(newArr.length>0){
            console.log("list의 roomids에" + croom.roomTitle + "가 이미 존재합니다.")
        } else {
            console.log("list의 roomids에" + croom.roomTitle + "를 추가합니다.")
            list.roomIds.push({"text":croom.roomTitle});
            list.save(err => {
                if (err) throw err
            });
        }
    }
    return list;
}

function addOne(list, croom) {
    if (list) {
        var newArr = list.oneonones.filter(function(data){
            return data.text === croom.roomTitle;
        })
        if(newArr.length>0){
            console.log("list의 oneonones에" + croom.roomTitle + "가 이미 존재합니다.")
        } else {
            console.log("list의 oneonones에" + croom.roomTitle + "를 추가합니다.")
            list.oneonones.push({"text":croom.roomTitle});
            list.save(err => {
                if (err) throw err
            });
        }
    }
    return list;
}