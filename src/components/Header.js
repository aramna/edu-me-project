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
import whitelogoImage from '../images/logo.png'
import blacklogoImage from '../images/logo2.png'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import backgroundImage from '../images/Scooter.jpg'


class FixedHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sidebarOpened: false
        };

        this.handlePusherClick = this.handlePusherClick.bind(this);
        this.handleToggle = this.handleToggle.bind(this);
    }

    handlePusherClick() {
        const { sidebarOpened } = this.state
        if (sidebarOpened) {
            this.setState({ sidebarOpened: true })
        }
    }

    handleToggle() {
        this.setState({ sidebarOpened: !this.state.sidebarOpened })
    }

    render() {
        const trigger = (
            <span>
                <Icon name='user' /> {this.props.currentUser}
            </span>
        )

        const options = [
            {
                key: 'user',
                text: <span><strong>{this.props.currentUser}</strong>님</span>,
                disabled: true,
            },
            { key: 'profile', text: '나의 프로필' },
            { key: 'help', text: '도움말' },
            { key: 'settings', text: '설정' },
            { key: 'sign-out', text: '로그아웃', onClick: this.props.onLogout },
        ]

        const DropdownTrigger = () => (
            <Dropdown trigger={trigger} options={options} />
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

        const logoutButton = (
            <div>
                <DropdownTrigger />
            </div>
        )


        const NotLoginHeader = (
        
                <Responsive
                    maxWidth={Responsive.onlyComputer.maxWidth}
                    minWidth={Responsive.onlyTablet.minWidth}
                >
                    <Menu
                        fixed='top'
                        secondary
                        inverted
                        style={{ marginTop: 8 }}
                    >
                        <Container>
                            <Menu.Item style={{ marginBottom: 0 }}>
                                <Header size='huge' inverted>TALK</Header>
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
                            style={{ marginTop: 4, width: '100%'}}

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
                                    <Menu.Item style={{ marginLeft: 20, marginRight: 0 }}>
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
        currentUser: state.authentication.status.currentUser
    }
}

export default connect(mapStateToProps)(FixedHeader)
