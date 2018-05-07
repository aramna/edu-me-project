const Schema = {};


//계정 스키마 정의
Schema.createSchema = function(mongoose){

    var RoomSchema = mongoose.Schema({

        roomId: String,
        member: [],
        chatCount: {type:Number, default:0},
        memberJoinNum: []
    })

    RoomSchema.static('findAll', function(callback) {
        return this.find({}, callback);
    })

    return RoomSchema;
};



module.exports = Schema;