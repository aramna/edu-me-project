module.exports = {
    server_port: 3000,
    devServer_port: 4000,
    db_url: 'mongodb://localhost/edume',
    db_schemas: [
        {file:'./user_schema', collection:'Users', schemaName:'UserSchema', modelName:'UserModel'},
        {file:'./chat_schema', collection:'Chats', schemaName:'ChatSchema', modelName:'ChatModel'},
        {file:'./room_schema', collection:'Room', schemaName:'RoomSchema', modelName:'RoomModel'},
        {file:'./user_in_rooms', collection:'User_in_Room', schemaName:'UserRoomSchema', modelName:'UserRoomModel'}
    ],
    route_info: [
    ]
}
