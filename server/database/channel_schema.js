const Schema = {};


//계정 스키마 정의
Schema.createSchema = function(mongoose){

    var ChannelSchema = mongoose.Schema({

        roomId: String,
        roomName: String,
        member: []
    })

    ChannelSchema.static('findAll', function(callback) {
        return this.find({}, callback);
    })

    return ChannelSchema;
};


module.exports = Schema;

