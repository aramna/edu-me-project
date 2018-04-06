import React from 'react';
import socketio from 'socket.io-client'
import {connect} from 'react-redux'
import {
    Button,
    Grid,
    Icon,
    Input,
    Menu,
    Divider
} from 'semantic-ui-react'
import {SideBar} from 'components'
import {Message, MessageText, MessageGroup, MessageList, Row, Avatar} from '@livechat/ui-kit'
import '../index.css'

const getTime = (date) => {
    return `${date.getHours()}:${("0" + date.getMinutes()).slice(-2)}`
}

class ChatContainer extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            newMessage: '',
            logs: [],
            userEmail: '',
            roomId: '',
            visibleList: true, //sidebar
            visibleAdd: false,  //sidebar
            channelList: [],    //채널리스트
            activeChannel: '',  //활성화된 채널
            memberList: []
        }

        this.socket = socketio.connect()

        this.handleItemShow = this.handleItemShow.bind(this)    //sidebar
        this.handleChannelAdd = this.handleChannelAdd.bind(this)    //sidebar
        this.handleItemClick = this.handleItemClick.bind(this)
        this.handleRoomCreate = this.handleRoomCreate.bind(this)
        this.handleRefresh = this.handleRefresh.bind(this)
    }

    componentWillMount() {

      this.socket.on('premsg', (premsg) => {
  console.log("premsg마운트됌");
   console.log("premsg: ",premsg);

const logs2 = premsg;
console.log("premsg:",premsg);
console.log("logs2",logs2);
console.log("this1",this.state.logs);
this.setState({logs: logs2})
console.log("this2",this.state.logs);
  })
  
        var defaultRoom = 'main'    //채팅방에 입장시 기본 채팅방을 main으로 설정
        var output = {
            userEmail: this.props.currentEmail,
            id: this.props.currentUser,
            roomId: defaultRoom
        }
        this.socket.emit('login', output)
        this.setState({
            roomId: defaultRoom,
            activeChannel: defaultRoom
        })

        const channelList = localStorage.channelList

        if(channelList) {
            this.setState({
                channelList: JSON.parse(channelList)
            })
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if(JSON.stringify(prevState.channelList) !== JSON.stringify(this.state.channelList)) {
            localStorage.channelList = JSON.stringify(this.state.channelList)
        }
    }



/////////////////////////////////////////////////////////////
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


//Menu의 chaneel을 클릭했을 때 채널리스트가 보여지게 하는 함수
    handleItemShow() {
        if (this.state.visibleList === false) {
            this.setState({visibleList: true})
        } else {
            this.setState({visibleList: false})
        }
    }   //sidebar


//input에 입력된 value값을 받아와 roomId에 setState하는 함수
    roomChanged(e) {
        this.setState({roomId: e.target.value})
    }

//input에 채널 이름을 입력했을 때 채널리스트를 추가하는 함수
    handleChannelAdd() {
        if (this.state.visibleAdd === false) {
            this.setState({visibleAdd: true})
        } else {
            this.setState({visibleAdd: false})
        }
    }   //sidebar

//inputView에서 input박스에 입력된 메시지 내용을 받아오는 함수
    messageChanged(e) {
        this.setState({newMessage: e.target.value})
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
                this.handleItemClick(e, {name: e.target.value})

            }

        }

        if (c === 1) {
            this.socket.emit('room', output)
            this.setState({
                channelList: this.state.channelList.concat({
                    text: e.target.value
                })
            })

            this.handleItemClick(e, {name: e.target.value})
        }
        console.log(this.state.channelList.length);
        console.log(this.state.channelList);

    }

