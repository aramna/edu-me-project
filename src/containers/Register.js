import React from 'react';
import { Authentication } from 'components'
import { connect } from 'react-redux'
import { registerRequest } from "../actions/authentication"
import 'antd/dist/antd.css';
import { message } from 'antd'

class Register extends React.Component {

    constructor(props) {
        super(props)
        this.handleRegister = this.handleRegister.bind(this)
    }

    handleRegister(username, email, pw) {
        return this.props.registerRequest(username, email, pw).then(
            () => {
                if(this.props.status === "SUCCESS") {
                    message.success('회원가입을 성공했습니다. 로그인 하세요.')

                    return true
                } else {
                    let errorMessage = [
                        '이름 똑바로',
                        '이메일형식이 잘못됨',
                        '비밀번호가 넘짧자나',
                        '이메일이 이미 존재해유'
                    ];
                    message.warning(errorMessage[this.props.errorCode - 1])
                    return false
                }
            }
        )
    }

    render() {
        return (
            <div>
                <Authentication mode={false}
                                onRegister={this.handleRegister}/>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        status: state.authentication.register.status,
        errorCode: state.authentication.register.error
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        registerRequest: (username, email, pw) => {
            return dispatch(registerRequest(username, email, pw));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Register);

// username , email, password
// 이미 계정이 있다고요 ? 로그인 버튼