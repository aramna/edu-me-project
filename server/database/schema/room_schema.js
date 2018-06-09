const Schema = {};


//계정 스키마 정의
Schema.createSchema = function(mongoose){

    var RoomSchema = mongoose.Schema({

        roomId: String,
        member: [],
        chatCount: {type:Number, default:0},
        memberJoinNum: [],
        roomTitle: String,
        creater: String,
        receiver: String,
        receiverEmail: String,
        oneonone: Boolean,
        messageNum: {type:Number, default:0}//총 메시지 갯수
    })

    RoomSchema.static('findAll', function(callback) {
        return this.find({}, callback);
    })

    return RoomSchema;
};


module.exports = Schema;
