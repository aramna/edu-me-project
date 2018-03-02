import React from 'react';
import socketio from 'socket.io-client'
import {connect} from 'react-redux'
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
} from 'semantic-ui-react'
import {SideBar} from 'components'
import {Message, MessageText, MessageGroup, MessageList} from '@livechat/ui-kit'
import {ChatFeed} from 'react-chat-ui'
import '../index.css'

class ChatContainer extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            logs: [], message: '', userEmail: ''
        }

        this.socket = socketio.connect()
    }

    componentWillMount() {
        var output = {
            userEmail: this.props.currentEmail,
        }
        this.socket.emit('login', output)


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


    messageChanged(e) {
        this.setState({message: e.target.value})
    }

    send() {
        var output = {
            email: this.props.currentEmail,
            name: this.props.currentUser,
            message: this.state.message
        }

        this.socket.emit('message', output)
        this.setState({message: ''})
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

            <MessageGroup  onlyFirstWithMeta>
                {
                    e.name !== this.props.currentUser ?
                        // sender가 상대방일 때

                        <Message authorName={e.name} >
                            <MessageText>{e.message}</MessageText>
                        </Message>

                        :
                        // sender가 본인일 때
                        <Message isOwn>
                            <MessageText>{e.message}</MessageText>
                        </Message>
                }
            </MessageGroup>
        ))

        const chatView = (
            <div style={{height: 'calc(100% - 100px)'}}>
                <MessageList active>
                    {messages}
                </MessageList>
            </div>
        )

        const inputView = (
            <div style={{width: '100%', height: 100}}>

                <Input
                    placeholder=''
                    defaultValue='52.03'
                    value={this.state.message}
                    onChange={e => this.messageChanged(e)}
                    style={{width: '89%', height: '100%', marginTop: 10}}
                />
                <Button size='mini' primary onClick={e => this.send()} style={{float: 'right, bottom'}}>전송</Button>
            </div>
        )

        return (

            <Grid celled style={{marginTop: 0, marginBottom: 0, width: '100%', height: 'calc(100vh - 55px)'}}>
                <Grid.Column style={{width: 200, backgroundColor: '#455A64'}}>
                    <SideBar/>
                </Grid.Column>
                <Grid.Column style={{width: 'calc(100% - 260px)'}}>
                    <div style={{height: '100%'}}>
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