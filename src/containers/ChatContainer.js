import React from 'react';
import socketio from 'socket.io-client'
import {connect} from 'react-redux'
import {
    Button,
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
import ChatView from 'react-chatview'
import { Message, MessageText, MessageList, Row } from '@livechat/ui-kit'
import '../index.css'


// const socket = socketio.connect('http://localhost:3000')

class ChatContainer extends React.Component {

    constructor (props) {
        super(props)
        this.state = {
            logs: [] , message: '', userEmail: ''
        }

        this.socket = socketio.connect()


    }

    componentWillMount () {
        var output = {
            userEmail: this.props.currentEmail,
            roomId: 'main',
            userName:this.props.currentUser
    }
        this.socket.emit('login', output)


        // 내가 쓴 대화내용을 채팅창에 들어왔을 때 불러오기
        /*this.socket.on('preload', data => {
            for(var i=0; i<data.length; i++) {
                var output = {
                    name: data[i].name,
                    message: data[i].message
                }
                this.socket.emit('message', output)
            }
            this.setState({message: ''})
            console.log('데이터다!' + data[0].message)
        })*/
    }


    messageChanged (e) {
        this.setState({message: e.target.value})
    }

    send () {
        var output = {
            email: this.props.currentEmail,
            name: this.props.currentUser,
            message: this.state.message
        }

        this.socket.emit('message', output)
        this.setState({message: ''})
    }

    componentDidMount () {

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

                <Comment
                    className={"message-container ${e.name === this.props.currentUser && 'right'}"}
                    key={e.key}
                    >
                    <Comment.Author>{e.name}</Comment.Author>

                    <div style={
                        {
                            background: '#fff',
                            borderRadius: '5px',
                            borderTopLeftRadius: 0,
                            boxSizing: 'border-box',
                            color: '#b3b2ca',
                            height: '100%',
                            padding: '10px 15px',
                        }
                    }> {e.message}</div>
                </Comment>
            ))

        return (
            <Grid celled style={{marginTop: 0}}>
                <Grid.Row>
                    <Grid.Column width={3}>
                    </Grid.Column>
                    <Grid.Column width={13}>

                        이름: {this.props.currentUser}<br/>
                        메시지:<br/>
                        <Segment
                            style={{
                            width: '100%',
                            height: '700px',
                            overflow: 'auto',
                            float: 'right'
                        }}>
                            <MessageList active>
                                {messages}
                            </MessageList>

                            </Segment>
                        <Input
                            placeholder=''
                            defaultValue='52.03'
                            value={this.state.message}
                            onChange={e => this.messageChanged(e)}
                            style={{width: '89%'}}
                        />
                        <Button primary onClick={e => this.send()} style={{width: '10%'}}>전송</Button>

                    </Grid.Column>
                </Grid.Row>
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
