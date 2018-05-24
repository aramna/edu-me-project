import React from 'react';
import { Authentication } from 'components'
import { connect } from 'react-redux'
import { registerRequest } from "../actions/authentication"
import { browserHistory } from 'react-router'
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
                if(this.props.status === 'SUCCESS') {
                    message.success('회원가입을 성공했습니다. 로그인 하세요.')
                    browserHistory.push('/login')
                    return true
                } else {
                    let errorMessage = [
                        '이름 형식이 올바르지 않습니다.',
                        '이메일 형식이 올바르지 않습니다.',
                        '비밀번호는 4자리 이상이어야 합니다.',
                        '중복된 이메일이 존재합니다.'
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

