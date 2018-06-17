import React from 'react';
import {connect} from 'react-redux'
import {browserHistory, Link} from "react-router";
import faker from 'faker'
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
    Segment,
    Responsive,
    Dropdown,
    Search,
    Container
} from 'semantic-ui-react'
import {
    Message,
    MessageText,
} from '@livechat/ui-kit'
import '../index.css'
import avartarImage from '../images/avatar.jpg'
import {socketConnect} from 'socket.io-react'
import {getStatusRequest, logoutRequest} from "../actions/authentication";
import BotCharacter from '../components/BotCharacter'
import jerry from '../components/jerry'
import _ from 'underscore'


var audio = new Audio('audio_file.mp3');
var channelList3 = [];

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
            transcript: '',
            show: false,
            listening: false,
            text: '말씀하세요',
            modalOpen: false,
            sidebarOpened: false,
            oneOnOneList: [],
            oneOnOne: false,
            mobileView: false,
            channelORoneOnOne: false,
            x: false,
            isLoading: false,
            results: [],
            value: '',
            givetextcount: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
            givemessage: ["None","None","None","None","None","None","None","None","None","None",],
            activeChannelIndex: 0,
            recentMsg: [],
            recentLoading: true
        }


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
        this.speechstart = this.speechstart.bind(this)
        this.handleClose = this.handleClose.bind(this)
        this.handleModalOpen = this.handleModalOpen.bind(this)
        this.handleModalClose = this.handleModalClose.bind(this)
        this.roomChanged = this.roomChanged.bind(this)
        this.handleMobile = this.handleMobile.bind(this)
        this.handleChannel = this.handleChannel.bind(this)
        this.handleOneOnOne = this.handleOneOnOne.bind(this)
        this.resetComponent = this.resetComponent.bind(this)
        this.handleResultSelect = this.handleResultSelect.bind(this)
        this.handleSearchChange = this.handleSearchChange.bind(this)
        // this.audioQ = this.audioQ.bind(this)
        this.handleLogout = this.handleLogout.bind(this)
    }

    handleLogout() {
        const {socket} = this.props

        socket.emit('logout', this.props.currentEmail)
        console.log('로그아웃 소켓', this.props.currentEmail)

        this.props.logoutRequest().then(
            () => {
                browserHistory.push('/')
                message.success("로그아웃이 완료되었습니다.")

                // EMPTIES THE SESSION
                let loginData = {
                    isLoggedIn: false,
                    email: ''
                };

                document.cookie = 'key=' + btoa(JSON.stringify(loginData));
                socket.emit('logout', this.props.currentEmail)
                console.log('로그아웃 소켓')
            }
        );
    }

    // audioQ() {
    //     audio.play()
    //     console.log("dsfjkhfkjsdalhf");
    // }

    handleMobile() {
        this.setState({mobileView: !this.state.mobileView})
    }

    handleChannel() {
        this.setState({channelORoneOnOne: false})
    }

    handleOneOnOne() {
        this.setState({channelORoneOnOne: true})
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
        const {socket} = this.props
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
            socket.emit('oneonone', output)
            this.setState({
                oneOnOneList: this.state.oneOnOneList.concat({
                    text: output.receiver
                })
            })

            this.handleItemClick2(e, {name: output.receiver})
        }
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
            const {socket} = this.props
            socket.emit('room', output)
            this.setState({
                channelList: this.state.channelList.concat({
                    text: e.target.value
                })
            })
            this.state.channelList2.push(e.target.value)

            this.handleItemClick(e, {name: e.target.value})
        }
        this.setState({roomId: ''})


    }

    //Menu.Item에서 item을 클릭했을 때 그 채널을 활성화해주는 함수
    handleItemClick(e, {name}) {
        const {socket} = this.props
        const givetextcount = this.state.givetextcount
        givetextcount[this.state.channelList2.indexOf(name)] = "0"

        this.setState({activeChannel: name, activeOneOnOne: ''})
        this.setState({oneonone: false})

        var output = {
            command: 'join',
            roomId: name,
            id: this.props.currentUser,
            userEmail: this.props.currentEmail,
            oneonone: false
        }

        socket.emit('room', output)
        this.handleMobile()
    }

    handleItemClick2(e, {name}) {
        const {socket} = this.props

        this.setState({oneonone: true, showSearchUser: false})
        this.setState({activeOneOnOne: name, activeChannel: ''})

        var output = {
            command: 'join',
            roomId: name,
            id: this.props.currentUser,
            userEmail: this.props.currentEmail,
            oneonone: true
        }

        socket.emit('room', output)
        this.handleMobile()
    }   //sidebar

    //inputView에서 input박스에 입력된 메시지 내용을 받아오는 함수
    messageChanged(e) {
        this.setState({newMessage: e.target.value})
    }

    // command를 message로 하여 room 으로 emit
    handleSend() {
        const {socket} = this.props
        if (this.state.activeOneOnOne === '') {
            var output = {
                command: 'message',
                email: this.props.currentEmail,
                name: this.props.currentUser,
                message: this.state.newMessage,
                roomId: this.state.activeChannel,
                oneonone: this.state.oneonone
            }
            socket.emit('room', output)
            this.setState({newMessage: ''})
        }
        else if (this.state.activeChannel === '') {
            var output2 = {
                command: 'message',
                email: this.props.currentEmail,
                name: this.props.currentUser,
                message: this.state.newMessage,
                roomId: this.state.activeOneOnOne,
                oneonone: this.state.oneonone
            }
            socket.emit('room', output2)
            this.setState({newMessage: ''})
        }

    }

    resetComponent() {
        this.setState({isLoading: false, results: [], value: ''})
    }

    handleResultSelect(e, {result}) {
        this.personalTalk(e, result.title, result.description)
        this.setState({value: result.title})
    }

    handleSearchChange(e, {value}) {
        const source = this.state.users.map((user) => ({
            title: user.username,
            description: user.email,
        }))

        console.log('this.state.users', this.state.users)

        this.setState({isLoading: true, value})
        setTimeout(() => {
            if (this.state.value.length < 1) {
                return this.resetComponent()
            }

            const re = new RegExp(_.escapeRegExp(this.state.value), 'i')
            const isMatch = result => re.test(result.title)

            this.setState({
                isLoading: false,
                results: _.filter(source, isMatch),
            })
        }, 300)
    }


    componentWillMount() {
        this.resetComponent()

        const {socket} = this.props
        socket.on('message', (obj) => {
            const logs2 = this.state.logs
            obj.key = 'key_' + (this.state.logs.length + 1)
            logs2.push(obj) // 로그에 추가
            this.setState({logs: logs2})
            console.log('message',obj)




            // const TextToSpeech = window.speechSynthesis
            //
            // let sayThis = new SpeechSynthesisUtterance(obj.message)
            //
            // TextToSpeech.speak(sayThis)

            // if(obj.message.length > 17)
            // {
            //     var modifymeesage = obj.message.substring(0,17);
            //     modifymeesage = modifymeesage+"..."
            //     this.state.givemessage[this.state.channelList2.indexOf(obj.roomId)] = modifymeesage;
            //     console.log(obj.message.length);
            // }
            // else {
            //     this.state.givemessage[this.state.channelList2.indexOf(obj.roomId)] = obj.message;
            //     console.log(obj.message.length);
            // }
            // console.log('zzzzzzzzzzzzz',this.state.givemessage);
            //
            // if(this.state.activeChannel===obj.roomId){
            //     // this.state.givetextcount[this.state.channelList2.indexOf(this.state.activeChannel)]++;
            //     //   this.forceUpdate();
            // }
            // else{
            //     this.state.givetextcount[this.state.channelList2.indexOf(obj.roomId)]++;
            // }

            // if(obj.email!==this.props.currentEmail){
            //     this.audioQ()
            // }
        })

        var defaultRoom = 'main'    //채팅방에 입장시 기본 채팅방을 main으로 설정
        var output = {
            userEmail: this.props.currentEmail,
            id: this.props.currentUser,
            roomId: defaultRoom
        }
        // console.log("현재유저:",this.props.currentUser)
        if (this.props.currentUser !== '') {
            socket.emit('login', output)
        }

        this.setState({
            // roomId: defaultRoom,
            activeChannel: defaultRoom
        })



        if (this.state.oneOnOneList !== null) {
            socket.on('oneononelist', (oneononelist) => {
                this.setState({oneOnOneList: []})
                this.setState({
                    oneOnOneList: oneononelist.oneonones,
                })
                console.log('일대일리스트', this.state.oneOnOneList)
                for(var i = 0; i< this.state.oneOnOneList.length; i++){
                    var output = {
                        command: 'join',
                        roomId: this.state.oneOnOneList[i].text,
                        id: this.props.currentUser,
                        userEmail: this.props.currentEmail,
                        oneonone: true
                    }

                    socket.emit('room', output)
                }

            })
        }

        if (this.state.channelList !== null) {
            socket.on('channellist', (channellist) => {
                console.log('채널리스트', channellist)
                this.setState({channelList: []})
                this.setState({
                    channelList: this.state.channelList.concat(channellist.roomIds),
                })
                for(var i = 0; i< this.state.channelList.length; i++){
                    var output = {
                        command: 'join',
                        roomId: this.state.channelList[i].text,
                        id: this.props.currentUser,
                        userEmail: this.props.currentEmail,
                        oneonone: false
                    }
                    console.log('채널', output.roomId)

                    socket.emit('room', output)
                }

            })
        }

        socket.on('memberlist', (memberlist) => {
            this.setState({memberList: []})

            this.setState({
                memberList: memberlist.member
            })
        })

        socket.on('join', (join) => {
            this.setState({activeOneOnOneRoomId: join.roomId});
        })

        socket.on('premsg', (premsg) => {
            this.setState({premsg: premsg, loading: false});

            var premsgLength = this.state.premsg.length
            if (premsgLength < 15) {
                start = 0
            } else {
                var start = premsgLength - 15
            }
            var premsg_slice = this.state.premsg.slice(start, premsgLength)

            this.setState({logs: premsg_slice})
        })

        socket.on('usersearch', (userList) => {
            this.setState({users: this.state.users.concat(userList)})
        })

        socket.on('recentmsg', (recentmsg) => {
            this.setState({recentMsg: recentmsg, recentLoading: false})
            console.log('recentmsg', recentmsg)
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
                var premsg_slice2 = this.state.premsg.slice(st, fn)
                this.scrollPosition()
                this.setState({logs: this.state.logs.concat(premsg_slice2).sort(dynamicSort("chatCount"))})

            }
        }
    }

    componentDidMount() {
        const {socket} = this.props
        const {container} = this.refs

        container.addEventListener("scroll", () => {
            if (container.scrollTop === 0) {
                this.loadMoreChat()
            }
        })
        this.scrollDown()

        const Recognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        // const TextToSpeech =
        //     window.speechSynthesis
        //
        // let sayThis = new SpeechSynthesisUtterance(text)
        //
        // TextToSpeech.speak(sayThis)


        if (!Recognition) {
            alert(
                '크롬브라우저로 다시 시도하세요.'
            );
            return;
        }

        this.recognition = new Recognition();
        this.recognition.lang = process.env.REACT_APP_LANGUAGE || 'ko-KR';
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;

        this.recognition.onresult = event => {
            const text = event.results[0][0].transcript;

            console.log('transcript', text);
            this.setState({text: text});

            // let sayThis = new SpeechSynthesisUtterance(text)
            //
            // TextToSpeech.speak(sayThis)

            var output = {
                email: this.props.currentEmail,
                name: this.props.currentUser,
                transcript: this.state.text
            }
            socket.emit('transcript', output)
            this.recognition.onend()
        };

        this.recognition.onend = () => {
            if (this.state.modalOpen === false) {
                this.end()
                console.log('end')
            } else {
                this.end()
                this.start()
                console.log('end')
            }

        }


        this.recognition.onnomatch = event => {
            console.log('no match');
            this.setState({text: "또박또박!"});
        };

        this.recognition.onspeechstart = () => {
            console.log('소리 감지')
            this.setState({
                listening: true,
            })
        };


        this.recognition.onerror = event => {
            console.log('error', event);

            setTimeout(function () {
                this.setState({modalOpen: false})
            }.bind(this), 1200)
        };

        socket.on('request', (obj) => {
            console.log("obj", obj)
            if (obj.modal === true) {
                this.setState({
                    modalOpen: false
                })
            }
            if (obj.length === 1) {

                this.setState({
                    text: obj
                })

                console.log('text: ', this.state.text)
            }
            else if (obj.length === 2) {
                this.setState({
                    text: obj[0]
                })
                console.log('text: ', this.state.text)
                setTimeout(function () {
                    this.setState({
                        text: obj[1]
                    })
                    console.log('text: ', this.state.text)
                }.bind(this), 2000)
            }
        })



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

    speechstart() {
        this.recognition.onspeechstart()
    }


    componentDidUpdate(prevProps, prevState) {
        const {socket} = this.props
        this.historyChange = prevState.logs === this.state.logs

        var defaultRoom = 'main'

        if (this.props.currentUser !== prevProps.currentUser) {
            var output = {
                userEmail: this.props.currentEmail,
                id: this.props.currentUser,
                roomId: defaultRoom
            }
            if (this.props.currentUser !== '') {
                socket.emit('login', output)
            }
        }
        if (this.historyChange) {
            this.scrollDown()
        }

        if(this.state.recentMsg !== prevState.recentMsg) {
            console.log('시바')
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
        const {isLoading, value, results} = this.state
        const {activeChannel} = this.state
        const {activeOneOnOne} = this.state
        const logoutButton1 = (
            <Dropdown icon='bars' pointing='top right' style={{color: 'white', fontFamily: "Jeju Gothic"}}>
                <Dropdown.Menu>
                    <Dropdown.Item active='false' text={this.props.currentEmail}/>
                    <Dropdown.Divider/>
                    <Dropdown.Item icon='settings' text='프로필 수정' as={Link} to='/mypage'/>
                    <Dropdown.Item icon='sign out' text='로그아웃' onClick={this.handleLogout}/>
                </Dropdown.Menu>
            </Dropdown>

        )
        const logoutButton2 = (
            <Dropdown icon='bars' pointing='top right' style={{marginLeft: 5, fontFamily: "Jeju Gothic"}}>
                <Dropdown.Menu>
                    <Dropdown.Item active='false' text={this.props.currentEmail}/>
                    <Dropdown.Divider/>
                    <Dropdown.Item icon='settings' text='프로필 수정' as={Link} to='/mypage'/>
                    <Dropdown.Item icon='sign out' text='로그아웃' onClick={this.handleLogout}/>
                </Dropdown.Menu>
            </Dropdown>
        )

        const channel = this.state.channelList.map(
            ({text}) => (
                <div>
                    {this.state.visibleList ?
                        <Menu.Menu>
                            {activeChannel === text ?
                                <div>
                                <Menu.Item
                                    name={text}
                                    active={activeChannel === text}
                                    onClick={this.handleItemClick}
                                    style={{float: 'left', width: '155', fontFamily: "Jeju Gothic", fontStyle: 'normal'}}
                                />
                                <Icon name='circle' size='small' color='green'
                                style={{float: 'right', marginTop: 5}}/>
                                </div>
                                :
                                <Menu.Item
                                    name={text}
                                    active={activeChannel === text}
                                    onClick={this.handleItemClick}
                                    style={{float: 'left', width: '155', fontFamily: "Jeju Gothic", fontStyle: 'normal'}}
                                />
                            }
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

        const mobileChannel = this.state.channelList.map(
            ({text}) => (
                <div>
                    <Item as='a'>
                        <Item.Content>
                            <Item.Header>
                                <Header size='small'>
                                    <Menu.Item
                                        name={text}
                                        active={activeChannel === text}
                                        onClick={this.handleItemClick}
                                        style={{fontFamily: "Jeju Gothic"}}
                                    />
                                </Header>
                            </Item.Header>
                            <Item.Description>
                                {this.state.recentMsg.map((e) => (

                                    e.roomId === text ?
                                        <div style={{fontFamily: "Jeju Gothic"}}>{e.message}</div> : ''


                                ))}
                            </Item.Description>
                        </Item.Content>
                    </Item>
                    <Divider fitted style={{marginTop: 5, marginBottom: 5}}/>
                </div>
            )
        )

        const mobileOneOnOne = this.state.oneOnOneList.map(
            ({text}) => (
                <div>
                    <Item as='a'>
                        <Item.Content>
                            <Item.Header>
                                <Header size='small'>
                                    <Menu.Item
                                        name={text}
                                        active={activeOneOnOne === text}
                                        onClick={this.handleItemClick2}
                                        style={{fontFamily: "Jeju Gothic"}}
                                    />
                                </Header>
                            </Item.Header>
                            <Item.Description>
                                {this.state.recentMsg.map((e) => (

                                    e.roomId.match(text) ?
                                        <div style={{fontFamily: "Jeju Gothic"}}>{e.message}</div> : ''


                                ))}
                            </Item.Description>
                        </Item.Content>
                    </Item>
                    <Divider fitted style={{marginTop: 5, marginBottom: 5}}/>
                </div>
            )
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
                                style={{fontFamily: "Jeju Gothic"}}
                            />
                        </Menu.Menu> : ""}
                </div>)
        )


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
                        <Divider horizontal style={{color: '#455A64', fontSize: 11, opacity: 0.8, fontFamily: "Jeju Gothic"}}>{this.state.activeOneOnOne}님과 대화를
                            시작합니다.</Divider>
                        :
                        <Divider horizontal style={{color: '#455A64', fontSize: 11, opacity: 0.8, fontFamily: "Jeju Gothic"}}>{this.state.activeChannel}방에
                            입장하셨습니다.</Divider>}


                    {this.state.logs.map(e => (
                        e.roomId === this.state.activeChannel || e.roomId === this.state.activeOneOnOneRoomId ?
                            <div className={e.roomId} style={{paddingTop: 10}}>
                                {
                                    e.name !== this.props.currentUser ?
                                        // sender가 상대방일 때
                                        <Message
                                            authorName={e.name} date={e.time}>
                                            <MessageText style={{fontFamily: "Jeju Gothic"}}>{e.message}</MessageText>
                                        </Message>
                                        :
                                        // sender가 본인일 때
                                        <Message isOwn deliveryStatus={e.time}>
                                            <MessageText style={{fontFamily: "Jeju Gothic"}}>{e.message}</MessageText>
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
            <div style={{width: '100%', height: 70}}>

                <Input
                    icon={<Icon name='send'
                                color='blue'
                                link
                                size='large'
                                onClick={() => {
                                    if (this.state.newMessage.length > 0) {
                                        this.handleSend()
                                    }
                                }}
                                style={{height: 70}}
                    />}

                    type='text'
                    placeholder='메시지를 입력하세요.'
                    value={this.state.newMessage}
                    onChange={e => this.messageChanged(e)}
                    onKeyPress={e => {
                        if (e.key === 'Enter' && this.state.newMessage.length > 0) {
                            this.handleSend()
                        }
                    }}
                    style={{width: '100%', height: '100%'}}
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
                <Menu inverted vertical size='huge'
                      style={{
                          width: '100%',
                          height: '100%',
                          backgroundColor: '#455A64',
                          marginTop: 0,
                          marginBottom: 0,
                      }}>
                    <Menu.Item style={{height: 100}}>
                        <Grid style={{height: 75, marginTop: 1, marginLeft: 1, marginRight: 1}}>
                            <Grid.Column style={{width: '100%', height: '100%', padding: 0}}>
                                <div>
                                    <Image avatar src={avartarImage} style={{width: 75, height: 75}}/>
                                    <span style={{marginLeft: 20, fontFamily: "Jeju Gothic"}}>{this.props.currentUser}</span>
                                </div>
                            </Grid.Column>

                        </Grid>
                    </Menu.Item>

                    <Menu.Item style={{height: 'calc(100% - 100px)', overflowY: 'auto'}}>
                        <Menu.Header>
                            <label onClick={this.handleChannelShow}>
                                Channels
                            </label>
                            <Icon onClick={this.handleChannelAdd} link name='angle down' style={{float: 'right'}}/>
                        </Menu.Header>
                        {this.state.visibleAdd ?
                            <Menu.Item style={{fontFamily: "Jeju Gothic"}}>
                                <Search
                                    icon='add'
                                    showNoResults={false}
                                    onKeyPress={e => {
                                        e.key === 'Enter' && this.handleRoomCreate(e)
                                    }}
                                    onSearchChange={e => this.roomChanged(e)}
                                    value={this.state.roomId}
                                    size='mini'
                                />
                            </Menu.Item>
                            : ""}
                        {channel}
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
                <Menu inverted vertical size='huge'
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
                            <Icon onClick={this.handleOneOnOneAdd} link name='angle down' style={{float: 'right'}}/>
                        </Menu.Header>
                        {this.state.visibleAdd2 ?
                            <Menu.Item>
                                <Search
                                    loading={isLoading}
                                    onResultSelect={this.handleResultSelect}
                                    onSearchChange={_.debounce(this.handleSearchChange, 500, {leading: true})}
                                    results={results}
                                    value={value}
                                    size='mini'
                                    {...this.props}
                                />
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

        const WidgetSTT = (
            <div>
                <Modal
                    trigger={<Button circular
                                     icon="unmute"
                                     size='massive'
                                     color='blue'
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

        const bot = (
            <div>
                <svg className="ghost" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
                     xmlnshref="http://www.w3.org/1999/xlink" x="0px" y="0px" width="127.433px" height="132.743px"
                     viewBox="0 0 127.433 132.743" enableBackground="new 0 0 127.433 132.743" xmlSpace="preserve">
                    <path fill="#FFF6F4" d="M116.223,125.064c1.032-1.183,1.323-2.73,1.391-3.747V54.76c0,0-4.625-34.875-36.125-44.375
	s-66,6.625-72.125,44l-0.781,63.219c0.062,4.197,1.105,6.177,1.808,7.006c1.94,1.811,5.408,3.465,10.099-0.6
	c7.5-6.5,8.375-10,12.75-6.875s5.875,9.75,13.625,9.25s12.75-9,13.75-9.625s4.375-1.875,7,1.25s5.375,8.25,12.875,7.875
	s12.625-8.375,12.625-8.375s2.25-3.875,7.25,0.375s7.625,9.75,14.375,8.125C114.739,126.01,115.412,125.902,116.223,125.064z"/>
                    <circle fill="#013E51" cx="86.238" cy="57.885" r="6.667"/>
                    <circle fill="#013E51" cx="40.072" cy="57.885" r="6.667"/>
                    <path fill="#013E51" d="M71.916,62.782c0.05-1.108-0.809-2.046-1.917-2.095c-0.673-0.03-1.28,0.279-1.667,0.771
	c-0.758,0.766-2.483,2.235-4.696,2.358c-1.696,0.094-3.438-0.625-5.191-2.137c-0.003-0.003-0.007-0.006-0.011-0.009l0.002,0.005
	c-0.332-0.294-0.757-0.488-1.235-0.509c-1.108-0.049-2.046,0.809-2.095,1.917c-0.032,0.724,0.327,1.37,0.887,1.749
	c-0.001,0-0.002-0.001-0.003-0.001c2.221,1.871,4.536,2.88,6.912,2.986c0.333,0.014,0.67,0.012,1.007-0.01
	c3.163-0.191,5.572-1.942,6.888-3.166l0.452-0.453c0.021-0.019,0.04-0.041,0.06-0.061l0.034-0.034
	c-0.007,0.007-0.015,0.014-0.021,0.02C71.666,63.771,71.892,63.307,71.916,62.782z"/>
                    <circle fill="#FCEFED" stroke="#FEEBE6" strokeMiterlimit={10} cx="18.614" cy="99.426" r="3.292"/>
                    <circle fill="#FCEFED" stroke="#FEEBE6" strokeMiterlimit={10} cx="95.364" cy="28.676" r="3.291"/>
                    <circle fill="#FCEFED" stroke="#FEEBE6" strokeMiterlimit={10} cx="24.739" cy="93.551" r="2.667"/>
                    <circle fill="#FCEFED" stroke="#FEEBE6" strokeMiterlimit={10} cx="101.489" cy="33.051" r="2.666"/>
                    <circle fill="#FCEFED" stroke="#FEEBE6" strokeMiterlimit={10} cx="18.738" cy="87.717" r="2.833"/>
                    <path fill="#FCEFED" stroke="#FEEBE6" strokeMiterlimit={10} d="M116.279,55.814c-0.021-0.286-2.323-28.744-30.221-41.012
	c-7.806-3.433-15.777-5.173-23.691-5.173c-16.889,0-30.283,7.783-37.187,15.067c-9.229,9.736-13.84,26.712-14.191,30.259
	l-0.748,62.332c0.149,2.133,1.389,6.167,5.019,6.167c1.891,0,4.074-1.083,6.672-3.311c4.96-4.251,7.424-6.295,9.226-6.295
	c1.339,0,2.712,1.213,5.102,3.762c4.121,4.396,7.461,6.355,10.833,6.355c2.713,0,5.311-1.296,7.942-3.962
	c3.104-3.145,5.701-5.239,8.285-5.239c2.116,0,4.441,1.421,7.317,4.473c2.638,2.8,5.674,4.219,9.022,4.219
	c4.835,0,8.991-2.959,11.27-5.728l0.086-0.104c1.809-2.2,3.237-3.938,5.312-3.938c2.208,0,5.271,1.942,9.359,5.936
	c0.54,0.743,3.552,4.674,6.86,4.674c1.37,0,2.559-0.65,3.531-1.932l0.203-0.268L116.279,55.814z M114.281,121.405
	c-0.526,0.599-1.096,0.891-1.734,0.891c-2.053,0-4.51-2.82-5.283-3.907l-0.116-0.136c-4.638-4.541-7.975-6.566-10.82-6.566
	c-3.021,0-4.884,2.267-6.857,4.667l-0.086,0.104c-1.896,2.307-5.582,4.999-9.725,4.999c-2.775,0-5.322-1.208-7.567-3.59
	c-3.325-3.528-6.03-5.102-8.772-5.102c-3.278,0-6.251,2.332-9.708,5.835c-2.236,2.265-4.368,3.366-6.518,3.366
	c-2.772,0-5.664-1.765-9.374-5.723c-2.488-2.654-4.29-4.395-6.561-4.395c-2.515,0-5.045,2.077-10.527,6.777
	c-2.727,2.337-4.426,2.828-5.37,2.828c-2.662,0-3.017-4.225-3.021-4.225l0.745-62.163c0.332-3.321,4.767-19.625,13.647-28.995
	c3.893-4.106,10.387-8.632,18.602-11.504c-0.458,0.503-0.744,1.165-0.744,1.898c0,1.565,1.269,2.833,2.833,2.833
	c1.564,0,2.833-1.269,2.833-2.833c0-1.355-0.954-2.485-2.226-2.764c4.419-1.285,9.269-2.074,14.437-2.074
	c7.636,0,15.336,1.684,22.887,5.004c26.766,11.771,29.011,39.047,29.027,39.251V121.405z"/>
                </svg>
                <p className="shadowFrame">
                    <svg version="1.1" className="shadow" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
                         xmlnsXlink="http://www.w3.org/1999/xlink" x="61px" y="20px" width="122.436px" height="39.744px"
                         viewBox="0 0 122.436 39.744" enableBackground="new 0 0 122.436 39.744" xmlSpace="preserve">
                        <ellipse fill="#666564" cx="61.128" cy="19.872" rx="49.25" ry="8.916"/>
                    </svg>
                </p>
            </div>
        )

        const jerry = (

            <div className="jerry">
                <div className="lights">
                    <span className="white_light" />
                    <span className="dark_light" />
                </div>
                <div className="jerry_hair">
                    <ul>
                        <li className="h1" />
                        <li className="h2" />
                        <li className="h3" />
                        <li className="h4" />
                        <li className="h5" />
                        <li className="h6" />
                        <li className="h7" />
                        <li className="h8" />
                        <li className="h9" />
                        <li className="h10" />
                        <li className="h11" />
                        <li className="h12" />
                    </ul>
                </div>
                <div className="eyes1">
                    <div className="eye_animate" />
                    <div className="glasses" />
                    <div className="white_part">
                        <div className="brown_eye">
                            <span className="black_part" />
                        </div>
                    </div>
                </div>
                <div className="eyes2">
                    <div className="eye_animate" />
                    <div className="glasses" />
                    <div className="white_part">
                        <div className="brown_eye">
                            <span className="black_part" />
                        </div>
                    </div>
                </div>
                <div className="jerry_hand">
                    <div className="jerry_lh" />
                    <div className="animated_lh">
                        <span className="gloves_lh" />
                        <span className="gloves_lh2" />
                    </div>
                    <div className="jerry_rh" />
                    <span className="gloves_rh" />
                </div>
                <div className="black_tie">
          <span className="right_tie">
            <div className="top_tie" />
            <div className="down_tie" />
          </span>
                    <span className="left_tie">
            <div className="top_tie" />
            <div className="down_tie" />
          </span>
                </div>
                <div className="jerry_smile">
                    <span className="teeth1" />
                    <span className="teeth2" />
                </div>
                <div className="curves">
                    <span className="jerry_curve1" />
                    <span className="jerry_curve1 jerry_left_curve" />
                    <span className="jerry_curve2" />
                </div>
                <div className="clothes">
                    <div className="main_jerry" />
                    <div className="right_shirt jerry_right_shirt" />
                    <div className="right_shirt jerry_left_shirt" />
                    <div className="jerry_bottom" />
                </div>
                <div className="pocket">
                    <div className="logo" />
                    <span className="lines" />
                </div>
                <div className="legs">
                    <div className="jerry_shoes"><span className="jerry_small_shoes" /></div>
                    <div className="jerry_shoes jerry_left_shoes"><span className="jerry_small_shoes" /></div>
                </div>
            </div>

        )


        const MobileListView = (
            <div>
                <Segment attached vertical tertiary textAlign='center' style={{
                    width: '100%',
                    marginTop: 0,
                    marginBottom: 0,
                    paddingLeft: 13,
                    paddingRight: 13,
                    paddingTop: 10,
                    backgroundColor: '#f5f5f5'
                }}>
                    {this.state.channelORoneOnOne === false ?
                        <Button.Group widths={2} style={{width: 200, marginBottom: 10}}>
                            <Button color='blue' onClick={this.handleChannel} style={{fontFamily: "Jeju Gothic"}}>채널</Button>
                            <Button basic color='blue' onClick={this.handleOneOnOne} style={{fontFamily: "Jeju Gothic"}}>일대일</Button>
                        </Button.Group>
                        :
                        <Button.Group widths={2} style={{width: 200, marginBottom: 10}}>
                            <Button basic color='blue' onClick={this.handleChannel} style={{fontFamily: "Jeju Gothic"}}>채널</Button>
                            <Button color='blue' onClick={this.handleOneOnOne} style={{fontFamily: "Jeju Gothic"}}>일대일</Button>
                        </Button.Group>}
                    {this.state.channelORoneOnOne === false ?
                        <Input as='search'
                               icon='search'
                               placeholder='채널검색'
                               value={this.state.roomId}
                               onChange={e => this.roomChanged(e)}
                               onKeyPress={e => {
                                   e.key === 'Enter' && this.handleRoomCreate(e)
                               }}
                               style={{width: '100%'}}
                        />
                        :
                        <Search
                            input={{fluid: true, placeholder: '사람검색'}}
                            loading={isLoading}
                            onResultSelect={this.handleResultSelect}
                            onSearchChange={_.debounce(this.handleSearchChange, 500, {leading: true})}
                            results={results}
                            value={value}
                            noResultsMessage='존재하지 않습니다.'
                            style={{width: '100%'}}
                            {...this.props}
                        />}

                </Segment>
                {this.state.channelORoneOnOne === false ?
                    <div style={{
                        overflowY: 'auto',
                        height: 'calc(100vh - 169px)',
                        paddingLeft: 15,
                        paddingRight: 15,
                        paddingTop: 10,
                        outline: 0
                    }}>{mobileChannel}</div>
                    :
                    <div style={{
                        overflowY: 'auto',
                        height: 'calc(100vh - 169px)',
                        paddingLeft: 15,
                        paddingRight: 15,
                        paddingTop: 10,
                        outline: 0
                    }}>{mobileOneOnOne}</div>}
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
                    <div>
                        {this.state.mobileView ?
                            <Menu compact secondary icon attached='top' style={{
                                width: '100vh',
                                height: 55,
                                backgroundColor: '#c4c4c4',
                                opacity: 0.8,
                                position: 'absolute',
                                zIndex: 3
                            }}>
                                <Menu.Item
                                    onClick={this.handleMobile}
                                    style={{width: 50}}
                                >
                                    <Icon name='angle left' size='big'/>
                                </Menu.Item>
                                <Menu.Item style={{width: 'calc(100% - 170px)'}}>
                                    <Header style={{width: '100%'}}>
                                        {this.state.channelORoneOnOne ? this.state.activeOneOnOne : this.state.activeChannel}
                                    </Header>
                                </Menu.Item>
                                <Menu.Item
                                    position='right'
                                    style={{width: 100}}
                                >
                                    {STT}
                                    {logoutButton2}
                                </Menu.Item>
                            </Menu>
                            :
                            <Menu compact secondary icon attached='top' style={{
                                width: '100vh',
                                height: 55,
                                backgroundColor: '#1279c6',
                                opacity: 0.8,
                                position: 'absolute',
                                zIndex: 3
                            }}>
                                <Menu.Item
                                    onClick={this.handleMobile}
                                    style={{width: 50}}
                                >
                                    <Icon inverted name='angle left' size='big'/>
                                </Menu.Item>
                                <Menu.Item style={{width: 'calc(100% - 140px)'}}>
                                    <div style={{
                                        textAlign: 'center',
                                        width: '100%',
                                        height: '100%',
                                        color: 'white',
                                        fontSize: 30,
                                        fontFamily: 'Quicksand'
                                    }}>
                                        Talky
                                    </div>
                                </Menu.Item>
                                <Menu.Item
                                    position='right'
                                >
                                    {logoutButton1}
                                </Menu.Item>
                            </Menu>
                        }

                        {this.state.mobileView ?
                            <div style={{height: 'calc(100vh - 5px)', top: 0, zIndex: 2}}>
                                <Dimmer active={this.state.loading}>
                                    <Loader active={this.state.loading}>채팅 불러오는중</Loader>
                                </Dimmer>
                                {chatView}
                                {inputView}
                            </div>
                            :
                            <div style={{marginTop: 55}}>
                                <Dimmer active={this.state.recentLoading}>
                                    <Loader active={this.state.recentLoading}>목록 불러오는중</Loader>
                                </Dimmer>
                                {MobileListView}
                                <div style={{position: 'absolute', bottom: '3.5%', right: '5%'}}>
                                    {WidgetSTT}
                                </div>

                                <div style={{height: 0}}>
                                    {chatView}
                                </div>
                            </div>
                        }
                    </div>


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

const mapDispatchToProps = (dispatch) => {
    return {
        getStatusRequest: () => {
            return dispatch(getStatusRequest())
        },
        logoutRequest: () => {
            return dispatch(logoutRequest())
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(socketConnect(ChatContainer))