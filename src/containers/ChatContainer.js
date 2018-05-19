import React from 'react';
import socketio from 'socket.io-client'
import { connect } from 'react-redux'
import _ from 'lodash'
import {OrderedMap} from 'immutable'
import Chatbot from './Chatbot'
import {
    Button,
    Grid,
    Icon,
    Input,
    Menu,
    Divider,
    Dimmer,
    Loader
} from 'semantic-ui-react'
import { SideBar } from 'components'
import {
    Message,
    MessageText,
    MessageGroup,
    MessageList,
    Row,
    Avatar,
    SendButton,
    TextComposer,
    TextInput,
    IconButton,
    EmojiIcon
} from '@livechat/ui-kit'
import '../index.css'

const getTime = (date) => {
    return `${date.getHours()}:${("0" + date.getMinutes()).slice(-2)}`
}

function dynamicSort(property) {
    var sortOrder = 1
    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a, b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

const users =[{_Id: 1, name:"abc", email:"abc@abc.com"},
              {_id: 2, name:"abd", email:"abd@abd.com"},
              {_id: 3, name:"cc2", email:"cc2@cc2.com"}];

class ChatContainer extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            newMessage: '',
            items: 15,
            premsg: [],
            logs: [],
            roomId: '',
            searchUserList: '',
            showSearchUser: false,
            visibleList: true, //sidebar
            visibleAdd: false,  //sidebar
            channelList: [],    //채널리스트
            activeChannel: '',  //활성화된 채널
            memberList: [],
            chatList: [],
            loading: true,
            x: false,
            y: false,
            z: false,
            ChatbotCheck: false,
        }


        this.socket = socketio.connect()

        this.handleItemShow = this.handleItemShow.bind(this)    //sidebar
        this.handleChannelAdd = this.handleChannelAdd.bind(this)    //sidebar
        this.handleItemClick = this.handleItemClick.bind(this)
        this.handleRoomCreate = this.handleRoomCreate.bind(this)
        this.handleRefresh = this.handleRefresh.bind(this)
        this.scrollDown = this.scrollDown.bind(this)
        this.scrollPosition = this.scrollPosition.bind(this)
        this.searchUser = this.searchUser.bind(this)
        this.personalTalk = this.personalTalk.bind(this)
        this.dkanrjskl=this.dkanrjskl.bind(this)
    }

    dkanrjskl(){
      console.log('온클릭됌');
      this.setState({ ChatbotCheck: true })

    }

    searchUser(search = ""){
      let searchItems = new OrderedMap();
      if(_.trim(search).length){
        users.filter((user) => {
          const name = _.get(user, 'name');
          const userId = _.get(user, '_id');
          if(_.includes(name, search)){
              searchItems = searchItems.set(userId, user);
          }
        })
      }
      return searchItems.valueSeq();

    }

    personalTalk(e,name) {
      console.log("개인대화 생성");
      var c = 1;
      var output = {
          command: 'create',
          userEmail: this.props.currentEmail,
          roomId: this.props.currentUser+name,
          id: this.props.currentUser,
      }

      for (var i = 0; i < this.state.channelList.length; i++) {

          if (this.state.channelList[i].text === output.roomId) {
              c = 0;
              i = this.state.channelList.length;
              this.handleItemClick(e, { name: output.roomId })
          }
          if (this.state.channelList[i].text === name+this.props.currentUser) {
              c = 0;
              i = this.state.channelList.length;
              this.handleItemClick(e, { name: name+this.props.currentUser })
          }

      }
if (c === 1) {
      this.socket.emit('room', output)
      this.setState({
          channelList: this.state.channelList.concat({
              text: output.roomId
          })
      })

      this.handleItemClick(e, { name: output.roomId })

    }
    //상대방도 초대하는 작업 백엔드로 요청코드필요하고 RoomId,RoomName 분리필요해보임//
  }

    scrollDown() {
        const { container } = this.refs
        container.scrollTop = container.scrollHeight
    }

    scrollUp() {
        const { container } = this.refs
        container.scrollTop = 0
    }

    scrollPosition() {
        const { container } = this.refs

        // container.scrollTop = container.clientHeight - container.scrollTop

        container.scrollTop = container.clientHeight

    }

    //Menu의 chaneel을 클릭했을 때 채널리스트가 보여지게 하는 함수
    handleItemShow() {
        if (this.state.visibleList === false) {
            this.setState({ visibleList: true })
        } else {
            this.setState({ visibleList: false })
        }
        console.log("로그스", this.state.logs)
    }   //sidebar


    //input에 입력된 value값을 받아와 roomId에 setState하는 함수
    roomChanged(e) {
        this.setState({ roomId: e.target.value })
    }

    //input에 채널 이름을 입력했을 때 채널리스트를 추가하는 함수
    handleChannelAdd() {
        if (this.state.visibleAdd === false) {
            this.setState({ visibleAdd: true })
        } else {
            this.setState({ visibleAdd: false })
        }
    }   //sidebar

    //inputView에서 input박스에 입력된 메시지 내용을 받아오는 함수
    messageChanged(e) {
        this.setState({ newMessage: e.target.value })
    }


    //채팅방을 생성하는 함수
    handleRoomCreate(e) {
        var c = 1;
        var output = {
            command: 'create',
            userEmail: this.props.currentEmail,
            roomId: e.target.value,
            id: this.props.currentUser,
        }

        for (var i = 0; i < this.state.channelList.length; i++) {

            if (this.state.channelList[i].text === e.target.value) {
                c = 0;
                i = this.state.channelList.length;
                this.handleItemClick(e, { name: e.target.value })
            }
        }

        if (c === 1) {
            this.socket.emit('room', output)
            this.setState({
                channelList: this.state.channelList.concat({
                    text: e.target.value
                })
            })

            this.handleItemClick(e, { name: e.target.value })
        }

    }

    //Menu.Item에서 item을 클릭했을 때 그 채널을 활성화해주는 함수
    handleItemClick(e, { name }) {
        const { container } = this.refs
        // this.setState({ x: false })

        container.addEventListener("scroll", () => {

            if (container.scrollTop === 0) {

                    // this.setState({ y:false, x: false })
                    console.log("메롱")
                }

        })

        console.log("this.X : ", this.state.x)

        console.log(this.state.channelList)

        console.log("채팅방 입장시 logs: ", this.state.logs)
        // this.setState({ y: false })
        this.setState({ activeChannel: name })

        var output = {
            command: 'join',
            roomId: name,
            id: this.props.currentUser,
            userEmail: this.props.currentEmail
        }

        this.socket.emit('room', output)
    }   //sidebar

    // command를 message로 하여 room 으로 emit
    handleSend() {
        var output = {
            command: 'message',
            email: this.props.currentEmail,
            name: this.props.currentUser,
            message: this.state.newMessage,
            roomId: this.state.activeChannel
        }

        this.socket.emit('room', output)
        this.setState({ newMessage: '' })
        console.log("logs: ", this.state.logs)
    }

    handleRefresh(e) {
        this.handleItemClick(e, { name: this.state.activeChannel })
    }

    componentWillMount() {

        this.socket.on('message', (obj) => {

            const logs2 = this.state.logs
            obj.key = 'key_' + (this.state.logs.length + 1)
            logs2.push(obj) // 로그에 추가
            this.setState({ logs: logs2 })
        })

        var defaultRoom = 'main'    //채팅방에 입장시 기본 채팅방을 main으로 설정
        var output = {
            userEmail: this.props.currentEmail,
            id: this.props.currentUser,
            roomId: defaultRoom
        }
        // console.log("현재유저:",this.props.currentUser)
        if (this.props.currentUser !== '') {
            this.socket.emit('login', output)
        }

        this.setState({
            roomId: defaultRoom,
            activeChannel: defaultRoom
        })

        console.log("액티브채널:", this.state.channelList)

        if (this.state.channelList !== null) {
            this.socket.on('channellist', (channellist) => {
                console.log("채널리스트")
                console.log(channellist.roomIds)
                this.setState({ channelList: [] })
                this.setState({
                    channelList: this.state.channelList.concat(channellist.roomIds)
                })
                console.log("채널리스트", this.state.channelList)
            })
        }

        this.socket.on('memberlist', (memberlist) => {
            this.setState({ memberList: [] })

            this.setState({
                memberList: memberlist.member
            })

        })

        this.socket.on('premsg', (premsg) => {
            this.setState({ premsg: premsg, loading: false });
            console.log("premsg: ", this.state.premsg)
            var premsgLength = this.state.premsg.length
            console.log("premsgLength: ", premsgLength)
            if (premsgLength < 15) {
                start = 0
            } else {
                var start = premsgLength - 15
            }
            var premsg_slice = this.state.premsg.slice(start, premsgLength)
            console.log("premsg_slice: ", premsg_slice)

            this.setState({ logs: premsg_slice })
        })





    }

    loadMoreChat() {

        // var output = {
        //     command: 'loadmsg',
        //     chatSize: this.state.logs.length,
        //     roomId: this.state.activeChannel
        // }
        // this.socket.emit('room', output)
        // this.setState({x: true})
        var loadCount = this.state.logs.length;
        // this.setState({x: true})

        if (this.state.premsg) {
            var fn = this.state.premsg.length - loadCount;
            if (fn < 0) {
                console.log("저장된 msg길이보다 넘어온 길이가 더 큽니다.")
            } else if (fn == 0) {
                console.log("끝에 도달했습니다.")
                // this.setState({x:true})
            } else if (fn < 15) {
                st = 0
                console.log("fn : " + fn + ", st : " + st)
                var premsg_slice = this.state.premsg.slice(st, fn)
                this.scrollPosition()
                this.setState({ logs: this.state.logs.concat(premsg_slice).sort(dynamicSort("chatCount")) })

            } else {
                var st = fn - 15
                console.log("fn : " + fn + ", st : " + st)
                var premsg_slice = this.state.premsg.slice(st, fn)
                this.scrollPosition()
                this.setState({ logs: this.state.logs.concat(premsg_slice).sort(dynamicSort("chatCount")) })

            }
        } else {
            console.log("아무것도없어");
        }
    }

    // this.socket.on('loadmsg', (loadmsg) => {
    // if(loadmsg !== null){
    //     this.setState({logs: this.state.logs.concat(loadmsg)})
    //     this.setState({logs: this.state.logs.sort(dynamicSort("chatCount"))})

    //     console.log("확인합니다loadmsg: ", loadmsg)
    // }
    // else if(loadmsg === null){
    //     console.log("더없지롱")
    // }
    //     console.log("로드메시시시시")
    // })


    //     console.log(output.chatSize)
    // }



    componentDidMount() {
        const { container } = this.refs
        // this.setState({ x: false })

        container.addEventListener("scroll", () => {

            if (container.scrollTop ==0) {
                this.loadMoreChat()
            }
        })

        this.scrollDown()

        // this.setState({loaded: true})
    }

    componentDidUpdate(prevProps, prevState) {

        this.historyChange = prevState.logs == this.state.logs

        var defaultRoom = 'main'

        if (this.props.currentUser !== prevProps.currentUser) {
            var output = {
                userEmail: this.props.currentEmail,
                id: this.props.currentUser,
                roomId: defaultRoom
            }
            if (this.props.currentUser !== '') {
                this.socket.emit('login', output)
            }
        }
        if (this.historyChange) {
            this.scrollDown()
        }

    }


    render() {
        const { activeChannel } = this.state
        const users2 = this.searchUser(this.state.searchUserList);
        const channel = this.state.channelList.map(
            ({ text }) => (

                <div>
                    {this.state.visibleList ?
                        <Menu.Menu>
                            <Menu.Item
                                name={text}
                                active={activeChannel === text}
                                onClick={this.handleItemClick}
                            />
                        </Menu.Menu> : ""}
                </div>)
        )

        const example = []
        for (var i = 0; i < this.state.memberList.length; i++) {
            example.push(
                <Menu.Item
                    name={this.state.memberList[i]}
                />
            )
        }

        const userList = (
            <div className={this.state.activeChannel}>
                <Menu.Menu>
                    {example}
                </Menu.Menu>

            </div>
        )

        const chatView = (

            <div style={{ height: 'calc(100% - 100px)' }}>

                <div ref='container' style={{ height: '100%', overflowY: 'scroll', backgroundColor: '#D6D6D6' }}>

                    <Divider horizontal style={{ color: '#455A64', fontSize: 10 }}>{this.state.activeChannel}방에
                        입장하셨습니다.</Divider>

                    {this.state.logs.map(e => (
                        e.roomId === this.state.activeChannel ?
                            <div className={e.roomId} style={{ paddingTop: 10 }}>
                                {
                                    e.name !== this.props.currentUser ?
                                        // sender가 상대방일 때
                                        <Message
                                            authorName={e.name} date={getTime(new Date(Date.now()))}>
                                            <MessageText>{e.message}</MessageText>
                                        </Message>
                                        :
                                        // sender가 본인일 때
                                        <Message isOwn deliveryStatus={getTime(new Date(Date.now()))}>
                                            <MessageText>{e.message}</MessageText>
                                        </Message>
                                }
                            </div>
                            :
                            ''
                    ))}

                </div>

            </div>

        )


        const inputView = (
            <div style={{ width: '100%', height: 80 }}>

                <Input
                    type='text'
                    placeholder=''
                    defaultValue='52.03'
                    value={this.state.newMessage}
                    onChange={e => this.messageChanged(e)}
                    onKeyPress={e => {
                        if (e.key === 'Enter' && this.state.newMessage.length > 0) {
                            this.handleSend()
                        }
                    }}
                    style={{ width: '89%', height: '100%', marginTop: 10 }}
                />
                <Button size='mini'
                    primary
                    onClick={() => {
                        if (this.state.newMessage.length > 0) {
                            this.handleSend()
                        }
                    }}cmd
                    style={{ float: 'right, bottom' }}
                >전송</Button>
            </div>
        )
        const SideView = (

            <Menu inverted vertical
                style={{
                    width: '100%',
                    height: '50%',
                    backgroundColor: '#455A64',
                    marginTop: 30,
                    marginBottom: 0
                }}>
                <Menu.Item>
                    <div>
                        <Icon inverted name='user circle outline' size='huge' style={{ marginRight: 10 }} />
                        <label style={{
                            textAlign: 'center',
                            fontWeight: 'bold',
                            fontSize: 17,
                            verticalAlign: 'center'
                        }}>
                            {this.props.currentUser}
                            <br />
                            <label style={{ fontWeight: 'normal', fontSize: 13 }}>
                                {this.props.currentEmail}
                            </label>
                        </label>
                    </div>
                </Menu.Item>

                <Menu.Item style={{ height: 500, overflowY: 'auto' }}>
                    <Menu.Header>
                        <label onClick={this.handleItemShow}>
                            Channels
                        </label>
                        <Icon onClick={this.handleChannelAdd} name='add' style={{ float: 'right' }} />
                    </Menu.Header>
                    {this.state.visibleAdd ?
                        <Menu.Item>
                            <Input as='search'
                                transparent={true}
                                icon='search'
                                inverted placeholder='채널검색'
                                value={this.state.roomId}
                                onChange={e => this.roomChanged(e)}
                                onKeyPress={e => {
                                    e.key === 'Enter' && this.handleRoomCreate(e)
                                }}
                            />
                            <Input as='search'
                                transparent={true}
                                icon='search'
                                inverted placeholder='유저검색'
                                value={this.state.searchUser}
                                onChange={(e) => {
                                  const searchUserText = _.get(e,'target.value');

                                  this.setState({
                                      searchUserList: searchUserText,
                                      showSearchUser: true,
                                  }
                                  );
                                }}

                            />
                          {this.state.showSearchUser ?
                          <div>
                            {users2.map((user, index) => {
                              return <div style={{
                                  marginTop: 5,
                                  marginBottom: 5,

                              }}
                              onClick={(e) => {
                                var name = _.get(user, 'name')
                                this.personalTalk(e,name)
                              }}
                              ><p>{_.get(user, 'name')}</p></div>
                            })}

                          </div> : ""}

                        </Menu.Item>
                        : ""}
                    {channel}
                </Menu.Item>
            </Menu>
        )

        const SideView2 = (
            <div style={{
                width: '100%',
                height: 'calc(50% - 30px)',
                backgroundColor: '#455A64',
                marginTop: 0,
                marginBottom: 0
            }}>
                <Menu inverted vertical style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#455A64',
                    marginTop: 0,
                    marginBottom: 0
                }}>
                    <Menu.Item>
                    </Menu.Item>
                    <Menu.Item>
                        <Menu.Header>
                            <label>UserList</label>
                            <Icon onClick={this.handleRefresh} name='refresh' style={{ float: 'right' }} />
                        </Menu.Header>

                        {userList}

                    </Menu.Item>
                </Menu>
            </div>
        )

        const Chatbotview = (
            <Menu inverted vertical style={{
                    width: '100%',
                    height: '20px',
                    backgroundColor: '#455A64',
                    marginTop: 0,
                    marginBottom: 0
                }}>
                <Menu.Item style={{ height: 100, overflowY: 'auto' }}>
                    <Menu.Header>
                        <label onClick={this.dkanrjskl}>
                            Chatbot Helper
                        </label>
                    </Menu.Header>
                </Menu.Item>
            </Menu>
        )


        return (

            <Grid celled style={{ marginTop: 0, marginBottom: 0, width: '100%', height: 'calc(100vh - 55px)' }}>
                <Dimmer active={this.state.loading}>
                    <Loader active={this.state.loading}>채팅 불러오는중</Loader>
                </Dimmer>
                <Grid.Column style={{ width: 250, backgroundColor: '#455A64', padding: 0 }}>
                    {SideView}
                    {Chatbotview}
                    {SideView2}
                </Grid.Column>
                {this.state.ChatbotCheck ? <Chatbot /> :
                  <Grid.Column style={{ width: 'calc(100% - 310px)', padding: 0 }}>
                    <div style={{ height: '100%', textAlign: 'center' }}>
                        {chatView}

                        {inputView}
                    </div>
                </Grid.Column>}
                <Grid.Column floated='right' style={{ width: 60, backgroundColor: '#455A64' }}>

                </Grid.Column>
            </Grid>


        )
    }
}

const mapStateToProps = (state) => {
    return {
        status: state.authentication.status,
        currentUser: state.authentication.status.currentUser,
        currentEmail: state.authentication.status.currentEmail,
    }
}

export default connect(mapStateToProps)(ChatContainer)
