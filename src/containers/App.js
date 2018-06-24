import React, {Component} from 'react';
import {FixedHeader} from 'components'
import {connect} from 'react-redux'
import {getStatusRequest} from "../actions/authentication";
import 'antd/dist/antd.css';
import {
    Responsive,
    Segment,
} from 'semantic-ui-react'
import {ThemeProvider} from '@livechat/ui-kit'
import socketio from "socket.io-client";
import {SocketProvider} from 'socket.io-react'

const socket = socketio.connect()

class App extends Component {

    constructor(props) {
        super(props);
    }


    componentDidMount() {   // 컴포넌트가 만들어지고 첫 렌더링을 마친 후 실행되는 메소드
        function getCookie(name) {
            var value = "; " + document.cookie
            var parts = value.split("; " + name + "=")
            if (parts.length == 2) return parts.pop().split(";").shift()
        }

        // 쿠키로부터 로그인 데이터를 얻음
        let loginData = getCookie('key');

        if (typeof loginData === "undefined") return;

        loginData = JSON.parse(atob(loginData));


        if (!loginData.isLoggedIn) return;


        this.props.getStatusRequest().then(
            () => {
                console.log(this.props.status);
                if (!this.props.status.valid) {
                    loginData = {
                        isLoggedIn: false,
                        email: ''
                    };

                    document.cookie = 'key=' + btoa(JSON.stringify(loginData));

                }
            }
        );
    }


    render() {
        let re = /(login|register)/
        let isAuth = re.test(this.props.location.pathname)

        return (
            <ThemeProvider>
                <SocketProvider socket={socket}>
                <Segment.Group>
                    <Responsive
                        maxWidth={Responsive.onlyComputer.maxWidth}
                        minWidth={Responsive.onlyTablet.minWidth}
                    >

                        {isAuth ? undefined : <FixedHeader isLoggedIn={this.props.status.isLoggedIn}/>}
                        {this.props.children}
                    </Responsive>
                    <Responsive {...Responsive.onlyMobile}>

                        {this.props.children}

                    </Responsive>
                </Segment.Group>
                </SocketProvider>
            </ThemeProvider>
        );
    }
}


const mapStateToProps = (state) => {
    return {
        status: state.authentication.status     // 로그인 or 로그아웃 상태
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        getStatusRequest: () => {
            return dispatch(getStatusRequest())
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
