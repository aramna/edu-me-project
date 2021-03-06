'use strict';

var Schema = {};

//계정 스키마 정의
Schema.createSchema = function (mongoose) {

    var ChatSchema = mongoose.Schema({

        email: String,
        name: String,
        message: String,
        created: { type: Date, default: Date.now },
        roomId: String,
        chatCount: Number,
        time: String
    });

    ChatSchema.static('findAll', function (callback) {
        return this.find({}, callback);
    });

    return ChatSchema;
};

module.exports = Schema;