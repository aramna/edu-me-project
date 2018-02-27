import React from "react";
import {Link} from "react-router";
import {
    Dropdown,
    Button,
    Container,
    Divider,
    Grid,
    Icon,
    Image,
    List,
    Menu,
    Responsive,
    Segment,
    Sidebar,
    Visibility,
} from 'semantic-ui-react'
import socketio from "socket.io-client";
import {connect} from "react-redux";


// const socket = socketio.connect('http://localhost:3000')


class CreateTeam extends React.Component{
    // constructor(props) {
    //     super(props)
    //     this.state = {
    //         logs: [],
    //         userEmail: ''
    //     }
    // }
    //
    // send() {
    //     var output = {
    //         userEmail: this.props.currentEmail,
    //     }
    //     socket.emit('login', output)
    // }
    //
    //
    // componentDidMount() {
    //     // 실시간으로 로그를 받게 설정
    //     socket.on('login', (obj) => {
    //         const logs2 = this.state.logs
    //         obj.key = 'key_' + (this.state.logs.length + 1)
    //         console.log(obj)
    //         logs2.push(obj) // 로그에 추가
    //         this.setState({logs: logs2})
    //     })
    // }


    render() {
        // const messagesFromOther = this.state.logs.map(e => (
        //     <Comment key={e.key}>
        //         <Comment.Author>{e.name}</Comment.Author>
        //         <div style={
        //             {
        //                 background: '#fff',
        //                 borderRadius: '5px',
        //                 borderTopLeftRadius: 0,
        //                 boxSizing: 'border-box',
        //                 color: '#b3b2ca',
        //                 height: '100%',
        //                 padding: '10px 15px',
        //                 position: 'relative',
        //             }
        //         }> {e.message}</div>
        //         <p style={{clear: 'both'}}/>
        //     </Comment>
        // ))


        return (
            <Container textAlign='center' style={{width: '100%', height: '100%', marginTop: 100}}>
                <Button as={Link}
                        to="/chat"
                        >채팅으로</Button>
            </Container>
        )
    }
}






const mapStateToProps = (state) => {


    return {
         currentUser: state.authentication.status.currentUser,
         currentEmail: state.authentication.status.currentEmail
    }


}


export default connect(mapStateToProps)(CreateTeam)
