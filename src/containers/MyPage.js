import React from 'react';
import {connect} from 'react-redux'
import {loginRequest} from "../actions/authentication"
import {browserHistory, Link} from 'react-router'
import {Button, Header, Breadcrumb, Form, Icon, Grid, Checkbox, Segment, Container} from 'semantic-ui-react'


class MyPage extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            // email: "",
            // password: "",
            // username: ""
        }
        // this.handleChange = this.handleChange.bind(this)
        // this.handleLogin = this.handleLogin.bind(this)
        // this.handleRegister = this.handleRegister.bind(this)
    }

    render() {


        const profileView = (

            <div style={{backgroundColor: '#e9ecef', height: 'calc(100vh - 60px)'}}>


                <Container style={{width: '100vh', height: 800}}>
                    <Breadcrumb size='small' style={{float: 'left'}}>
                        <Breadcrumb.Section link>메인</Breadcrumb.Section>
                        <Breadcrumb.Divider icon='right chevron'/>
                        <Breadcrumb.Section active>프로필 설정</Breadcrumb.Section>
                    </Breadcrumb>
                    <Grid style={{width: '100%', backgroundColor: 'white'}}>

                        <Grid.Row verticalAlign='middle'>
                            <Grid.Column style={{width: 300}}>
                                <Header size='medium'>프로필 사진</Header>
                            </Grid.Column>
                            <Grid.Column style={{width: 'calc(100% - 300px)'}}>
                                <Icon name='user'/>
                            </Grid.Column>
                        </Grid.Row>


                        <Grid.Row verticalAlign='middle'>
                            <Grid.Column style={{width: 300}}>
                                <Header size='medium'>이름</Header>
                            </Grid.Column>
                            <Grid.Column style={{width: 'calc(100% - 300px)'}}>
                                {this.props.currentUser}
                            </Grid.Column>
                        </Grid.Row>

                        <Grid.Row verticalAlign='middle'>
                            <Grid.Column style={{width: 300}}>
                                <Header size='medium'>이메일 관리</Header>
                            </Grid.Column>
                            <Grid.Column style={{width: 'calc(100% - 300px)'}}>
                                {this.props.currentEmail}
                            </Grid.Column>
                        </Grid.Row>

                        <Grid.Row verticalAlign='middle'>
                            <Grid.Column style={{width: 300}}>
                                <Header size='medium'>비밀번호 변경</Header>
                            </Grid.Column>
                            <Grid.Column style={{width: 'calc(100% - 300px)'}}>
                                **********
                            </Grid.Column>
                        </Grid.Row>

                        <Grid.Row verticalAlign='middle'>
                            <Grid.Column style={{width: 300}}>
                                <Header size='medium'>계정 삭제</Header>
                            </Grid.Column>
                            <Grid.Column style={{width: 'calc(100% - 300px)'}}>

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

// react-redux를 통해 MyPage 컴포넌트를 Redux에 연결
export default connect(mapStateToProps)(MyPage)