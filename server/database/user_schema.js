import bcrypt from 'bcryptjs';

const Schema = {};


//계정 스키마 정의
Schema.createSchema = function(mongoose){

    var UserSchema = mongoose.Schema({
        username: String,
        email: String,
        password: String,
        created: {type: Date, default: Date.now}
    })

    // password 비교 함수
    UserSchema.methods.validateHash = function (password) {
        console.log('암호 비교함')
        return bcrypt.compareSync(password, this.password);
    };

    // password 암호화 함수
    UserSchema.methods.generateHash = function (password) {
        console.log('암호화 동작함')
        return bcrypt.hashSync(password, 8);
    };
    return UserSchema;
};

module.exports = Schema;