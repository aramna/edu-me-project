import database from '../database/database'

module.exports = function(socket) {
    var io = require('../edume-server').io;

    var login_ids = {};
    var saveMsg = [];
    var memberlist = [];

    console.log('connection info :', socket.request.connection._peername);

    socket.remoteAddress = socket.request.connection._peername.address;
    socket.remotePort = socket.request.connection._peername.port;

    //'login' 이벤트를 받았을 떄의 처리
    socket.on('login', function(login){
        console.log('login 이벤트를 받았습니다.');
        console.dir(login);
        //메세지 저장하기
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
        });

        //멤버 리스트 띄우기
        /*database.UserModel.findAll(function(err, results){
            if (err) throw err

            if(results) {
                for (var i = 0; i < results.length; i++) {
                    memberlist.push(results[i]._doc.username);
                }
            }
        })*/

        //기존 클라이언트 ID가 없으면 클라이언트 ID를 맵에 추가
        console.log('접속한 소켓의 ID : ' + socket.id);
        login_ids[login.id] = socket.id;
        socket.login_id = login.id;

        console.log('접속한 클라이언트 ID 갯수 : %d', Object.keys(login_ids).length);

        // 응답 메시지 전송
        sendResponse(socket, 'login', '200', '로그인되었습니다.');

        //io.sockets.emit('message', saveMsg);
    });

    // 'message' 이벤트를 받았을 때의 처리
    socket.on('message', function(message) {
    	console.log('message 이벤트를 받았습니다.');

        // session
        console.log('===== 세션 확인 =====');
        console.log(socket.request.session);

        if (socket.request.sessionID) {
            console.log('로그인되어 있음.');
        } else {
            console.log('로그인 안되어 있음');
        }

        let chat = new database.ChatModel({
            name: message.name,
            message: message.message
        })
        // 데이터베이스에 저장
        chat.save(err => {
            if (err) throw err
        })

        console.log(chat);
        io.sockets.emit('message', message);
    });

    /*socket.on('room', function(room){
        console.log('room 이벤트를 받았습니다.');

        if(room.command == 'create') {

            if (io.sockets.adapter.rooms[room.roomId]) {
                console.log('방이 이미 만들어져 있습니다.');

            } else {
                console.log('방을 새로 만듭니다.');

                socket.join(room.roomId);

                var curRoom = io.sockets.adapter.rooms[room.roomId];
                curRoom.id = room.roomId;
                curRoom.name = room.roomName;
                curRoom.owner = room.roomOwner;
            }
        }
        var roomList = getRoomLish();

        var output = {command:'list', rooms:roomList};

        io.sockets.emit('room', output);
    });*/
}

function getRoomList() {
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

// 응답 메시지 전송 메소드
function sendResponse(socket, command, code, message) {

	var statusObj = {command: command, code: code, message: message};
	socket.emit('response', statusObj);
}

