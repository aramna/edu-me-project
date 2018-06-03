import React from 'react';
import {connect} from 'react-redux'
import {reRegister} from "../actions/authentication"
import {browserHistory, Link} from 'react-router'
import { message } from 'antd'
import {Button, Header, Breadcrumb, Form, Icon, Grid, Checkbox, Segment, Container} from 'semantic-ui-react'


class MyPage extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            clickName: false,
            //email: "",
            // password: "",
             username: this.props.currentUser,
             check: false,
        }
        // this.handleChange = this.handleChange.bind(this)
        // this.handleLogin = this.handleLogin.bind(this)
        // this.handleRegister = this.handleRegister.bind(this)
        this.clickNamedown = this.clickNamedown.bind(this)
        this.clickNameup = this.clickNameup.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleReRegister = this.handleReRegister.bind(this)
    }

    handleReRegister() {
      let username = this.state.username
         this.props.reRegister(username).then(
            () => {
              console.log("현재유저네임:", username);
                message.success("changed!.")
              let loginData = {
                  username: this.state.username
              };

              document.cookie = 'key=' + btoa(JSON.stringify(loginData));
            }
          );
          this.setState({username:this.state.username, check:true, clickName: false})
    }

    handleChange(e) {
        let nextState = {}
        nextState[e.target.name] = e.target.value
        this.setState(nextState)
    }

    clickNameup() {
      console.log("클릭업");
        this.setState({clickName: false});
    }

    clickNamedown() {
      console.log("클릭다운");
        this.setState({clickName: true , username: this.state.username});
    }

    render() {


        const profileView = (

            <div style={{backgroundColor: '#e9ecef', height: 'calc(100vh - 60px)'}}>


                <Container textAlign='center' style={{width: '100vh', height: 500}}>
                    <Breadcrumb size='small' style={{float: 'left'}}>
                        <Breadcrumb.Section link>메인</Breadcrumb.Section>
                        <Breadcrumb.Divider icon='right chevron'/>
                        <Breadcrumb.Section active>프로필 설정</Breadcrumb.Section>
                    </Breadcrumb>
                    <Grid celled style={{width: '100%', height: '100%',backgroundColor: 'white'}}>
                        <Grid.Row verticalAlign='middle'>
                            <Grid.Column style={{width: 300, textAlign: 'center'}}>
                                <Header size='medium'>프로필 사진</Header>
                            </Grid.Column>
                            <Grid.Column style={{width: 'calc(100% - 300px)'}}>
                                <Icon name='user'/>
                            </Grid.Column>
                        </Grid.Row>


                        <Grid.Row verticalAlign='middle'>
                            <Grid.Column style={{width: 300, textAlign: 'center'}}>
                                <Header size='medium'>이름</Header>
                            </Grid.Column>

                            {this.state.clickName ?
                                <Grid.Column style={{width: 'calc(100% - 350px)'}}>
                              <input name="username"
                                     type="text"
                                     value={this.state.username}
                                     onChange={this.handleChange}
                                     placeholder=''
                                     style={{width: 'calc(100)', textAlign:'center'}}/>
                                   <div>
                                   <Button
                                   as={Link}
                                   to="/mypage"
                                   onClick={this.handleReRegister}>수정</Button>
                                   <Button onClick={this.clickNameup}>취소</Button>
                                   </div>
                                   </Grid.Column> :
                            <Grid.Column style={{width: 'calc(100% - 350px)'}}>
                              {this.state.check ? this.state.username : this.props.currentUser}
                            </Grid.Column>
                            }
                            {this.state.clickName ?
                            <Icon verticalAlign='right' style={{width : 30, marginTop:'70px'}} name="chevron up"
                                    onClick={this.clickNameup}/> :
                            <Icon verticalAlign='right' style={{width : 30, marginTop:'35px'}} name="chevron down"
                                  onClick={this.clickNamedown}/>
                            }


                        </Grid.Row>

                        <Grid.Row verticalAlign='middle'>
                            <Grid.Column style={{width: 300, textAlign: 'center'}}>
                                <Header size='medium'>이메일 관리</Header>
                            </Grid.Column>
                            <Grid.Column style={{width: 'calc(100% - 300px)'}}>
                                {this.props.currentEmail}
                            </Grid.Column>
                        </Grid.Row>

                        <Grid.Row verticalAlign='middle'>
                            <Grid.Column style={{width: 300, textAlign: 'center'}}>
                                <Header size='medium'>비밀번호</Header>
                            </Grid.Column>
                            <Grid.Column style={{width: 'calc(100% - 300px)'}}>
                                **********
                            </Grid.Column>
                        </Grid.Row>

                        <Grid.Row verticalAlign='middle'>
                            <Grid.Column style={{width: 300, textAlign: 'center'}}>
                                <Header size='medium'>계정 삭제</Header>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Container>
            </div>

        )

        return (
            <div>
                {profileView}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        isLoggedIn: state.authentication.status.isLoggedIn,
        status: state.authentication.status,
        currentUser: state.authentication.status.currentUser,
        currentEmail: state.authentication.status.currentEmail,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        reRegister: (username) => {
            return dispatch(reRegister(username));
        }
    }
}

// react-redux를 통해 MyPage 컴포넌트를 Redux에 연결
export default connect(mapStateToProps, mapDispatchToProps)(MyPage)
