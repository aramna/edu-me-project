import React from 'react';
import {Authentication} from 'components'

// Login 컴포넌트를 Redux에 연결
import {connect} from 'react-redux'
import {loginRequest} from "../actions/authentication"

import {browserHistory} from 'react-router'

class Login extends React.Component {

    constructor(props) {
        super(props)
        this.handleLogin = this.handleLogin.bind(this)
    }

    handleLogin(email, pw) {
        return this.props.loginRequest(email, pw).then(    //.then()은 AJAX요청이 끝난후에 할 작업
            () => {
                if (this.props.status === "SUCCESS") {
                    // session data 생성
                    let loginData = {
                        isLoggedIn: true,
                        email: email
                    }
                    // cookie 설정
                    document.cookie = 'key=' + btoa(JSON.stringify(loginData))

                    window.alert('성공적으로 로그인 되었습니다.')
                    browserHistory.push('/chat')    //로그인이 성공하면 홈으로 넘어감
                    return true
                } else {
                    window.alert('실패했습니다.')
                    return false
                }
            }
        )
    }


    render() {
        return (
            <div>
                <Authentication mode={true}
                                onLogin={this.handleLogin}/>
            </div>
        )
    }
}


const mapStateToProps = (state) => {
    return {
        status: state.authentication.login.status
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        loginRequest: (email, pw) => {
            return dispatch(loginRequest(email, pw))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)
