const Schema = {};


//계정 스키마 정의
Schema.createSchema = function(mongoose){

    var UserRoomSchema = mongoose.Schema({

        roomId: String,
        inRooms: []
    })

    UserRoomSchema.static('findAll', function(callback) {
        return this.find({}, callback);
    })

    return UserRoomSchema;
};

module.exports = Schema;

