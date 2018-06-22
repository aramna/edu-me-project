module.exports = {
    server_port: 3000,
    devServer_port: 3000,

    db_url: 'mongodb://dydcks5:c1w1s1c1!!@ds018168.mlab.com:18168/oz',
    db_schemas: [
        {file:'./schema/user_schema', collection:'Users', schemaName:'UserSchema', modelName:'UserModel'},
        {file:'./schema/chat_schema', collection:'Chats', schemaName:'ChatSchema', modelName:'ChatModel'},
        {file:'./schema/room_schema', collection:'Room', schemaName:'RoomSchema', modelName:'RoomModel'},
        {file:'./schema/list_schema', collection:'List', schemaName:'ListSchema', modelName:'ListModel'},
        {file:'./schema/bot_schema', collection:'Bot', schemaName:'BotSchema', modelName:'BotModel'}
    ],
    route_info: [
    ]
}
