module.exports = {
    server_port: 3000,
    devServer_port: 4000,
    db_url: 'mongodb://localhost/edume',
    db_schemas: [
        {file:'./user_schema', collection:'Users', schemaName:'UserSchema', modelName:'UserModel'},
        {file:'./chat_schema', collection:'Chats', schemaName:'ChatSchema', modelName:'ChatModel'},
        {file:'./channel_schema', collection:'Channel', schemaName:'ChannelSchema', modelName:'ChannelModel'}
    ],
    route_info: [
    ]
}
