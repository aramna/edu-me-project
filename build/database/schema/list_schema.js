'use strict';

var Schema = {};

//계정 스키마 정의
Schema.createSchema = function (mongoose) {

    var ListSchema = mongoose.Schema({

        email: String,
        roomIds: [],
        oneonones: []
    });

    ListSchema.static('findAll', function (callback) {
        return this.find({}, callback);
    });

    return ListSchema;
};

module.exports = Schema;