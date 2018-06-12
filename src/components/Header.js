import React from 'react';
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
    Header,
} from 'semantic-ui-react'
import {browserHistory, Link} from 'react-router'
import { connect } from 'react-redux'
import {socketConnect} from 'socket.io-react'
import {getStatusRequest, logoutRequest} from "../actions/authentication";



class FixedHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sidebarOpened: false
        }

        this.handlePusherClick = this.handlePusherClick.bind(this)
        this.handleToggle = this.handleToggle.bind(this)
        this.handleLogout = this.handleLogout.bind(this)
    }

    handlePusherClick() {
        const { sidebarOpened } = this.state
        if (sidebarOpened) {
            this.setState({ sidebarOpened: true })
        }
    }

    handleLogout() {
        const {socket} = this.props

        socket.emit('logout', this.props.currentEmail)
        console.log('로그아웃 소켓', this.props.currentEmail)

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
                socket.emit('logout', this.props.currentEmail)
                console.log('로그아웃 소켓')
            }
        );
    }


    handleToggle() {
        this.setState({ sidebarOpened: !this.state.sidebarOpened })
    }

    render() {
        const logoutButton = (
            <Dropdown text={this.props.currentUser} pointing='top right'>
                <Dropdown.Menu>
                    <Dropdown.Item active='false' text={this.props.currentEmail}/>
                    <Dropdown.Divider/>
                    <Dropdown.Item icon='settings' text='프로필 수정' as={Link} to='/mypage'/>
                    <Dropdown.Item icon='sign out' text='로그아웃' onClick={this.handleLogout}/>
                </Dropdown.Menu>
            </Dropdown>
        )


        const loginButton = (
            <Grid>
                <Menu.Item
                    as={Link}
                    to="/register"
                    inverted
                >Sign up</Menu.Item>

                <Menu.Item as={Link}
                    to="/login"
                    inverted
                    style={{ marginLeft: '0.5em' }}
                >Sign in</Menu.Item>
            </Grid>
        )

        const NotLoginHeader = (
        
                <Responsive
                    maxWidth={Responsive.onlyComputer.maxWidth}
                    minWidth={Responsive.onlyTablet.minWidth}
                >
                    <Menu
                        fixed='top'
                        secondary
                        style={{ marginTop: 0, backgroundColor: 'white' }}
                    >
                        <Container>
                            <Menu.Item style={{ marginBottom: 0 }}>
                                <Header size='huge'>TALK</Header>
                            </Menu.Item>
                            <Menu.Item as='a' style={{ marginBottom: 0 }}>Introduction</Menu.Item>
                            <Menu.Item as='a' style={{ marginBottom: 0 }}>Using</Menu.Item>
                            <Menu.Item as='a' style={{ marginBottom: 0 }}>Careers</Menu.Item>
                            <Menu.Item position='right'>
                                {this.props.isLoggedIn ? logoutButton : loginButton}
                            </Menu.Item>
                        </Container>
                    </Menu>
                </Responsive>
     
        )

        const LoginedHeader = (
        
                <Responsive
                    maxWidth={Responsive.onlyComputer.maxWidth}
                    minWidth={Responsive.onlyTablet.minWidth}
                >
                    <div

                        style={{ textAlign: 'center', minHeight: 55, padding: 0, borderRadius: 0, backgroundColor: '#2196F3' }}>
                        <Menu
                            fixed='top'
                            secondary
                            inverted
                            style={{ marginTop: 0, width: '100%'}}

                        >
                                <Menu.Item>
                                    <Header size='huge' inverted>TALK</Header>
                                </Menu.Item>

                                <Menu.Item position='right'>
                                    <Menu.Item>
                                        <Icon name="alarm outline" />
                                    </Menu.Item>
                                    <Menu.Item>
                                        <Icon name="add user" />
                                    </Menu.Item>
                                    <Menu.Item>
                                        <Icon name="users" />
                                    </Menu.Item>
                                    <Menu.Item style={{ marginRight: 0}}>
                                        {this.props.isLoggedIn ? logoutButton : loginButton}
                                    </Menu.Item>
                                </Menu.Item>
                           
                        </Menu>
                    </div>
                </Responsive>
           
        )


        return (
            <div style={{marginBottom: 0, padding:0}}>
                {this.props.isLoggedIn ? LoginedHeader : NotLoginHeader}
            </div>
        );
    }
}


const mapStateToProps = (state) => {
    return {
        isLoggedIn: state.authentication.status.isLoggedIn,
        currentUser: state.authentication.status.currentUser,
        currentEmail: state.authentication.status.currentEmail,
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

export default connect(mapStateToProps, mapDispatchToProps)(socketConnect(FixedHeader))
