'use strict';

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var database = {};

database.init = function (app, config) {
    console.log('database 초기화');

    connect(app, config);
};

function connect(app, config) {
    console.log('connect 함수 호출됨');
    _mongoose2.default.Promise = global.Promise;

    _mongoose2.default.connect(config.db_url);

    database.db = _mongoose2.default.connection;

    database.db.on('error', console.error);
    database.db.once('open', function () {
        console.log('데이터베이스 서버에 연결됨');
        createSchema(app, config);
    });

    database.db.on('disconnected', connect);
}

// config에 정의된 스키마 및 모델 객체 생성
function createSchema(app, config) {
    var schemaLen = config.db_schemas.length;
    console.log('설정에 정의된 스키마의 수 : %d', schemaLen);

    for (var i = 0; i < schemaLen; i++) {
        var curItem = config.db_schemas[i];

        // 모듈 파일에서 모듈 불러온 후 createSchema() 함수 호출하기
        var curSchema = require(curItem.file).createSchema(_mongoose2.default);
        console.log('%s 모듈을 불러들인 후 스키마 정의함.', curItem.file);

        // User 모델 정의
        var curModel = _mongoose2.default.model(curItem.collection, curSchema);
        console.log('%s 컬렉션을 위해 모델 정의함.', curItem.collection);

        // database 객체에 속성으로 추가
        database[curItem.schemaName] = curSchema;
        database[curItem.modelName] = curModel;
        console.log('스키마 이름 [%s], 모델 이름 [%s] 이 database 객체의 속성으로 추가됨.', curItem.schemaName, curItem.modelName);
    }

    app.set('database', database);
    console.log('database 객체가 app 객체의 속성으로 추가됨.');
}

module.exports = database;