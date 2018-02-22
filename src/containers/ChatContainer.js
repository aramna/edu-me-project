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
    Message
} from 'semantic-ui-react'

// const socket = socketio.connect('http://localhost:3000')

const socket = socketio.connect('http://localhost:3000')

class ChatContainer extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            logs: [], message: ''
        }
    }

    messageChanged(e) {
        this.setState({message: e.target.value})
    }

    send() {
        var output = {
            name: this.props.currentUser,
            message: this.state.message

        }
        socket.emit('chat-msg', output)
        this.setState({message: ''})
    }

    componentDidMount() {
        // 실시간으로 로그를 받게 설정
        socket.on('chat-msg', (obj) => {
            const logs2 = this.state.logs
            obj.key = 'key_' + (this.state.logs.length + 1)
            console.log(obj)
            logs2.push(obj) // 로그에 추가
            this.setState({logs: logs2})
        })
    }

    render() {

        const messagesFromOther = this.state.logs.map(e => (
            <Comment key={e.key}>
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
                        position: 'relative',
                    }
                }> {e.message}</div>
                <p style={{clear: 'both'}}/>
            </Comment>
        ))

        const messagesFromMe = this.state.logs.map(e => (
            <Comment key={e.key}>
                <Comment.Author>{e.name}</Comment.Author>
                <div style={
                    {
                        background: '#fff',
                        borderRadius: '5px',
                        borderTopLeftRadius: 0,
                        boxSizing: 'border-box',
                        color: 'black',
                        height: '100%',
                        padding: '10px 15px',
                        position: 'relative',
                        textAlign: 'right'
                    }
                }> {e.message}</div>
                <p style={{clear: 'both'}}/>
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
                        <Segment style={{
                            width: '100%',
                            height: '700px'
                        }}>{this.props.currentUser === name ? messagesFromMe : messagesFromOther}</Segment>
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
        currentUser: state.authentication.status.currentUser,
        currentEmail: state.authentication.status.currentEmail
    }

}

export default connect(mapStateToProps)(ChatContainer)