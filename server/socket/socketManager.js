import database from '../database/database'
import bayes from 'bayes'
import fs from 'fs'

//const users = {socketId: String, email: String};

module.exports = function(socket) {
    var io = require('../edume-server').io;
    const login_ids = [];

    var saveMsg = [];
    var rooms = [];

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
                        oneonone: true
                    })
                    croom.member.push(oneonone.creater);
                    croom.member.push(oneonone.receiver);

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
        } else if (oneonone.command === 'message') {

            console.log('일대일 message 이벤트를 받았습니다.');
            //var receiver = Object.keys(login_ids).
            var countNum;
            database.RoomModel.findOne({creater: oneonone.creater, receiver: oneonone.receiver}, function(err, croom){

                if (err) throw err;
                if (croom) {
                    if(croom.chatCount == 0)
                    {
                        database.ListModel.findOne({email : oneonone.receiverEmail}, function(err, list){
                            console.log("첫메시지라 상대방한테 소켓발생시킬꺼야")
                            //방제
                            croom.roomTitle = oneonone.creater;
                            var channellist = addOne(list, croom);
                            socket.broadcast.to(croom.roomId).emit('oneononelist', channellist);
                        });
                        //방생성 알림 list
                    }
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
                        name: oneonone.name,
                        message: oneonone.message,
                        email: oneonone.email,
                        roomId: oneonone.roomId,
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
        } else if (oneonone.command === 'join')
        {

        }
    })

    socket.on('transcript', function(chatbot){
        console.log(chatbot);
        database.BotModel.findOne({name : chatbot.email}, function(err, bot){
            console.log("봇 객체 = " + bot);
            console.log("봇 상태 = " + bot.state);
            if(bot.state == 'general')
            {
                console.log("쳇봇을 실행시킵니다.");
                //베이지안 알고리즘으로 텍스트분석
                var classifier = bayes({
                    tokenizer: function(text) { return text.split(' ')}
                })
                const article = fs.readFileSync("C:/test/test.txt");
                var lineArray = article.toString();
                var line = lineArray.split('\r\n');

                for(var i in line){
                    var s = line[i].split(",");
                    classifier.learn(s[0], s[1]);
                }
                var category = classifier.categorize(chatbot.transcript);
                console.log("category - " + category);

                //봇 상태 update
                var contents = category;
                if(category == 'send')
                {
                    contents = '뭐라고 보낼까?';
                    bot.state = category;
                    bot.save(err => {
                        if(err) throw err
                        console.log("Bot의 state가 " +bot.state+ "로 update되었습니다.");
                    })
                }
                io.sockets.emit(bot.state, bot);
                chatbot.state = category;
                console.log(chatbot);

            } else if(bot.state == 'send')
            {
                let chat = new database.ChatModel({
                    name: chatbot.name,
                    message: chatbot.transcript,
                    email: chatbot.email,
                    roomId: '안영민에듀미'
                })

                var message_time = `${chat.created.getHours()}:${("0" + chat.created.getMinutes()).slice(-2)}`;
                chat.time = message_time;

                // 데이터베이스에 저장
                chat.save(err => {
                    if (err) throw err
                })
                io.sockets.emit('message', chat);

                chatbot.state = category;
                console.log(bot);

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
            var countNum;

            database.RoomModel.findOne({roomId:room.roomId, oneonone: false}, function(err, croom){
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
        } else if (room.command === 'join') {
            console.log(room.roomId + '에 입장합니다');
            if(room.oneonone)
            {
                database.RoomModel.findOne({creater: room.id, receiver: room.roomId}, function(err, joinRoom){
                    if (err) throw err;
                    if(joinRoom)
                    {
                        socket.join(joinRoom.roomId);
                    } else
                    {
                        database.RoomModel.findOne({receiver: room.id, creater: room.roomId}, function(err, joinRoom2){
                            socket.join(joinRoom2);
                        });
                    }
                });
            } else
            {
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