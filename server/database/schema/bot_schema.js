const Schema = {};


//계정 스키마 정의
Schema.createSchema = function(mongoose){

    var BotSchema = mongoose.Schema({
        name: String,
        state: String,
        sendReceiver: {type:Object, default:null},
        receiverName: String,
        nick: [],
        check: [],
        order: [],
        choiceNum: []
    })

    BotSchema.static('findAll', function(callback) {
        return this.find({}, callback);
    })

    return BotSchema;
};


module.exports = Schema;