const Schema = {};


//계정 스키마 정의
Schema.createSchema = function(mongoose){

    var BotSchema = mongoose.Schema({
        name: String,
        state: String

    })

    BotSchema.static('findAll', function(callback) {
        return this.find({}, callback);
    })

    return BotSchema;
};


module.exports = Schema;
