import React from 'react';
import {connect} from 'react-redux'
import {browserHistory} from "react-router";
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
    Checkbox,
} from 'semantic-ui-react'
import {
    Message,
    MessageText,
} from '@livechat/ui-kit'
import '../index.css'
import avartarImage from '../images/avatar.jpg'
import {socketConnect} from 'socket.io-react'
import {getStatusRequest, logoutRequest} from "../actions/authentication";

import {BotCharacter} from 'components'
import './styles2'
import './slide.less'
import _ from 'lodash'


// var audio = new Audio('audio_file.mp3');

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
            livetext: '',
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
            givemessage: ["None", "None", "None", "None", "None", "None", "None", "None", "None", "None",],
            activeChannelIndex: 0,
            recentMsg: [],
            recentLoading: true,
            liveSTT: false,
            live: false,
            main: true
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
        this.personalTalk = this.personalTalk.bind(this)
        this.start = this.start.bind(this)
        this.end = this.end.bind(this)
        this.livestart = this.livestart.bind(this)
        this.liveend = this.liveend.bind(this)
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
        const {socket} = this.props
        var c = 1;
        var output = {
            command: 'create',
            userEmail: this.props.currentEmail,
            roomId: e.target.value,
            id: this.props.currentUser,
        }
        var output2 = {
            command: 'join',
            roomId: e.target.value,
            id: this.props.currentUser,
            userEmail: this.props.currentEmail,
            oneonone: false
        }


        this.setState({activeChannel: e.target.value, activeOneOnOne: ''})



        for (var i = 0; i < this.state.channelList.length; i++) {

            if (this.state.channelList[i].text === e.target.value) {
                c = 0;
                i = this.state.channelList.length;
                socket.emit('room', output2)
            }
        }

        if (c === 1) {
            socket.emit('room', output)
            socket.emit('room', output2)
            this.setState({
                channelList: this.state.channelList.concat({
                    text: e.target.value
                })
            })
        }
        this.setState({roomId: ''})


    }

    //Menu.Item에서 item을 클릭했을 때 그 채널을 활성화해주는 함수
    handleItemClick(e, {name}) {
        this.setState({main: false})
        const {socket} = this.props

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
        this.setState({main: false})

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


    componentWillMount() {
        this.setState({main: true})
        this.resetComponent()

        const {socket} = this.props
        socket.on('message', (obj) => {
            const logs2 = this.state.logs
            obj.key = 'key_' + (this.state.logs.length + 1)
            logs2.push(obj) // 로그에 추가
            this.setState({logs: logs2})
            console.log('message', obj)
            // const TextToSpeech = window.speechSynthesis
            //
            // let sayThis = new SpeechSynthesisUtterance(obj.message)
            //
            // TextToSpeech.speak(sayThis)


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
        if (this.props.currentUser !== '') {
            socket.emit('login', output)
        }

        this.setState({
            activeChannel: defaultRoom
        })

        if (this.state.oneOnOneList !== null) {
            socket.on('oneononelist', (oneononelist) => {
                this.setState({oneOnOneList: []})
                this.setState({
                    oneOnOneList: oneononelist.oneonones,
                })
                console.log('일대일리스트', this.state.oneOnOneList)
                // for (var i = 0; i < this.state.oneOnOneList.length; i++) {
                //     var output = {
                //         command: 'join',
                //         roomId: this.state.oneOnOneList[i].text,
                //         id: this.props.currentUser,
                //         userEmail: this.props.currentEmail,
                //         oneonone: true
                //     }
                //     socket.emit('room', output)
                //
                // }


            })
        }

        if (this.state.channelList !== null) {
            socket.on('channellist', (channellist) => {
                console.log('채널리스트', channellist)
                this.setState({channelList: []})
                this.setState({
                    channelList: this.state.channelList.concat(channellist.roomIds),
                })
                // for (var i = 0; i < this.state.channelList.length; i++) {
                //     var output = {
                //         command: 'join',
                //         roomId: this.state.channelList[i].text,
                //         id: this.props.currentUser,
                //         userEmail: this.props.currentEmail,
                //         oneonone: false
                //     }
                //     console.log('채널', output.roomId)
                //
                //     socket.emit('room', output)
                // }

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

        const TextToSpeech =
            window.speechSynthesis

        if (!Recognition) {
            alert(
                '크롬브라우저로 다시 시도하세요.'
            )
            return;
        }

        this.recognition = new Recognition();
        this.recognition.lang = process.env.REACT_APP_LANGUAGE || 'ko-KR';
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;

        this.liverecognition = new Recognition();
        this.liverecognition.lang = process.env.REACT_APP_LANGUAGE || 'ko-KR';
        this.liverecognition.continuous = true;
        this.liverecognition.interimResults = false;
        this.liverecognition.maxAlternatives = 1;

        this.recognition.onresult = event => {
            const text = event.results[0][0].transcript;

            console.log('transcript', text);
            this.setState({text: text});

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

        // 라이브챗팅

        this.liverecognition.onresult = event => {
            const text = event.results[0][0].transcript;

            console.log('livetranscript', text);
            this.setState({livetext: text});

            var output = {
                command: 'call',
                email: this.props.currentEmail,
                id: this.props.currentUser,
                transcript: this.state.livetext,
                roomId: this.state.activeOneOnOne,
                possibility: this.state.liveSTT
            }
            socket.emit('room', output)
            this.liverecognition.onend()
        };

        this.liverecognition.onend = () => {
            if (this.state.liveSTT === false) {
                console.log('liveSTT상태', this.state.liveSTT)
                this.liverecognition.stop();
                console.log('live end1')
            } else {
                this.liverecognition.stop();
                console.log('live end2')
                this.liverecognition.start();
                console.log('live 재시작')
            }
        }


        this.liverecognition.onspeechstart = () => {
            console.log('소리 감지')
            this.setState({
                listening: true,
            })
        };

        // this.liverecognition.onerror = event => {
        //     console.log('liveerror', event);
        //
        //     setTimeout(function () {
        //         this.setState({liveSTT: false})
        //     }.bind(this), 1200)
        // };

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

        socket.on('recall', (obj) => {
            let sayThis = new SpeechSynthesisUtterance(obj.message)
            TextToSpeech.speak(sayThis)
        })

        socket.on('reject', (obj) => {
            this.setState({liveSTT: obj.possibility})
            this.liverecognition.stop();
        })

        socket.on('transcript-end', (obj) => {
            this.handleModalClose()
        })
    }

    start() {
        this.recognition.start();
        this.setState({modalOpen: true})
    }

    end() {
        this.recognition.stop();
    }

    livestart() {
        this.setState({liveSTT: !this.state.liveSTT})

        setTimeout(function () {
            if (this.state.liveSTT === true) {
                this.liverecognition.start();
            } else {
                this.liverecognition.stop();
            }
        }.bind(this), 100)

        console.log('라이브챗')
    }

    liveend() {
        this.liverecognition.stop();
    }

    handleClose() {
        this.setState({show: false})
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
                                        style={{
                                            float: 'left',
                                            width: '155',
                                            fontFamily: "Jeju Gothic",
                                            fontStyle: 'normal'
                                        }}
                                    />
                                    <Icon name='circle' size='small' color='green'
                                          style={{float: 'right', marginTop: 5}}/>
                                </div>
                                :
                                <Menu.Item
                                    name={text}
                                    active={activeChannel === text}
                                    onClick={this.handleItemClick}
                                    style={{
                                        float: 'left',
                                        width: '155',
                                        fontFamily: "Jeju Gothic",
                                        fontStyle: 'normal'
                                    }}
                                />
                            }
                        </Menu.Menu> : ""}
                </div>

            )
        )


        const ChannelUser = []
        for (var i = 0; i < this.state.memberList.length; i++) {
            if (this.props.currentUser !== this.state.memberList[i]) {
                ChannelUser.push(
                    <Menu.Item
                        name={this.state.memberList[i]}
                        style={{fontFamily: "Jeju Gothic", fontSize: 13}}
                    />
                )
            }
        }


        const mobileChannel = this.state.channelList.map(
            ({text}) => (
                // text !== 'main' ?
                <div>
                    <Item as='a'>
                        <Item.Content>
                            <Item.Header>
                                <Header size='small'>
                                    <Menu.Item
                                        name={text}
                                        active={activeChannel === text}
                                        onClick={this.handleItemClick}
                                        style={{fontFamily: "Jeju Gothic", color: '#424b5b'}}
                                    />
                                </Header>
                            </Item.Header>
                            <Item.Description>
                                {this.state.recentMsg.map((e) => (

                                    e.roomId === text ?
                                        <div
                                            style={{fontFamily: "Jeju Gothic", color: '#4f596b'}}>{e.message}</div> : ''


                                ))}
                            </Item.Description>
                        </Item.Content>
                    </Item>
                    <Divider fitted style={{marginTop: 5, marginBottom: 5}}/>
                </div>
                // :
                // <div>
                // </div>
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
                                        style={{fontFamily: "Jeju Gothic", color: '#424b5b'}}
                                    />
                                </Header>
                            </Item.Header>
                            <Item.Description>
                                {this.state.recentMsg.map((e) => (

                                    e.roomId.match(text) ?
                                        <div
                                            style={{fontFamily: "Jeju Gothic", color: '#4f596b'}}>{e.message}</div> : ''


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
                            header='대화상대'
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

        const logoutButton1 = (
            <Dropdown icon='bars' pointing='top right' style={{color: 'white', fontFamily: "Jeju Gothic"}}>
                <Dropdown.Menu>
                    <Dropdown.Item active='false' text={this.props.currentEmail}/>
                    <Dropdown.Divider/>
                    <Dropdown.Item icon='sign out' text='로그아웃' onClick={this.handleLogout}/>
                </Dropdown.Menu>
            </Dropdown>

        )
        const logoutButton2 = (
            <Dropdown icon='bars' pointing='top right' style={{marginLeft: 5, fontFamily: "Jeju Gothic"}}>
                <Dropdown.Menu>
                    <Dropdown.Item active='false' text={this.props.currentEmail}/>
                    <Dropdown.Divider/>
                    <Dropdown.Item icon='users' text='대화상대'/>
                    <Dropdown.Divider/>
                    {this.state.activeOneOnOne === '' ?
                        <div className={this.state.activeChannel}>
                            <Item>
                                <Item.Content>
                                    <Item.Header>
                                        <Header size='small'>
                                            {ChannelUser}
                                        </Header>
                                    </Item.Header>
                                </Item.Content>
                            </Item>
                        </div>
                        :
                        <div className={this.state.activeOneOnOne}>
                            <Item>
                                <Item.Content>
                                    <Item.Header>
                                        <Header size='small'>
                                            {ChannelUser}
                                        </Header>
                                    </Item.Header>
                                </Item.Content>
                            </Item>
                        </div>
                    }
                    <Dropdown.Divider/>
                    <Dropdown.Item icon='sign out' text='로그아웃' onClick={this.handleLogout}/>
                </Dropdown.Menu>
            </Dropdown>
        )

        const chatView = (

            <div style={{height: 'calc(100% - 70px)'}}>

                <div ref='container' style={{height: '100%', overflowY: 'scroll', backgroundColor: '#D6D6D6'}}>

                    {this.state.activeChannel === '' ?
                        <Divider horizontal style={{
                            color: '#455A64',
                            fontSize: 11,
                            opacity: 0.8,
                            fontFamily: "Jeju Gothic"
                        }}>{this.state.activeOneOnOne}님과 대화를
                            시작합니다.</Divider>
                        :
                        <Divider horizontal style={{
                            color: '#455A64',
                            fontSize: 11,
                            opacity: 0.8,
                            fontFamily: "Jeju Gothic"
                        }}>{this.state.activeChannel}방에
                            입장하셨습니다.</Divider>}


                    {this.state.logs.map(e => (
                        e.roomId === this.state.activeChannel || e.roomId === this.state.activeOneOnOneRoomId ?
                            <div className={e.roomId} style={{paddingTop: 10}}>
                                {
                                    e.name !== this.props.currentUser ?
                                        // sender가 상대방일 때
                                        <Message
                                            authorName={e.name} date={e.time}
                                            style={{fontFamily: "Jeju Gothic", fontSize: 12}}>
                                            <MessageText>{e.message}</MessageText>
                                        </Message>
                                        :
                                        // sender가 본인일 때
                                        <Message isOwn deliveryStatus={e.time}
                                                 style={{fontFamily: "Jeju Gothic", fontSize: 12}}>
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
                                    <span style={{
                                        marginLeft: 20,
                                        fontFamily: "Jeju Gothic"
                                    }}>{this.props.currentUser}</span>
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

        const LiveSTT = (
            <div>
                <Button toggle circular icon='power off'
                        active={this.state.liveSTT}
                        onClick={this.livestart}
                />
            </div>
        )

        const mobileLiveSTT = (
            <div style={{marginRight: 10}}>
                <Button toggle circular
                        active={this.state.liveSTT}
                        onClick={this.livestart}
                >
                    live
                </Button>
            </div>
        )

        const bot = (
            <BotCharacter/>
        )

        const bubble = (
            <div className="bubble" style={{textAlign: 'center', fontFamily: "Jeju Gothic"}}>
                {this.state.text}
            </div>
        )

        const STT = (
            <div>
                {this.state.modalOpen === false ?
                    <Button circular
                            icon="microphone"
                            onClick={this.start}
                    />
                    :
                    <div>
                        <Button circular
                                icon="microphone"
                                onClick={this.start}
                        />
                        <a>
                            <div onClick={this.handleModalClose} style={{position: 'absolute', bottom: '3.5%', right: '5%'}}>
                                {bot}
                            </div>
                        </a>
                        <div style={{position: 'absolute', bottom: '25%', right: '10%'}}>
                            {bubble}
                        </div>
                    </div>
                }
            </div>
        )

        const WidgetSTT = (
            <div>
                {this.state.modalOpen === false ?
                    <Button circular
                            icon="microphone"
                            size='massive'
                            color='blue'
                            onClick={this.start}
                    />
                    :
                    <div>
                        <a>
                            <div onClick={this.handleModalClose} style={{position: 'absolute', bottom: '3.5%', right: '5%'}}>
                                {bot}
                            </div>
                        </a>
                        <div style={{position: 'absolute', bottom: '25%', right: '10%'}}>
                            {bubble}
                        </div>
                    </div>
                }
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
                            <Button color='blue' onClick={this.handleChannel}
                                    style={{fontFamily: "Jeju Gothic"}}>채널</Button>
                            <Button basic color='blue' onClick={this.handleOneOnOne}
                                    style={{fontFamily: "Jeju Gothic"}}>일대일</Button>
                        </Button.Group>
                        :
                        <Button.Group widths={2} style={{width: 200, marginBottom: 10}}>
                            <Button basic color='blue' onClick={this.handleChannel}
                                    style={{fontFamily: "Jeju Gothic"}}>채널</Button>
                            <Button color='blue' onClick={this.handleOneOnOne}
                                    style={{fontFamily: "Jeju Gothic"}}>일대일</Button>
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

        const mainView = (
            <div className="container">
                <section className="slide">
                    <div className="inner" style={{}}>
                        <h1 style={{fontFamily: 'Quicksand', fontSize: 90, color: 'white'}}>Talky</h1>
                        <p style={{fontFamily: "Jeju Gothic"}}>토키에 오신 것을 환영합니다. 옆으로 넘기세요.</p>
                    </div>
                </section>
                <section className="slide">
                    <div className="inner">
                        <p>Just a really simple way to layout and animate a gallery.</p>
                    </div>
                </section>
                <section className="slide">
                    <div className="inner">
                        <p>The active slide is positioned in the viewport.</p>
                        <pre><code>{"\n"}.slide.active {"{"}{"\n"}{"  "}transform: translatex(0);{"\n"}{"}"}</code></pre>
                    </div>
                </section>
                <section className="slide">
                    <div className="inner">
                        <p>Siblings after the active slide are positioned off the screen to the right.</p>
                        <pre><code>{"\n"}.slide.active ~ .slide {"{"}{"\n"}{"  "}transform: translatex(100%);{"\n"}{"}"}</code></pre>
                    </div>
                </section>
                <section className="slide">
                    <div className="inner">
                        <p>Siblings before the active slide are positioned off the screen to the left.</p>
                        <pre><code>{"\n"}.slide {"{"}{"\n"}{"  "}transform: translatex(-100%);{"\n"}{"}"}</code></pre>
                    </div>
                </section>
                <section className="slide">
                    <div className="inner">
                        <p>The movement between slides is handled by a transition.</p>
                        <pre><code>{"\n"}.slide {"{"}{"\n"}{"  "}transition: transform 0.4s ease;{"\n"}{"}"}</code></pre>
                    </div>
                </section>

            </div>
        )

        return (
            <div>
                <Responsive
                    maxWidth={Responsive.onlyComputer.maxWidth}
                    minWidth={Responsive.onlyTablet.minWidth}
                >

                    <Grid stretched style={{
                        padding: 0,
                        marginTop: 0,
                        marginBottom: 0,
                        marginRight: 0,
                        marginLeft: 0,
                        width: '100%',
                        height: 'calc(100vh - 56px)'
                    }}>
                        <Dimmer active={this.state.loading}>
                            <Loader active={this.state.loading}>채팅 불러오는중</Loader>
                        </Dimmer>
                        <Grid.Column stretched style={{width: 250, padding: 0, height: '100%', zIndex: 3}}>
                            <div style={{width: '100%', height: '100%'}}>
                                {SideView}
                                {OneOnOneView}
                            </div>
                            <div style={{width:0, height:0, opacity: 0}}>
                                {chatView}
                            </div>
                        </Grid.Column>
                        <Grid.Column stretched style={{width: 'calc(100% - 310px)', padding: 0, zIndex: 1}}>

                            <div style={{height: '100%', textAlign: 'center'}}>


                                {chatView}
                                {inputView}
                            </div>



                        </Grid.Column>
                        <Grid.Column stretched floated='right' style={{width: 60, backgroundColor: '#455A64', zIndex: 2}}>
                            {this.state.activeChannel !== '' ?
                                <List style={{width: '100%', textAlign: 'center'}}>
                                    <List.Item>
                                        {STT}
                                    </List.Item>
                                    <List.Item style={{marginTop: 10}}>
                                        {userList}
                                    </List.Item>
                                </List>
                                :
                                <List style={{width: '100%', textAlign: 'center'}}>
                                    <List.Item>
                                        {STT}
                                    </List.Item>
                                    <List.Item style={{marginTop: 10}}>
                                        {LiveSTT}
                                    </List.Item>
                                    <List.Item style={{marginTop: 10}}>
                                        {userList}
                                    </List.Item>
                                </List>
                            }

                        </Grid.Column>
                    </Grid>
                </Responsive>

                <Responsive {...Responsive.onlyMobile}>
                    <div>
                        {this.state.mobileView ?
                            this.state.activeChannel !== '' ?
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
                                        style={{width: 50, marginRight: 55}}
                                    >
                                        <Icon name='angle left' size='big'/>
                                    </Menu.Item>
                                    <Menu.Item style={{width: 'calc(100% - 240px)'}}>
                                        <Header style={{width: '100%'}}>
                                            {this.state.channelORoneOnOne ? this.state.activeOneOnOne : this.state.activeChannel}
                                        </Header>
                                    </Menu.Item>
                                    <Menu.Item
                                        position='right'
                                        style={{width: 90}}
                                    >
                                        {STT}
                                        {logoutButton2}
                                    </Menu.Item>
                                </Menu>
                                :
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
                                        style={{width: 50, marginRight: 85}}
                                    >
                                        <Icon name='angle left' size='big'/>
                                    </Menu.Item>
                                    <Menu.Item style={{width: 'calc(100% - 320px)'}}>
                                        <Header style={{width: '100%'}}>
                                            {this.state.channelORoneOnOne ? this.state.activeOneOnOne : this.state.activeChannel}
                                        </Header>
                                    </Menu.Item>
                                    <Menu.Item
                                        position='right'
                                        style={{width: 180}}
                                    >
                                        {mobileLiveSTT}
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
                                {this.state.modalOpen === false ?
                                    <div style={{position: 'absolute', bottom: '3.5%', right: '5%'}}>
                                        {WidgetSTT}
                                    </div>
                                    :
                                    <div>
                                        {WidgetSTT}
                                    </div>
                                }

                                <div style={{height: 0}}>
                                    {chatView}
                                </div>
                            </div>
                        }
                    </div>
                </Responsive>
            </div>
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