//Menu.Item에서 item을 클릭했을 때 그 채널을 활성화해주는 함수
    handleItemClick(e, {name}) {
        console.log(this.state.channelList)

        this.setState({activeChannel: name})


        var output = {
            command: 'join',
            roomId: name,
            id: this.props.currentUser,
            userEmail: this.props.currentEmail
        }

        console.log("액티브유저" + this.state.memberList)
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
        this.setState({newMessage: ''})
    }

    handleRefresh(e) {
        this.handleItemClick(e, {name: this.state.activeChannel})
    }

    componentDidMount() {

        this.socket.on('message', (obj) => {

            const logs2 = this.state.logs
            obj.key = 'key_' + (this.state.logs.length + 1)
            console.log(obj)
            logs2.push(obj) // 로그에 추가
            this.setState({logs: logs2})
        })

        this.socket.on('channellist', (channellist) => {
            console.log("채널리스트")
            console.log(channellist.roomIds)
            this.setState({channelList: []})
            this.setState({
                channelList: this.state.channelList.concat(channellist.roomIds)
            })
            console.log("띄우는거", this.state.channelList)
        })

        this.socket.on('memberlist', (memberlist) => {
            console.log(memberlist.member)
            this.setState({memberList: []})
            for (var i = 0; i < memberlist.member.length; i++) {

                this.setState({
                    memberList: this.state.memberList.concat({
                            room: memberlist.member[i].channel,
                            text: memberlist.member[i].text
                        }
                    )
                })
            }
        })

    }

    render() {
        const {activeChannel} = this.state

        const messages = this.state.logs.map(e => (

            <div style={{paddingTop: 10}}>
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
        ))

        const channel = this.state.channelList.map(
            ({key, text}) => (

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

        const userList = this.state.memberList.map(
            ({room, text}) => (
                room === this.state.activeChannel &&

                <div className={room}>
                    <Menu.Menu>
                        <Menu.Item
                            name={text}
                            active={activeChannel === text}
                        />
                    </Menu.Menu>
                </div>

            )
        )

        const chatView = (
            <div style={{height: 'calc(100% - 100px)'}}>

                <MessageList active style={{backgroundColor: '#D6D6D6'}}>
                    <Divider horizontal style={{color: '#455A64', fontSize: 10}}>{this.state.activeChannel}방에
                        입장하셨습니다.</Divider>
                    {this.state.logs.map(e => (
                        e.roomId === this.state.activeChannel ?
                            <div className={e.roomId} style={{paddingTop: 10}}>
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
                </MessageList>
            </div>
        )


        const inputView = (
            <div style={{width: '100%', height: 80}}>

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
                    style={{width: '89%', height: '100%', marginTop: 10}}
                />
                <Button size='mini'
                        primary
                        onClick={() => {
                            if (this.state.newMessage.length > 0) {
                                this.handleSend()
                            }
                        }}
                        style={{float: 'right, bottom'}}
                >전송</Button>
            </div>
        )


        const SideView = (
            <Menu inverted vertical
                  style={{
                      width: '100%',
                      height: '60%',
                      backgroundColor: '#455A64',
                      marginTop: 30,
                      marginBottom: 0
                  }}>
                <Menu.Item>
                    <div>
                        <Icon inverted name='user circle outline' size='huge' style={{marginRight: 10}}/>
                        <label style={{
                            textAlign: 'center',
                            fontWeight: 'bold',
                            fontSize: 17,
                            verticalAlign: 'center'
                        }}>
                            {this.props.currentUser}
                            <br/>
                            <label style={{fontWeight: 'normal', fontSize: 13}}>
                                {this.props.currentEmail}
                            </label>
                        </label>
                    </div>
                </Menu.Item>

                <Menu.Item style={{height: 500, overflowY: 'auto'}}>
                    <Menu.Header>
                        <label onClick={this.handleItemShow}>
                            Channels
                        </label>
                        <Icon onClick={this.handleChannelAdd} name='add' style={{float: 'right'}}/>
                    </Menu.Header>
                    {this.state.visibleAdd ?
                        <Menu.Item>
                            <Input as='search'
                                   transparent={true}
                                   icon='search'
                                   inverted placeholder='검색'
                                   value={this.state.roomId}
                                   onChange={e => this.roomChanged(e)}
                                   onKeyPress={e => {
                                       e.key === 'Enter' && this.handleRoomCreate(e)
                                   }}
                            />
                        </Menu.Item>
                        : ""}
                    {channel}
                </Menu.Item>
            </Menu>
        )

        const SideView2 = (
            <div style={{
                width: '100%',
                height: 'calc(40% - 30px)',
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
                            <Icon onClick={this.handleRefresh} name='refresh' style={{float: 'right'}}/>
                        </Menu.Header>

                        {userList}

                    </Menu.Item>
                </Menu>
            </div>
        )


        return (

            <Grid celled style={{marginTop: 0, marginBottom: 0, width: '100%', height: 'calc(100vh - 55px)'}}>
                <Grid.Column style={{width: 250, backgroundColor: '#455A64', padding: 0}}>
                    {SideView}
                    {SideView2}
                </Grid.Column>
                <Grid.Column style={{width: 'calc(100% - 310px)', padding: 0}}>
                    <div style={{height: '100%', textAlign: 'center'}}>
                        {chatView}
                        {inputView}
                    </div>
                </Grid.Column>
                <Grid.Column floated='right' style={{width: 60, backgroundColor: '#455A64'}}>

                </Grid.Column>
            </Grid>

        )
    }
}

const
    mapStateToProps = (state) => {

        return {
            status: state.authentication.status,
            currentUser: state.authentication.status.currentUser,
            currentEmail: state.authentication.status.currentEmail,
        }

    }

export default connect(mapStateToProps)

(
    ChatContainer
)
