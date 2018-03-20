import database from '../database/database'

module.exports = function(socket){

    var io = require('../edume-server').io;

    var login_ids = {};
    var saveMsg = [];
    console.log('connection info :', socket.request.connection._peername);

    socket.remoteAddress = socket.request.connection._peername.address;
    socket.remotePort = socket.request.connection._peername.port;

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

        console.log('접속한 클라이언트 ID 갯수 : %d', Object.keys(login_ids).length);

        // 응답 메시지 전송
        sendResponse(socket, 'login', '200', '로그인되었습니다.');

    });

    // 'message' 이벤트를 받았을 때의 처리
    socket.on('message', function(message) {
        console.log('message 이벤트를 받았습니다.');

        // session
        console.log('===== 세션 확인 =====');

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
}

// 응답 메시지 전송 메소드
function sendResponse(socket, command, code, message) {
    var statusObj = {command: command, code: code, message: message};
    socket.emit('response', statusObj);
}