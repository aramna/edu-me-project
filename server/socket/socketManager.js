import database from '../database/database'

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
                console.log(fn +"fn, st" + st )
                var premsg_slice = premsg.slice(st, fn)
                console.log("프리메시지다 : " + premsg_slice);
                socket.emit('premsg', premsg_slice);
            } else {
                console.log("아무것도없어");
            }
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
        } else if (room.command === 'join') {
            console.log(room.roomId + '에 입장합니다');
            socket.join(room.roomId);
            database.ChatModel.find({roomId : room.roomId}, function(err, premsg){
                console.log("%%%%%%%%%%%%" + premsg)
                if (err) throw err;
                if (premsg) {
                    var fn = premsg.length
                    if(fn < 15)
                    {
                        st = 0
                    } else {
                        var st = fn - 15
                    }
                    console.log(fn +"fn, st" + st )
                    var premsg_slice = premsg.slice(st, fn)
                    console.log("프리메시지다 : " + premsg_slice);
                    socket.emit('premsg', premsg_slice);
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
            database.ChatModel.find({roomId : room.roomId}, function(err, loadmsg){
                if (err) throw err;
                if (loadmsg) {
                    console.log("로드메시지다 : " + loadmsg);
                    socket.emit('loadmsg', loadmsg);
                } else {
                    console.log("아무것도없어");
                }

            });
        }
        console.dir(room);
    });
}

function addMember(room) {

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
