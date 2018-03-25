import database from '../database/database'
const userlist = [];

module.exports = function(socket) {
    var io = require('../edume-server').io;
    const login_ids = {};

    var saveMsg = [];
    //var userlist = [];
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
//메인방이 데베저장되어야함 만약 데베에 roomId = 'main'이 없다면 생성

        database.RoomModel.findOne({roomId : login.roomId}, function(err, room){

            if (room){
                console.log(login.roomId + "방에 입장합니다.");
                socket.join(login.roomId);
                if(!room.member.includes(login.id)){
                   console.log("id가 없으므로 id 추가");
                    room.member.push(login.id);
                    userlist.push(login.id);
                   } else {
                       console.log("id가 존재함");
                   }
                room.save(err =>{
                    if (err) throw err
                });
                console.log(room.member);
            } else {
                console.log("main방을 생성합니다.");
                let room = new database.RoomModel({
                    roomId : login.roomId,
                    member : []
                });

                room.member.push(login.id);
                userlist.push(login.id);

                room.save(err =>{
                    if (err) throw err
                });

                console.log(room.member);

            socket.join(login.roomId);
            }
        });

        console.log(userlist);
        socket.emit('login', userlist);
        // database.ChatModel.findAll(function(err, results) {
        //     if(err) throw err
        //
        //     if(results) {
        //         for (var i = 0; i < results.length; i++) {
        //             if(results[i].email === login.userEmail){
        //                 saveMsg.push(results[i]._doc);
        //             }
        //         }
        //     }
        //     io.sockets.emit('preload', saveMsg) // saveMsg 내보내기
        // });

        //기존 클라이언트 ID가 없으면 클라이언트 ID를 맵에 추가
        console.log('접속한 소켓의 ID : ' + socket.id);
        login_ids[login.id] = socket.id;
        socket.login_id = login.id;
        console.log(login_ids)
        console.log('접속한 클라이언트 ID 갯수 : %d', Object.keys(login_ids).length);

       //기본적인 룸에 입장

        console.log('login.roomId는 ' + login.roomId)

        //var curRoom = //io.sockets.adapter.rooms[login.roomId];
        //curRoom.id = login.roomId;
        //var roomList = getRoomList(io);

        //var output = {command:'list', rooms:roomList};

        //io.sockets.emit('login', output);
    });

    socket.on('logout', function() {
        console.log('로그아웃 합니다.');
        var i = sockets.indexOf(socket);
		sockets.splice(i, 1);
    });

    socket.on('room', function(room) {
        console.log('room 이벤트를 받았습니다.')
        /*var cuRoom = Object.keys(io.sockets.adapter.sids[socket.id]).length-1;
        var currentRoom = socket.rooms[Object.keys(socket.rooms)[cuRoom]];

        var a = Object.keys(io.sockets.adapter.sids[socket.id])
        console.log("알고싶은거" + a);

        room.roomId = currentRoom;*/

        console.dir(room);

        if(room.command === 'create') {

            database.RoomModel.findOne({roomId : room.roomId}, function(err, created_room){

            if (created_room){
                console.log(created_room.roomId + "방에 입장합니다.");
                socket.join(created_room.roomId);

                if(!created_room.member.includes(room.id)){
                    console.log("id가 없으므로 id 추가");
                    created_room.member.push(room.id);
                } else {
                    console.log("id가 존재함");
                }
                created_room.save(err =>{
                    if (err) throw err
                });
                console.log(created_room.member);

                var curRoom = io.sockets.adapter.rooms[room.roomId];
                curRoom.id = room.roomId;
                curRoom.name = room.roomName;

                //현재 방정보 저장
                /*socket.set('curRoom', function(err, curRoom){
                    if(err) throw err;
                    if(curroom){

                        }
                })*/

            } else {
                console.log(room.roomId + '방을 새로 만듭니다.');

                socket.join(room.roomId);

                var curRoom = io.sockets.adapter.rooms[room.roomId];
                curRoom.id = room.roomId;
                curRoom.name = room.roomName;

                console.dir(curRoom);

                let croom = new database.RoomModel({
                    roomId: curRoom.id,
                })
                croom.member.push(room.id);

                croom.save(err => {
                    if (err) throw err
                    })

                console.log(croom);
            }
            });

        } else if (room.command === 'message') {
            console.log('message 이벤트를 받았습니다.');

            console.log(socket.request.sessionID);
            if (socket.request.sessionID) {

                console.log('로그인되어 있음.');
            } else {
                console.log('로그인 안되어 있음');
            }

            let chat = new database.ChatModel({
                name: room.name,
                message: room.message,
                //email: message.email,
                roomId: room.roomId
            })
            // 데이터베이스에 저장
            chat.save(err => {
                if (err) throw err
            })

            var message_time = `${chat.created.getHours()}:${("0" + chat.created.getMinutes()).slice(-2)}`;

            var output = {
                name: chat.name,
                message: chat.message,
                time: message_time,
                roomId: chat.roomId
            }

            console.log(output);
            io.sockets.in(chat.roomId).emit('message', output);

        } else if (room.command === 'join') {

            socket.join(room.roomId);
        } else if (room.command === 'leave') {

        } else if (room.command === 'search'){

        }
    });
}

function getRoomList(io) {

    var roomList = [];

    Object.keys(io.sockets.adapter.rooms).forEach(function(roomId) { // for each room
    	console.log('current room id : ' + roomId);
    	var outRoom = io.sockets.adapter.rooms[roomId];

    	// find default room using all attributes
    	var foundDefault = false;
    	var index = 0;
        Object.keys(outRoom.sockets).forEach(function(key) {
        	console.log('#' + index + ' : ' + key + ', ' + outRoom.sockets[key]);

        	if (roomId == key) {  // default room
        		foundDefault = true;
        		console.log('this is default room.');
        	}
        	index++;
        });

        if (!foundDefault) {
        	roomList.push(outRoom);
        }
    });

    console.log('[ROOM LIST]');
    console.dir(roomList);

    return roomList;
}
