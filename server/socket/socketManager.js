import database from '../database/database'
import bayes from 'bayes'
import fs from 'fs'

module.exports = function(socket) {
    var io = require('../edume-server').io;
    const login_ids = {};

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
                    member : []
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
        login_ids[login.id] = socket.id;
        socket.login_id = login.id;
        console.log(login_ids)
        console.log('접속한 클라이언트 ID 갯수 : %d', Object.keys(login_ids).length);

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

    socket.on('logout', function() {
        console.log('로그아웃 합니다.');
        var i = sockets.indexOf(socket);
        sockets.splice(i, 1);
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
                        roomId: room.roomId
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

            if(room.roomId == 'chat') {
                console.log("챗봇쪽 코드 실행됨");
                database.BotModel.findOne({name : room.email}, function(err, bot){
                    console.log("봇 객체 = " + bot);
                    console.log("봇 상태 = " + bot.state);
                    if(bot.state == 'general')
                    {
                        console.log("쳇봇을 실행시킵니다.");
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
                        var category = classifier.categorize(room.message);
                        console.log("category - " + category);
                        let chat = new database.ChatModel({
                            name: room.name,
                            message: room.message,
                            email: room.email,
                            roomId: room.roomId
                        })
                        var message_time = `${chat.created.getHours()}:${("0" + chat.created.getMinutes()).slice(-2)}`;

                        chat.time = message_time;

                            // 데이터베이스에 저장
                        chat.save(err => {
                            if (err) throw err
                        })

                        console.log(chat);
                        io.sockets.emit('message', chat);

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
                        let chatbot = new database.ChatModel({
                            name: "chatbot",
                            message: contents,
                            email: "chatbot@naver.com",
                            roomId: room.roomId
                            })

                        var message_time2 = `${chatbot.created.getHours()}:${("0" + chatbot.created.getMinutes()).slice(-2)}`;

                        chatbot.time = message_time2;

                            // 데이터베이스에 저장
                        chatbot.save(err => {
                            if (err) throw err
                        })
                        chatbot.state = category;
                        console.log(chatbot);
                        io.sockets.emit('message', chatbot);

                    } else if(bot.state == 'send')
                    {
                        let chat = new database.ChatModel({
                            name: room.name,
                            message: room.message,
                            email: room.email,
                            roomId: room.roomId
                        })

                        var message_time = `${chat.created.getHours()}:${("0" + chat.created.getMinutes()).slice(-2)}`;

                        chat.time = message_time;

                            // 데이터베이스에 저장
                        chat.save(err => {
                            if (err) throw err
                        })
                        io.sockets.emit('message', chat);

                        let chatbot = new database.ChatModel({
                            name: "chatbot",
                            message: room.message,
                            email: "chatbot@naver.com",
                            roomId: room.roomId
                            })

                        var message_time = `${chatbot.created.getHours()}:${("0" + chatbot.created.getMinutes()).slice(-2)}`;

                        chatbot.time = message_time;

                            // 데이터베이스에 저장
                        chatbot.save(err => {
                            if (err) throw err
                        })
                        chatbot.state = category;
                        console.log(bot);
                        io.sockets.emit('message', chatbot);
                        bot.state = 'general';
                        bot.save(err => {
                            if(err) throw err;
                        });
                        console.log("전송성공 후 Bot의 state " + bot.state);
                    }
                })

                //******************chatbot 예제코드******************//
            } else {
                console.log('message 이벤트를 받았습니다.');
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
            return data.text === croom.roomId;
        })
        if(newArr.length>0){
            console.log("list의 roomids에" + croom.roomId + "가 이미 존재합니다.")
        } else {
            console.log("list의 roomids에" + croom.roomId + "를 추가합니다.")
            list.roomIds.push({"text":croom.roomId});
            list.save(err => {
                if (err) throw err
            });
        }
    }
    return list;
}
