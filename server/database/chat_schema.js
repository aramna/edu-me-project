const Schema = {};


//계정 스키마 정의
Schema.createSchema = function(mongoose){

    var ChatSchema = mongoose.Schema({
        name: String,
        message: String,
        created: {type: Date, default: Date.now}
    })

    return ChatSchema;
};

module.exports = Schema;
