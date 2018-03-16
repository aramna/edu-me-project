import database from '../database/database'
const userMember = [];

module.exports = function(socket) {
    var io = require('../edume-server').io;
    const login_ids = {};

    var saveMsg = [];
    var userlist = [];
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

        // session
        console.log('===== 세션 확인 =====');
        console.log(socket.request.session);

        if (socket.request.sessionID) {

            console.log('로그인되어 있음.');
        } else {
            console.log('로그인 안되어 있음');
        }

       //기본적인 룸에 입장
        socket.join(login.roomId)
        console.log('login.roomId는 ' + login.roomId)

        var curRoom = io.sockets.adapter.rooms[login.roomId];
        curRoom.id = login.roomId;
        console.log(curRoom);

        userMember.push(login.userName);
        curRoom.member = [];
        curRoom.member = userMember;
        console.dir(curRoom);
        var roomList = getRoomList(io);

        var output = {command:'list', rooms:roomList};

        io.sockets.emit('userList', output);
    });

    // 'message' 이벤트를 받았을 때의 처리
    socket.on('message', function(message) {
    	console.log('message 이벤트를 받았습니다.');

        let chat = new database.ChatModel({
            name: message.name,
            message: message.message,
            email: message.email,
            // 시간 추가
            time: message.time

        })
        // 데이터베이스에 저장
        chat.save(err => {
            if (err) throw err
        })

        console.log(chat);
        io.sockets.emit('message', message);
    });

    socket.on('room', function(room) {
        console.log('room 이벤트를 받았습니다.')



        /*
        let room = new database.ChannelModel({
            name: curRoom.id,
            member: curRoom.member
        })
        // 데이터베이스에 저장
        room.save(err => {
            if (err) throw err
        })*/
    });
}

function getRoomList(io) {
	console.dir(io.sockets.adapter.rooms);

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

/*//메세지 저장하기
        database.ChatModel.findAll(function(err, results) {
            if(err) throw err

            if(results) {
                for (var i = 0; i < results.length; i++) {
                    if(results[i].email === login.userEmail){
                        saveMsg.push(results[i]._doc);
                    }
                }
            }
            io.sockets.emit('preload', saveMsg) // saveMsg 내보내기
        });*/
