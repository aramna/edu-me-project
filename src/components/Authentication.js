import React from 'react';
import {Link} from "react-router";
import {Button, Form, Grid, Checkbox, Segment, Container} from 'semantic-ui-react'
import {message} from "antd/lib/index";

class Authentication extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            email: "",
            password: "",
            username: ""
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleLogin = this.handleLogin.bind(this)
        this.handleRegister = this.handleRegister.bind(this)
    }

    handleChange(e) {
        let nextState = {}
        nextState[e.target.name] = e.target.value
        this.setState(nextState)
    }

    handleLogin() {
        let email = this.state.email
        let pw = this.state.password

        this.props.onLogin(email, pw).then(
            (success) => {
                if (!success) {
                    this.setState({
                        password: ''
                    })
                }
            }
        )
    }

    handleRegister() {
        let username = this.state.username
        let email = this.state.email
        let pw = this.state.password

        this.props.onRegister(username, email, pw).then(
            (success) => {
                if (!success) {
                    this.setState({
                        // username: '',
                        // email: '',
                        password: ''
                    });
                }
            }
        );
    }


    render() {

        const loginView = (
                <Grid
                    textAlign='center'
                    style={{height:'100vh'}}
                    verticalAlign='middle'>
                    <Grid.Column style={{maxWidth: 300}}>
                        <Form>
                            <Form.Field style={{textAlign: 'center'}}>
                                <h2>로그인</h2>
                            </Form.Field><br/>
                            <Form.Field>
                                <label>이메일</label>
                                <input name="email"
                                       type="text"
                                       onChange={this.handleChange}
                                       value={this.state.email}
                                       placeholder='이메일 주소'
                                       style={{borderRadius: 30}}/>
                            </Form.Field>
                            <Form.Field>
                                <label>비밀번호</label>
                                <input name="password"
                                       type="password"
                                       onChange={this.handleChange}
                                       value={this.state.password}
                                       onKeyPress={this.handleKeyPress}
                                       placeholder='비밀번호'
                                       style={{borderRadius: 30}}/>
                            </Form.Field>
                            <Form.Field>
                                <Checkbox label='비밀번호를 기억하시겠습니까?'/>
                            </Form.Field>
                            <Form.Field>
                                <Button primary
                                        type='submit'
                                        style={{width: '100%', borderRadius: 30}}
                                        onClick={this.handleLogin}>로그인</Button>
                            </Form.Field>
                        </Form>
                    </Grid.Column>
                </Grid>
        )

        const registerView = (
            <Grid
                textAlign='center'
                style={{height:'100%'}}
                verticalAlign='middle'>
                <Grid.Column style={{maxWidth: 300}}>
                        <Form>
                            <Form.Field style={{textAlign: 'center'}}>
                                <h2>회원가입</h2>
                            </Form.Field><br/>
                            <Form.Field style={{textAlign: 'left'}}>
                                <label>사용자 이름</label>
                                <input name="username"
                                       type="text"
                                       onChange={this.handleChange}
                                       value={this.state.username}
                                       placeholder='사용자 이름'
                                       style={{borderRadius: 30}}/>
                            </Form.Field>
                            <Form.Field style={{textAlign: 'left'}}>
                                <label>이메일</label>
                                <input name="email"
                                       type="text"
                                       onChange={this.handleChange}
                                       value={this.state.email}
                                       placeholder='이메일'
                                       style={{borderRadius: 30}}/>
                            </Form.Field>
                            <Form.Field style={{textAlign: 'left'}}>
                                <label>비밀번호</label>
                                <input name="password"
                                       type="password"
                                       onChange={this.handleChange}
                                       value={this.state.password}
                                       placeholder='비밀번호'
                                       style={{borderRadius: 30}}/>
                            </Form.Field>
                            <Form.Field>
                                <Button secondary
                                        type='submit'
                                        onClick={this.handleRegister}
                                        style={{width: '100%', borderRadius: 30}}>다음</Button>
                            </Form.Field>
                            <Form.Field>
                                <label>'다음'을 클릭하시면 <a>이용약관</a>과 <a>개인정보취급방침</a>에
                                    동의하는 것으로 간주합니다.</label>
                            </Form.Field><br/><br/>
                            <Form.Field style={{textAlign: 'center'}}>
                                <label>이미 Talky 계정이 있으신가요?</label>
                            </Form.Field>
                            <Form.Field>
                                <Button basic
                                        as={Link}
                                        to='/login'
                                        style={{width: '50%', borderRadius: 30}}>로그인</Button>
                            </Form.Field>
                        </Form>
                </Grid.Column>
            </Grid>
        )

        return (
            <div style={{height: '100vh', marginTop: 14}}>{this.props.mode ? loginView : registerView}</div>
        );
    }
}


Authentication.propTypes = {
    mode: React.PropTypes.bool,         // 로그인, 회원가입 모드를 bool함수로 구분
    onLogin: React.PropTypes.func,      // 함수형 props로 로그인 담당
    onRegister: React.PropTypes.func    // 함수형 props로 회원가입 담당
}

Authentication.defaultProps = {
    mode: true,
    onLogin: (email, pw) => {
        console.error("onLogin not defined");
    },
    onRegister: (username, email, pw) => {
        console.error("onRegister not defined");
    }
}

export default Authentication;
