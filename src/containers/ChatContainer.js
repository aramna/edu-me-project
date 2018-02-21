import React from 'react';
import socketio from 'socket.io-client'
import styles from './styles.js'
import {connect} from 'react-redux'

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
        socket.emit('chat-msg', {
            name: this.props.currentUser,
            message: this.state.message
        })
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
        const messages = this.state.logs.map(e => (
            <div key={e.key}>
                <span style={styles.name}>{e.name}</span>
                <span style={styles.msg}>: {e.message}</span>
                <p style={{clear: 'both'}}/>
            </div>
        ))
        return (
            <div>
                <div style={styles.form}>
                    <h1>채팅기본</h1>
                    이름: {this.props.currentUser}<br/>
                    메시지:<br/>
                    <input value={this.state.message}
                           onChange={e => this.messageChanged(e)}/><br/>
                    <button onClick={e => this.send()}>전송</button>
                </div>
                <div>{messages}</div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {

    return {
        currentUser:
        state.authentication.status.currentUser
    }

}

export default connect(mapStateToProps)(ChatContainer)
