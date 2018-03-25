import React from 'react';
import socketio from 'socket.io-client'
import {connect} from 'react-redux'
import {
    Button,
    Grid,
    Icon,
    Input,
    Menu,
} from 'semantic-ui-react'
import {SideBar} from 'components'
import {Message, MessageText, MessageGroup, MessageList, Row, Avatar} from '@livechat/ui-kit'
import '../index.css'
import {OrderedMap} from 'immutable'
//import Store from './Store';

const getTime = (date) => {
    return `${date.getHours()}:${("0" + date.getMinutes()).slice(-2)}`
}

class ChatContainer extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            //Store: new Store(),
            newMessage: '',
            logs: [],
            userEmail: '',
            roomId: '',
            visibleList: false, //sidebar
            visibleAdd: false,  //sidebar
            channelList: [

            ],
            key: 0,
            choiceRoom: false,
        }

        this.socket = socketio.connect()

        this.handleShow = this.handleShow.bind(this)    //sidebar
        this.handleChannelAdd = this.handleChannelAdd.bind(this)    //sidebar
        this.handleItemClick = this.handleItemClick.bind(this)
    }

    componentWillMount() {
        var defaultRoom = 'main'
        var output = {
            userEmail: this.props.currentEmail,
            id: this.props.currentUser,
            roomId: defaultRoom
        }
        this.socket.emit('login', output)
        this.setState({
            roomId : defaultRoom
        });

        this.setState({
            channelList: this.state.channelList.concat({
                key: this.state.key++,
                text: output.roomId
            })
        })

        this.resetComponent()   //sidebar


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
    }

    resetComponent() {
        this.setState({isLoading: false, results: [], value: ''})
    }   //sidebar

    handleShow() {
        if (this.state.visibleList === false) {
            this.setState({visibleList: true})
        } else {
            this.setState({visibleList: false})
        }
    }   //sidebar

    handleChannelAdd() {
        if (this.state.visibleAdd === false) {
            this.setState({visibleAdd: true})
        } else {
            this.setState({visibleAdd: false})
        }
    }   //sidebar

    handleItemClick(e) {
        // this.setState({channelList: })
        console.log(this.state.channelList)

    }   //sidebar

    messageChanged(e) {
        this.setState({newMessage: e.target.value})
    }

    roomChanged(e) {
        this.setState({roomId: e.target.value})
    }

    handleRoomCreate() {
        var output = {
            command: 'create',
            roomId: this.state.roomId,
            id: this.props.currentUser,
        }

        this.socket.emit('room', output)
        //this.setState({roomId: ''})
        console.log('room전송')
        this.setState({
            channelList: this.state.channelList.concat({
                key: this.state.key++,
                text: output.roomId
            })
        })
    }

    // command를 message로 하여 room 으로 emit
    send() {
        var output = {
            command: 'message',
            email: this.props.currentEmail,
            name: this.props.currentUser,
            message: this.state.newMessage,
            roomId: this.state.roomId
        }

        this.socket.emit('room', output)
        this.setState({newMessage: ''})
    }

    componentDidMount() {

        this.socket.on('message', (obj) => {

            const logs2 = this.state.logs
            obj.key = 'key_' + (this.state.logs.length + 1)
            console.log(obj)
            logs2.push(obj) // 로그에 추가
            this.setState({logs: logs2})
        })
    }

    render() {
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
                {this.state.visibleList ? <Menu.Menu>
                    <Menu.Item
                        name={this.state.channelList[key].text}
                        onClick={e => this.handleItemClick(e)}
                    />
                </Menu.Menu> : ""}
            </div>)

        )

        const chatView = (
            <div style={{height: 'calc(100% - 100px)'}}>
                <MessageList active style={{backgroundColor: '#D6D6D6'}}>
                    {messages}
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
                        if(e.key === 'Enter' && this.state.newMessage.length > 0){
                            this.send()
                        }
                    }}
                    style={{width: '89%', height: '100%', marginTop: 10}}
                />
                <Button size='mini'
                        primary
                        onClick={() => {
                            if(this.state.newMessage.length > 0) {
                                this.send()
                            }
                        }}
                        style={{float: 'right, bottom'}}
                >전송</Button>
            </div>
        )



        const SideView = (
            <Menu inverted vertical style={{width: '100%', height: '70%', backgroundColor: '#455A64', marginTop: 30}}>
                <Menu.Item>
                    <div>
                        <Icon inverted name='user circle outline' size='huge' style={{marginRight: 10}}/>
                        <label style={{textAlign: 'center', fontWeight: 'bold', fontSize: 17, verticalAlign: 'center'}}>
                            {this.props.currentUser}
                            <br/>
                            <label style={{fontWeight: 'normal', fontSize: 13}}>
                                {this.props.currentEmail}
                            </label>
                        </label>
                    </div>
                </Menu.Item>

                <Menu.Item  style={{height: 500, overflowY: 'auto'}}>
                    <Menu.Header>
                        <label onClick={this.handleShow}>
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
                                    placeholder='검색'
                                   onChange={e => this.roomChanged(e)}
                                   onKeyPress={e => {
                                       e.key === 'Enter' && this.handleRoomCreate()
                                   }}
                            />
                        </Menu.Item>
                        : ""}
                    {channel}
                </Menu.Item>
            </Menu>
        )


        return (

            <Grid celled style={{marginTop: 0, marginBottom: 0, width: '100%', height: 'calc(100vh - 55px)'}}>
                <Grid.Column style={{width: 250, backgroundColor: '#455A64', padding: 0}}>
                    {SideView}
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

const mapStateToProps = (state) => {

    return {
        status: state.authentication.status,
        currentUser: state.authentication.status.currentUser,
        currentEmail: state.authentication.status.currentEmail
    }

}

export default connect(mapStateToProps)(ChatContainer)
