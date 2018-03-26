import React from 'react';
import socketio from 'socket.io-client';
import {connect} from 'react-redux';
import Store from './Store';
import {OrderedMap} from 'immutable';
import _ from 'lodash';
import {ObjectID} from '../helpers/objectid';
import SearchUser from '../components/search-user';
import {
    Button,
    Rail,
    Sticky,
    Container,
    Divider,
    Grid,
    Header,
    Icon,
    Input,
    Image,
    List,
    Menu,
    Responsive,
    Segment,
    Sidebar,
    Visibility,
    Comment,
} from 'semantic-ui-react';
//import {SideBar} from 'components'
import {Message, MessageText, MessageGroup, MessageList, Row, Avatar} from '@livechat/ui-kit';
import {ChatFeed} from 'react-chat-ui';
import '../index.css';
var i = 0 ;
const getTime = (date) => {
    return `${date.getHours()}:${("0"+date.getMinutes()).slice(-2)}`;
};

class ChatContainer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
          //  logs: [],
          //  message: '',
          //  userEmail: '',
            Store: new Store(),
            newMessage: '메시지TEST초기값',
            searchUser: "",
          //  messages: [], //추가
        };
        this.addTestMessages = this.addTestMessages.bind(this);
        this.handleSend = this.handleSend.bind(this);
        this.renderMessage = this.renderMessage.bind(this);
        this._onCreateChannel = this._onCreateChannel.bind(this);
        this.socket = socketio.connect();

        // this.messages = new OrderedMap();
        // this.user = {
        //     _id : 0,
        //     name: '듀랑고',
        //     created: new Date(),
        // }
    }

    _onCreateChannel(){

        const {Store} = this.state;

        const channelId = new ObjectID().toString();
        const channel = {
            _id: channelId,
            title: "New Channel",
            lastMessage: "Last Message~",
            members: new OrderedMap({
                '2':true,
                '3':true,
                '1':true,
            }),
            messages: new OrderedMap(),
            created: new Date(),
            isNew: true,
        };
        Store.onCreatedNewChannel(channel);
        this.forceUpdate();
    }
    renderMessage(message){ //메세지 보안

        return <p dangerouslySetInnerHTML={{__html: _.get(message, 'body')}} />
    }

    handleSend(){
        const {Store} = this.state;
        const {newMessage} = this.state;

        const messageId = new ObjectID().toString();
        const channel = Store.getActiveChannel();
        const channelId = _.get(channel, '_id', null);
        const currentUser = Store.getCurrentUser();

        const message = {
            _id: messageId,
            channelId: channelId,
            author: _.get(currentUser, 'name', null),
            body: newMessage,
            me: 1,
        };
        console.log("NEW OB MESSAGE:", message);
        Store.addMessage(messageId, message);
        this.forceUpdate();
        this.setState({
                newMessage:'',
            });
    }

     addTestMessages(){
       const {Store} = this.state;

        let {messages} = this.state;

        for(let i =0; i <100; i++){
            let isMe = 0;

            if( i % 3 ==0){
               isMe = 1;
            }
            const newMsg = {
              //  author: this.props.currentUser,
                _id: `${i}`,
                author: "이용재",
                body: `메시지몸체 ${i}`,
                me: isMe,
            };
            //console.log(Store.cube2(2));
            //this.messages = this.messages.set(i, newMsg);
            Store.addMessage(i, newMsg);

        }

        for(let c = 0; c < 10; c++){

            let newChannel = {
                _id: `${c}`,
                title: `Channel title ${c}`,
                lastMessage: `Hey there here...${c}`,
                members: new OrderedMap({
                    '1':true,
                    '2':true,
                    '3':true,
                }),
                messages: new OrderedMap(),
                created: new Date(),
            };

            const msgId = `${c}` ;
            const moreMsgId = `${c+1}`;
            newChannel.messages = newChannel.messages.set(msgId, true);
            newChannel.messages = newChannel.messages.set(moreMsgId, true);

            Store.addChannel(c, newChannel);
        }
        //this.forceUpdate();
     }

    componentWillMount() {
      const {Store} = this.state;
        var output = {
            userEmail: this.props.currentEmail,
        };
        this.socket.emit('login', output);

        this.forceUpdate();

        // // 내가 쓴 대화내용을 채팅창에 들어왔을 때 불러오기
        // this.socket.on('preload', data => {
        //     for(var i=0; i<data.length; i++) {
        //         var output = {
        //             name: data[i].name,
        //             message: data[i].message
        //         }
        //         this.socket.emit('message', output)
        //     }
        //     this.setState({message: ''})
        //     console.log('데이터다!' + data[0].message)
        // })
    //    this.addTestMessages();
    }


    // messageChanged(e) {
    //     this.setState({message: e.target.value})
    // }

    // send() {
    //     var output = {
    //         email: this.props.currentEmail,
    //         name: this.props.currentUser,
    //         message: this.state.message,
    //         time: getTime(new Date(Date.now()))
    //     }
    //
    //     this.socket.emit('message', output)
    //     this.setState({message: ''})
    // }

    componentDidMount() {

        // this.socket.on('message', (obj) => {
        //
        //     const logs2 = this.state.logs
        //     obj.key = 'key_' + (this.state.logs.length + 1)
        //     console.log(obj);
        //     logs2.push(obj) // 로그에 추가
        //     this.setState({logs: logs2})
        // })
        this.addTestMessages();
    }


    render() {
      const {Store} = this.state;
      //const messages = this.state.messages;
      //const messages = this.messages.valueSeq();
      const activeChannel = Store.getActiveChannel();
      const messages = Store.getMessageFromChannel(activeChannel);
      const channels = Store.getChannels();
      const members = Store.getMembersFromChannel(activeChannel);

      // if(activeChannel){
      //   console.log("Active channel is:", activeChannel);
      //   console.log("Message in channel", activeChannel._id, messages);
      // }
      //console.log(Store.getChannels());
      //console.log("ST2: ", this.props.Store);
        const { activeItem } = this.state || {};



        // const messages = this.state.logs.map(e => (
        //     <div>
        //         {
        //             e.name !== this.props.currentUser ?
        //                 // sender가 상대방일 때
        //                 <MessageGroup>
        //                 <Message authorName={e.name} date={e.time} >
        //                     <MessageText>{e.message}</MessageText>
        //                 </Message>
        //                 </MessageGroup>
        //
        //                 :
        //                 // sender가 본인일 때
        //                     <MessageGroup>
        //                 <Message isOwn deliveryStatus={e.time} >
        //                     <MessageText>{e.message}</MessageText>
        //                 </Message>
        //                     </MessageGroup>
        //         }
        //     </div>
        // ))

        const chatView = (

            <div style={{height: 'calc(100% - 100px)'}}>
                <MessageList active>
                {messages.map((message, index) => {
                  //console.log(messages[0].me);
                  return (
                    <div key={index}>
                    {
                    message.me !== 1 ?
                    <MessageGroup>
                    <Message isOwn deliveryStatus="5:10">
                    <MessageText>듀랑고 : {this.renderMessage(message)} </MessageText>
                    </Message>
                    </MessageGroup>
                    :
                    <MessageGroup>
                    <Message authorName={message.author} date="5:05" >
                    <MessageText>{this.renderMessage(message)} </MessageText>
                    </Message>
                    </MessageGroup>
                   }
                    </div>
                  )
                })}
                </MessageList>

            </div>
        )

        const inputView = (
            <div style={{width: '100%', height: 100}}>

                <input                                //줄바꿈이 지금안되고 있음. textarea로 해결=?css수정필요
                    placeholder='여기에 쓰세요'
                    defaultValue=''
                    value={this.state.newMessage}
                    onChange={(event) => {
                      //console.log("Text is chaning: ", event.target.value);
                      this.setState({newMessage: _.get(event, 'target.value')});
                    }}
                    onKeyPress = {(event) => {
                    //  console.log("있는지", this.state.newMessage=[]);
                        if(event.key === 'Enter' && !event.shiftKey && this.state.newMessage.length > 0){
                            this.handleSend();
                        }
                    }}
                    style={{width: '89%', height: '100%', marginTop: 10}}
                />
                <Button size='mini'
                        primary
                        onClick = {() => {
                          if(this.state.newMessage.length > 0){
                            this.handleSend();
                          }
                        }
                      }

                        style={{float: 'right, bottom'}}
                >전송</Button>

            </div>
        )

        const SideBarLeft = (

          <Container>
              <Menu.Item>
                  <Menu.Header style={{color: 'white'}}>채널</Menu.Header>

                  <Menu.Menu>
                      <Menu.Item name='전체공지방' active={activeItem === '전체공지방'} onClick={this.handleItemClick} style={{color: 'white'}}/>

                  </Menu.Menu>

                  <Menu.Menu>
                      <Menu.Item name='1조스터디' active={activeItem === '1조스터디'} onClick={this.handleItemClick} style={{color: 'white'}}/>
                  </Menu.Menu>
              </Menu.Item>
              <div onClick={this._onCreateChannel} style={{color: 'red'}}>채널생성</div>
              {_.get(activeChannel, 'isNew') ? <div>
                  <lavel>Search:</lavel>
                  <input onChange={(event) => {

                          const searchUserText = _.get(event, 'target.value');
                          this.setState({
                              searchUser: searchUserText
                          });
                    }} type="text" value={this.state.searchUser} />
                  <SearchUser search = {this.state.searchUser} Store={Store} />
              </div> : <div>채널생성비활성화상태</div> }
              <div>
                  {channels.map((channel, key) => {
                    //const {ChatContainer} = this.state;
                    return (
                        <div onClick={(key) => {
                            Store.setActiveChannelId(channel._id);
                            this.forceUpdate();
                          //  console.log("작동중:", ChatContainer.cube3(3));

                        }} key={channel._id}>
                            <div>{channel.title}</div>
                              <div>{channel.lastMessage}</div>
                        </div>
                    )
                  })}

              </div>
          </Container>
        )

        const SideBarRight = (

          <div>

            <h1>User Info</h1>

            {members.map((member, key) => {

                return (
                    <div key = {key}>
                        <div>{member.name}</div>
                        <div>Joined: 3 days ago..</div>
                    </div>
                )
            })}


          </div>

        )


        return (

            <Grid celled style={{marginTop: 0, marginBottom: 0, width: '100%', height: 'calc(100vh - 55px)'}}>
                <Grid.Column style={{width: 200, backgroundColor: '#455A64'}}>
                    {SideBarLeft}
                </Grid.Column>
                <Grid.Column style={{width: 'calc(100% - 400px)'}}>
                    <div style={{height: '100%'}}>
                        {chatView}
                        {inputView}
                    </div>
                </Grid.Column>
                <Grid.Column floated='right' style={{width: 200, backgroundColor: '#455A64'}}>
                  {SideBarRight}
                </Grid.Column>
            </Grid>

        )
    }
}

const mapStateToProps = (state) => {

    return {
        status: state.authentication.status,
        currentUser: state.authentication.status.currentUser,
        currentEmail: state.authentication.status.currentEmail
    }

}

export default connect(mapStateToProps)(ChatContainer)
