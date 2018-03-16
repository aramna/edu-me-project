import React, {Component} from 'react';
import {FixedHeader} from 'components'
import {connect} from 'react-redux'
import {getStatusRequest, logoutRequest} from "../actions/authentication";
import 'antd/dist/antd.css';
import { message } from 'antd'
import {Dropdown,
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
    Visibility,} from 'semantic-ui-react'
import {browserHistory} from "react-router";
import { ThemeProvider } from '@livechat/ui-kit'

class App extends Component {

    constructor(props) {
        super(props);
        this.handleLogout = this.handleLogout.bind(this);
    }

    /* CODES */

    handleLogout() {
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

        }
    );
}

componentDidMount() {   // 컴포넌트가 만들어지고 첫 렌더링을 마친 후 실행되는 메소드
    function getCookie(name) {
        var value = "; " + document.cookie
        var parts = value.split("; " + name + "=")
        if (parts.length == 2) return parts.pop().split(";").shift()
    }

    // 쿠키로부터 로그인 데이터를 얻음
    let loginData = getCookie('key');

    // if loginData is undefined, do nothing
    if (typeof loginData === "undefined") return;

    // decode base64 & parse json
    loginData = JSON.parse(atob(loginData));

    // if not logged in, do nothing
    if (!loginData.isLoggedIn) return;

    // page refreshed & has a session in cookie,
    // check whether this cookie is valid or not
    this.props.getStatusRequest().then(
        () => {
            console.log(this.props.status);
            // if session is not valid
            if (!this.props.status.valid) {
                // logout the session
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
        <div>
            {isAuth ? undefined : <FixedHeader isLoggedIn={this.props.status.isLoggedIn}
                                               onLogout={this.handleLogout}/>}
            {this.props.children}
        </div>
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
        },
        logoutRequest: () => {
            return dispatch(logoutRequest())
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
