var io = require('../edume-server').io;
var socket = require('socket.io');

module.exports = function(socket){

    var login_ids = {};

    console.log('connection info :', socket.request.connection._peername);

    socket.remoteAddress = socket.request.connection._peername.address;
    socket.remotePort = socket.request.connection._peername.port;

    //'login' 이벤트를 받았을 떄의 처리
    socket.on('login', function(login){
        console.log('login 이벤트를 받았습니다.');
        console.dir(login);

        // 로그인세션은 요청패스를 통해 웹 인증

        //기존 클라이언트 ID가 없으면 클라이언트 ID를 맵에 추가
        console.log('접속한 소켓의 ID : ' + socket.id);
        login_ids[login.id] = socket.id;
        socket.login_id = login.id;

        console.log('접속한 클라이언트 ID 갯수 : %d', Object.keys(login_ids).length);

        // 응답 메시지 전송
        sendResponse(socket, 'login', '200', '로그인되었습니다.');
    });


    // 'message' 이벤트를 받았을 때의 처리
    socket.on('message', function(message) {
    	console.log('message 이벤트를 받았습니다.');
    	console.dir(message);


        // session
        console.log('===== 세션 확인 =====');
        console.log(socket.request.session);

        if (socket.request.session.passport.user) {
            console.log('로그인되어 있음.');
        } else {
            console.log('로그인 안되어 있음');
        }


        if (message.recepient =='groupchat') {
            // 나를 포함한 모든 클라이언트에게 메시지 전달
        	console.dir('나를 포함한 모든 클라이언트에게 message 이벤트를 전송합니다.')
            io.sockets.emit('message', message);
        } else {
        	// command 속성으로 일대일 채팅과 그룹채팅 구분
        	if (message.command == 'chat') {
	        	// 일대일 채팅 대상에게 메시지 전달
	        	if (login_ids[message.recepient]) {
	        		io.sockets.connected[login_ids[message.recepient]].emit('message', message);

	        		// 응답 메시지 전송
	                sendResponse(socket, 'message', '200', '메시지를 전송했습니다.');
	        	} else {
	        		// 응답 메시지 전송
	                sendResponse(socket, 'login', '404', '상대방의 로그인 ID를 찾을 수 없습니다.');
	        	}
        	} else if (message.command == 'groupchat') {
	        	// 방에 들어있는 모든 사용자에게 메시지 전달
	        	io.sockets.in(message.recepient).emit('message', message);

	        	// 응답 메시지 전송
	            sendResponse(socket, 'message', '200', '방 [' + message.recepient + ']의 모든 사용자들에게 메시지를 전송했습니다.');
        	}
        }
    });
}

// 응답 메시지 전송 메소드
function sendResponse(socket, command, code, message) {
	var statusObj = {command: command, code: code, message: message};
	socket.emit('response', statusObj);
}
