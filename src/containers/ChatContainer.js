import React, {PropTypes} from 'react';
import socketio from 'socket.io-client'
import {connect} from 'react-redux'
import _ from 'lodash'
import {OrderedMap} from 'immutable'
import {
    Button,
    Grid,
    Icon,
    Input,
    Menu,
    Divider,
    Dimmer,
    Loader,
    Modal,
    Popup,
    List,
    Item,
    Image,
    Header,
    Container,
    Segment, Responsive, Sidebar,
} from 'semantic-ui-react'
import {
    Message,
    MessageText,
} from '@livechat/ui-kit'
import '../index.css'
import avartarImage from '../images/avatar.jpg'

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
            visibleList2: true,
            visibleAdd: false,
            visibleAdd2: false,
            channelList: [],    //채널리스트
            channelList2: [],
            activeChannel: '',  //활성화된 채널
            activeOneOnOne: '',
            activeOneOnOneRoomId: '',
            memberList: [],
            chatList: [],
            loading: true,
            loading2: true,
            loading3: true,
            users: [],
            x: false,
            y: false,
            z: false,
            transcript: '',
            show: false,
            listening: false,
            text: '말씀하세요',
            modalOpen: false,
            sidebarOpened: false,
            oneOnOneList: [],
            oneOnOne: false,
            givetextcount: [0,0,0,0,0,0,0,0,0,0,0,0,0],
            activeChannelIndex: 0,
        }

        this.socket = socketio.connect()

        this.handleChannelShow = this.handleChannelShow.bind(this)    //sidebar
        this.handleOneOnOneShow = this.handleOneOnOneShow.bind(this)    //sidebar
        this.handleChannelAdd = this.handleChannelAdd.bind(this)    //sidebar
        this.handleOneOnOneAdd = this.handleOneOnOneAdd.bind(this)    //sidebar
        this.handleItemClick = this.handleItemClick.bind(this)
        this.handleItemClick2 = this.handleItemClick2.bind(this)
        this.handleRoomCreate = this.handleRoomCreate.bind(this)
        this.handleSend = this.handleSend.bind(this)
        this.messageChanged = this.messageChanged.bind(this)
        this.scrollDown = this.scrollDown.bind(this)
        this.scrollPosition = this.scrollPosition.bind(this)
        this.searchUser = this.searchUser.bind(this)
        this.personalTalk = this.personalTalk.bind(this)
        this.start = this.start.bind(this)
        this.end = this.end.bind(this)
        this.handleClose = this.handleClose.bind(this)
        this.handleModalOpen = this.handleModalOpen.bind(this)
        this.handleModalClose = this.handleModalClose.bind(this)
        this.handlePusherClick = this.handlePusherClick.bind(this)
        this.handleToggle = this.handleToggle.bind(this)
        this.roomChanged = this.roomChanged.bind(this)
    }

    handlePusherClick() {
        const {sidebarOpened} = this.state
        if (sidebarOpened) {
            this.setState({sidebarOpened: false})
        }
    }

    handleToggle() {
        this.setState({sidebarOpened: !this.state.sidebarOpened})
    }

    searchUser(search = "") {
        let searchItems = new OrderedMap();
        if (_.trim(search).length) {
            this.state.users.filter((user) => {
                const name = _.get(user, 'username');
                const userId = _.get(user, 'email');
                if (_.includes(name, search)) {
                    searchItems = searchItems.set(userId, user);
                }
            })
        }
        return searchItems.valueSeq();

    }

    personalTalk(e, name, userId) {
        console.log("개인대화 생성");
        var c = 1;
        var output = {
            command: 'create',
            userEmail: this.props.currentEmail,
            receiver: name,
            creater: this.props.currentUser,
            receiverEmail: userId
        }

        for (var i = 0; i < this.state.oneOnOneList.length; i++) {

            if (this.state.oneOnOneList[i].text === output.receiver) {
                c = 0;
                i = this.state.oneOnOneList.length;
                this.handleItemClick2(e, {name: output.receiver})
            }
            if (this.state.oneOnOneList[i].text === output.creater) {
                c = 0;
                i = this.state.oneOnOneList.length;
                this.handleItemClick2(e, {name: output.receiver})
            }

        }
        if (c === 1) {
            this.socket.emit('oneonone', output)
            this.setState({
                oneOnOneList: this.state.oneOnOneList.concat({
                    text: output.receiver
                })
            })

            this.handleItemClick2(e, {name: output.receiver})
            console.log("원온원", this.state.oneOnOneList)

        }
        //상대방도 초대하는 작업 백엔드로 요청코드필요하고 RoomId,RoomName 분리필요해보임//
    }

    scrollDown() {
        const {container} = this.refs
        container.scrollTop = container.scrollHeight
    }

    scrollPosition() {
        const {container} = this.refs
        container.scrollTop = container.clientHeight

    }

    //Menu의 chaneel을 클릭했을 때 채널리스트가 보여지게 하는 함수
    handleChannelShow() {
        if (this.state.visibleList === false) {
            this.setState({visibleList: true})
        } else {
            this.setState({visibleList: false})
        }
    }   //sidebar

    handleOneOnOneShow() {
        if (this.state.visibleList2 === false) {
            this.setState({visibleList2: true})
        } else {
            this.setState({visibleList2: false})
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

    handleOneOnOneAdd() {
        if (this.state.visibleAdd2 === false) {
            this.setState({visibleAdd2: true})
        } else {
            this.setState({visibleAdd2: false})
        }
    }   //sidebar


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
            this.state.channelList2.push(e.target.value)

            this.handleItemClick(e, {name: e.target.value})
        }

    }

    //Menu.Item에서 item을 클릭했을 때 그 채널을 활성화해주는 함수
    handleItemClick(e, {name}) {
        const {container} = this.refs

        const givetextcount=this.state.givetextcount
        console.log("esajkdlkasfj",givetextcount);
        console.log(name);
        console.log(givetextcount[this.state.channelList2.indexOf(name)]);
        givetextcount[this.state.channelList2.indexOf(name)] = "0"

        container.addEventListener("scroll", () => {

            if (container.scrollTop === 0) {
              //  console.log("메롱")
            }

        })
        for(var i=0;i<this.state.channelList.length;i++){
        if(name == this.state.channelList[i].text){
          // console.log("activeindex됌");
          // console.log(i);
          this.setState({activeChannelIndex: i})
          break;
        }
        }

        this.setState({activeChannel: name, activeOneOnOne: ''})
        this.setState({oneonone: false})

        var output = {
            command: 'join',
            roomId: name,
            id: this.props.currentUser,
            userEmail: this.props.currentEmail,
            oneonone: false
        }

        this.socket.emit('room', output)
    }   //sidebar

    handleItemClick2(e, {name}) {
        const {container} = this.refs

        container.addEventListener("scroll", () => {

            if (container.scrollTop === 0) {

            }

        })

        this.setState({oneonone: true, showSearchUser: false})
        this.setState({activeOneOnOne: name, activeChannel: ''})
        console.log('액티브원온원: ', this.state.activeOneOnOne)
        console.log('액티브룸아디: ', this.state.activeOneOnOneRoomId)
        var output = {
            command: 'join',
            roomId: name,
            id: this.props.currentUser,
            userEmail: this.props.currentEmail,
            oneonone: true
        }

        this.socket.emit('room', output)
    }   //sidebar

    //inputView에서 input박스에 입력된 메시지 내용을 받아오는 함수
    messageChanged(e) {
        this.setState({newMessage: e.target.value})
    }

    // command를 message로 하여 room 으로 emit
    handleSend() {
        if(this.state.activeOneOnOne === '') {
            var output = {
                command: 'message',
                email: this.props.currentEmail,
                name: this.props.currentUser,
                message: this.state.newMessage,
                roomId: this.state.activeChannel,
                oneonone: this.state.oneonone
            }
            console.log(this.state.activeChannel)
            this.socket.emit('room', output)
            this.setState({newMessage: ''})
        }
        else if(this.state.activeChannel === '') {
            var output2 = {
                command: 'message',
                email: this.props.currentEmail,
                name: this.props.currentUser,
                message: this.state.newMessage,
                roomId: this.state.activeOneOnOne,
                oneonone: this.state.oneonone
            }
            console.log('쁑',this.state.activeOneOnOne)
            this.socket.emit('room', output2)
            this.setState({newMessage: ''})
        }

    }


    componentWillMount() {
        this.socket.on('message', (obj) => {
            const logs2 = this.state.logs
            obj.key = 'key_' + (this.state.logs.length + 1)
            logs2.push(obj) // 로그에 추가
            this.setState({logs: logs2})
            console.log(obj)
            console.log(obj.roomId);
            console.log(this.state.channelList[0]);
            console.log(this.state.channelList2.indexOf(this.state.activeChannel));
            console.log("fhsakdhfadljfh",this.state.channelList2);
            if(this.state.activeChannel==obj.roomId){
            // this.state.givetextcount[this.state.channelList2.indexOf(this.state.activeChannel)]++;
            //   this.forceUpdate();
            }
            else{
              this.state.givetextcount[this.state.channelList2.indexOf(obj.roomId)]++;
              this.forceUpdate();
            }
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

        if (this.state.channelList !== null) {
            this.socket.on('channellist', (channellist) => {
                this.setState({channelList: []})
                this.setState({
                    channelList: this.state.channelList.concat(channellist.roomIds),
                })
                for(var i=0;i<channellist.roomIds.length;i++){
                  this.state.channelList2.push(channellist.roomIds[i].text)
                }
            })
        }

        if (this.state.oneOnOneList !== null) {
            this.socket.on('oneononelist', (oneononelist) => {
                this.setState({oneOnOneList: []})
                this.setState({
                    oneOnOneList: oneononelist.oneonones,
                })
                //console.log("원온원", this.state.oneOnOneList)
            })
        }

        this.socket.on('memberlist', (memberlist) => {
            this.setState({memberList: []})

            this.setState({
                memberList: memberlist.member
            })

        })

        this.socket.on('join', (join)=> {
            this.setState({activeOneOnOneRoomId: join.roomId});
        })

        this.socket.on('premsg', (premsg) => {
            this.setState({premsg: premsg, loading: false});
            //console.log("premsg: ", this.state.premsg)
            var premsgLength = this.state.premsg.length
            //console.log("premsgLength: ", premsgLength)
            if (premsgLength < 15) {
                start = 0
            } else {
                var start = premsgLength - 15
            }
            var premsg_slice = this.state.premsg.slice(start, premsgLength)
            //console.log("premsg_slice: ", premsg_slice)

            this.setState({logs: premsg_slice})
        })

        this.socket.on('usersearch', (userList) => {
            this.setState({users: this.state.users.concat(userList)})
        })

    }

    loadMoreChat() {

        var loadCount = this.state.logs.length;

        if (this.state.premsg) {
            var fn = this.state.premsg.length - loadCount;
            if (fn < 0) {
                console.log("저장된 msg길이보다 넘어온 길이가 더 큽니다.")
            } else if (fn === 0) {
                console.log("끝에 도달했습니다.")
                // this.setState({x:true})
            } else if (fn < 15) {
                st = 0
                console.log("fn : " + fn + ", st : " + st)
                var premsg_slice = this.state.premsg.slice(st, fn)
                this.scrollPosition()
                this.setState({logs: this.state.logs.concat(premsg_slice).sort(dynamicSort("chatCount"))})

            } else {
                var st = fn - 15
                console.log("fn : " + fn + ", st : " + st)
                var premsg_slice = this.state.premsg.slice(st, fn)
                this.scrollPosition()
                this.setState({logs: this.state.logs.concat(premsg_slice).sort(dynamicSort("chatCount"))})

            }
        } else {
            console.log("아무것도없어");
        }
    }


    componentDidMount() {


        const {container} = this.refs

        container.addEventListener("scroll", () => {
            if (container.scrollTop === 0) {
                this.loadMoreChat()
            }
        })
        this.scrollDown()

        const Recognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        const TextToSpeech =
            window.speechSynthesis

        if (!Recognition) {
            // alert(
            //     '크롬브라우저로 접속해 주세요.'
            // );
            return;
        }

        this.recognition = new Recognition();
        this.recognition.lang = process.env.REACT_APP_LANGUAGE || 'ko-KR';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;

        this.recognition.onresult = event => {
            const text = event.results[0][0].transcript;

            console.log('transcript', text);
            this.setState({text: text});

            let sayThis = new SpeechSynthesisUtterance(text)

            TextToSpeech.speak(sayThis)

            var output = {
                transcript: this.state.text
            }
            this.socket.emit('transcript', output)
            this.end()
            setTimeout(function () {
                this.setState({modalOpen: false})
            }.bind(this), 1500)
        };

        this.recognition.onspeechend = () => {
            console.log('stopped');

            this.setState({show: true});
        };

        this.recognition.onnomatch = event => {
            console.log('no match');
            this.setState({text: "또박또박!"});
        };

        this.recognition.onstart = () => {
            this.setState({
                text: '말씀하세요.',
            });
            setTimeout(function () {
                this.setState({
                    listening: true,
                    text: '듣는중..'
                })
            }.bind(this), 1000)
        };

        this.recognition.onend = () => {
            console.log('end');

            this.setState({
                listening: false,
            });

            this.end();
        };

        this.recognition.onerror = event => {
            console.log('error', event);

            this.setState({
                show: true,
                text: '마이크 상태를 확인하세요.',
            });
            setTimeout(function () {
                this.setState({modalOpen: false})
            }.bind(this), 1200)
        };
    }

    start() {
        this.recognition.start();
        this.setState({modalOpen: true})
    };

    end() {
        this.recognition.stop();
    };

    handleClose() {
        this.setState({show: false})
    };


    componentDidUpdate(prevProps, prevState) {
        this.historyChange = prevState.logs === this.state.logs

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

    handleModalOpen() {
        this.setState({modalOpen: true, x: true})
    }

    handleModalClose() {
        this.end()
        this.setState({modalOpen: false, x: false})
    }


    render() {
        const {activeChannel} = this.state
        const {activeOneOnOne} = this.state
        const users2 = this.searchUser(this.state.searchUserList);
        const channel = this.state.channelList.map(
            ({text}) => (
                <div>
                    {this.state.visibleList ?
                        <Menu.Menu>
                            <Menu.Item
                                name={text}
                                active={activeChannel === text}
                                onClick={this.handleItemClick}
                                style={{ float : 'left', width : '155'}}
                            />
                          {activeChannel === text ? <div>
                            <Icon name='circle' style={{ float : 'right',width : '20'}}/>
                            <p style={{ float : 'right',width : '38'}}>{this.state.givetextcount[this.state.activeChannelIndex]}
                           </p></div> :
                           <div>{this.state.givetextcount[this.state.channelList2.indexOf(text)]<1 ?
                          <Icon name='circle outline' style={{float: 'right'}}/> :
                             <Icon name='comment alternate outline' style={{float: 'right'}}/>}
                            <p style={{ float : 'right',width : '38'}}>{this.state.givetextcount[this.state.channelList2.indexOf(text)]}
                           </p></div>
                       }

                        </Menu.Menu> : ""}
                </div>)
        )

        const oneOnOne = this.state.oneOnOneList.map(
            ({text}) => (
                <div>
                    {this.state.visibleList2 ?
                        <Menu.Menu>
                            <Menu.Item
                                name={text}
                                active={activeOneOnOne === text}
                                onClick={this.handleItemClick2}
                            />
                        </Menu.Menu> : ""}
                </div>)
        )

        const ChannelUser = []
        for (var i = 0; i < this.state.memberList.length; i++) {
            ChannelUser.push(
                <Menu.Item
                    name={this.state.memberList[i]}
                />
            )
        }

        const userList = (
            <div>
                {this.state.activeOneOnOne === '' ?
                    <div className={this.state.activeChannel}>
                        <Popup
                            trigger={<Button circular
                                             icon="users"/>}
                            header='UserList'
                            content={ChannelUser}
                            position='bottom'
                            on={['hover', 'click']}
                        />
                    </div>
                    :
                    <div className={this.state.activeOneOnOne}>
                        <Popup
                            trigger={<Button circular
                                             icon="users"/>}
                            header='UserList'
                            content={ChannelUser}
                            position='bottom'
                            on={['hover', 'click']}
                        />
                    </div>
                }
            </div>
        )

        const chatView = (

            <div style={{height: 'calc(100% - 70px)'}}>

                <div ref='container' style={{height: '100%', overflowY: 'scroll', backgroundColor: '#D6D6D6'}}>

                    {this.state.activeChannel === '' ?
                        <Divider horizontal style={{color: '#455A64', fontSize: 10}}>{this.state.activeOneOnOne}님과 대화를
                            시작합니다.</Divider>
                        :
                        <Divider horizontal style={{color: '#455A64', fontSize: 10}}>{this.state.activeChannel}방에
                            입장하셨습니다.</Divider>}


                    {this.state.logs.map(e => (
                        e.roomId === this.state.activeChannel || e.roomId === this.state.activeOneOnOneRoomId ?
                            <div className={e.roomId} style={{paddingTop: 10}}>
                                {
                                    e.name !== this.props.currentUser ?
                                        // sender가 상대방일 때
                                        <Message
                                            authorName={e.name} date={e.time}>
                                            <MessageText>{e.message}</MessageText>
                                        </Message>
                                        :
                                        // sender가 본인일 때
                                        <Message isOwn deliveryStatus={e.time}>
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
            <div style={{width: '100%', height: 50}}>

                <Input
                    icon={<Button size='small'
                                  color='blue'
                                  onClick={() => {
                                      if (this.state.newMessage.length > 0) {
                                          this.handleSend()
                                      }
                                  }}
                                  icon='send'
                                  style={{width: 50}}
                    />}
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
                    style={{width: '100%', height: '100%', marginTop: 10}}
                />
            </div>
        )

        const SideView = (

            <div style={{
                width: '100%',
                height: '55%',
                backgroundColor: '#455A64',
                marginTop: 0,
                marginBottom: 0
            }}>
                <Menu inverted vertical
                      style={{
                          width: '100%',
                          height: '100%',
                          backgroundColor: '#455A64',
                          marginTop: 0,
                          marginBottom: 0
                      }}>
                    <Menu.Item style={{height: 100}}>
                        <Grid style={{height: 75, marginTop: 1, marginLeft: 1, marginRight: 1}}>
                            <Grid.Column style={{width: '100%', height: '100%', padding: 0}}>
                                <div>
                                    <Image avatar src={avartarImage} style={{width: 75, height: 75}}/>
                                    <span style={{marginLeft: 20}}>{this.props.currentUser}</span>
                                </div>

                            </Grid.Column>

                        </Grid>
                    </Menu.Item>

                    <Menu.Item style={{height: 'calc(100% - 100px)', overflowY: 'auto'}}>
                        <Menu.Header>
                            <label onClick={this.handleChannelShow}>
                                Channels
                            </label>
                            <Icon onClick={this.handleChannelAdd} name='add' style={{float: 'right'}}/>
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
                            </Menu.Item>
                            : ""}
                        <div>
                          {channel}
                        </div>
                    </Menu.Item>
                </Menu>
            </div>
        )

        const OneOnOneView = (
            <div style={{
                width: '100%',
                height: '45%',
                backgroundColor: '#455A64',
                marginTop: 0,
                marginBottom: 0
            }}>
                <Menu inverted vertical
                      style={{
                          width: '100%',
                          height: '90%',
                          backgroundColor: '#455A64',
                          marginTop: 0,
                          marginBottom: 0
                      }}>

                    <Menu.Item>
                    </Menu.Item>
                    <Menu.Item style={{height: '100%', overflowY: 'auto'}}>
                        <Menu.Header>
                            <label onClick={this.handleOneOnOneShow}>
                                OneOnOne
                            </label>
                            <Icon onClick={this.handleOneOnOneAdd} name='add' style={{float: 'right'}}/>
                        </Menu.Header>
                        {this.state.visibleAdd2 ?
                            <Menu.Item>
                                <Input as='search'
                                       transparent={true}
                                       icon='search'
                                       inverted placeholder='유저검색'
                                       value={this.state.searchUser}
                                       onChange={(e) => {
                                           const searchUserText = _.get(e, 'target.value');

                                           this.setState({
                                                   searchUserList: searchUserText,
                                                   showSearchUser: true,
                                               }
                                           );
                                       }}
                                       style={{marginTop: 10}}

                                />
                                {this.state.showSearchUser ?
                                    <div>
                                        {users2.map((user, index) => {
                                            return <div
                                                style={{
                                                    marginTop: 5,
                                                    marginBottom: 5
                                                }}
                                                onClick={(e) => {
                                                    var name = _.get(user, 'username')
                                                    var userId = _.get(user, 'email');
                                                    this.personalTalk(e, name, userId)
                                                }}
                                            >
                                                <p>{_.get(user, 'username', 'email')}</p>
                                            </div>
                                        })}

                                    </div> : ""}

                            </Menu.Item>
                            : ""}
                        {oneOnOne}
                    </Menu.Item>
                </Menu>
            </div>
        )


        const STT = (
            <div>
                <Modal
                    trigger={<Button circular
                                     icon="unmute"
                                     onClick={this.start}
                    />}
                    size='huge'
                    basic
                    // onClose={this.end}
                    open={this.state.modalOpen}
                    style={{height: '100%'}}
                >
                    <Modal.Header>음성인식</Modal.Header>
                    <Modal.Content style={{textAlign: 'center'}}>
                        <h1 style={{fontSize: 70, marginTop: 200}}>
                            {
                                this.state.text
                            }
                        </h1>
                        <Modal.Description>
                            <Icon circular
                                  inverted
                                  color='red'
                                  name="unmute"
                                  onClick={this.handleModalClose}
                                  size='huge'
                                  link
                                  style={{marginTop: 40}}
                            />
                        </Modal.Description>
                    </Modal.Content>
                </Modal>
            </div>

        )


        return (

            <Segment.Group>
                <Responsive
                    maxWidth={Responsive.onlyComputer.maxWidth}
                    minWidth={Responsive.onlyTablet.minWidth}
                >

                    <Grid stretched celled style={{
                        padding: 0,
                        marginTop: 0,
                        marginBottom: 0,
                        width: '100%',
                        height: 'calc(100vh - 60px)'
                    }}>
                        <Dimmer active={this.state.loading}>
                            <Loader active={this.state.loading}>채팅 불러오는중</Loader>
                        </Dimmer>
                        <Grid.Column stretched style={{width: 250, padding: 0, height: '100%'}}>
                            <div style={{height: '100%'}}>
                                {SideView}
                                {OneOnOneView}
                            </div>
                        </Grid.Column>
                        <Grid.Column style={{width: 'calc(100% - 310px)', padding: 0}}>
                            <div style={{height: '100%', textAlign: 'center'}}>
                                {chatView}
                                {inputView}
                            </div>
                        </Grid.Column>
                        <Grid.Column floated='right' style={{width: 60, backgroundColor: '#455A64'}}>
                            <List>
                                <List.Item>
                                    {STT}
                                </List.Item>
                                <List.Item style={{marginTop: 10}}>
                                    {userList}
                                </List.Item>
                            </List>
                        </Grid.Column>
                    </Grid>
                </Responsive>


                <Responsive {...Responsive.onlyMobile}>
                    <Sidebar.Pushable>
                        <Sidebar as={Menu} animation='uncover' visible={this.state.sidebarOpened}
                                 style={{backgroundColor: '#455A64'}}>
                            <Grid style={{height: 'calc(100vh - 55px)'}}>
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
                                            <Icon inverted name='user circle outline' size='huge'
                                                  style={{marginRight: 10}}/>
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
                                                           const searchUserText = _.get(e, 'target.value');

                                                           this.setState({
                                                                   searchUserList: searchUserText,
                                                                   showSearchUser: true,
                                                               }
                                                           );
                                                       }}
                                                       style={{marginTop: 10}}

                                                />
                                                {this.state.showSearchUser ?
                                                    <div>
                                                        {users2.map((user, index) => {
                                                            return <div
                                                                style={{
                                                                    marginTop: 5,
                                                                    marginBottom: 5
                                                                }}
                                                                onClick={(e) => {
                                                                    var name = _.get(user, 'username')
                                                                    var userId = _.get(user, 'email');
                                                                    this.personalTalk(e, name, userId)
                                                                }}
                                                            >
                                                                <p>{_.get(user, 'username', 'email')}</p>
                                                            </div>
                                                        })}

                                                    </div> : ""}

                                            </Menu.Item>
                                            : ""}
                                        {channel}
                                    </Menu.Item>
                                </Menu>
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
                                            </Menu.Header>

                                            {userList}

                                        </Menu.Item>
                                    </Menu>
                                </div>
                            </Grid>
                        </Sidebar>

                        <Sidebar.Pusher dimmed={this.state.sidebarOpened}
                                        onClick={this.handlePusherClick}
                                        style={{minHeight: 50}}>
                            <Menu>
                                <Menu.Item onClick={this.handleToggle}>
                                    <Icon name='sidebar'/>
                                </Menu.Item>
                            </Menu>
                        </Sidebar.Pusher>
                        <div style={{height: 'calc(100vh - 55px)'}}>
                            <div style={{height: '100%', textAlign: 'center'}}>
                                {chatView}
                                {inputView}
                            </div>
                        </div>

                    </Sidebar.Pushable>

                </Responsive>
            </Segment.Group>

        )
    }
}

const mapStateToProps = (state) => {
    return {
        isLoggedIn: state.authentication.status.isLoggedIn,
        status: state.authentication.status,
        currentUser: state.authentication.status.currentUser,
        currentEmail: state.authentication.status.currentEmail,
    }
}

export default connect(mapStateToProps)(ChatContainer)
