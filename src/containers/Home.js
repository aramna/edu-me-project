import React from 'react';
import {connect} from 'react-redux'
import {ChatContainer} from 'containers'
import {
    Grid,
    Icon,
    Menu,
    Responsive,
    Segment,
    Sidebar,
    Dropdown
} from 'semantic-ui-react'
import {Link} from "react-router"
import './styles'

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sidebarOpened: false
        };

        this.handlePusherClick = this.handlePusherClick.bind(this);
        this.handleToggle = this.handleToggle.bind(this);
    }

    handlePusherClick() {
        const {sidebarOpened} = this.state
        if (sidebarOpened) {
            this.setState({sidebarOpened: false})
        }
    }

    handleToggle() {
        this.setState({sidebarOpened: !this.state.sidebarOpened})
    }

    componentDidMount() {

    }

    render() {
        const trigger = (
            <span>
            <Icon name='user'/> {this.props.currentUser}
             </span>
        )

        const options = [
            {
                key: 'user',
                text: <span><strong>{this.props.currentUser}</strong>님</span>,
                disabled: true,
            },
            {key: 'profile', text: '나의 프로필'},
            {key: 'help', text: '도움말'},
            {key: 'settings', text: '설정'},
            {key: 'sign-out', text: '로그아웃', onClick: this.props.onLogout},
        ]

        const DropdownTrigger = () => (
            <Dropdown trigger={trigger} options={options}/>
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
                           style={{marginLeft: '0.5em'}}
                >Sign in</Menu.Item>
            </Grid>
        )

        const logoutButton = (
            <div>
                <DropdownTrigger/>
            </div>
        )

        const chatView = (<ChatContainer/>)
        const homeView = (
            <Segment.Group>
                <Responsive {...Responsive.onlyComputer}>
                    <Segment
                        style={{
                            minHeight: 'calc(100vh - 100px)',
                            backgroundColor: '#2196f3'
                        }}
                        vertical>

                            <h1 style={{position: 'absolute', top: '35%', left: '5%', fontSize: '4.5rem', fontWeight: 200, color: 'white', textAlign: 'left'}}>Let's Talking</h1>
                            <canvas id="waves"></canvas>

                    </Segment>
                </Responsive>

                <Responsive {...Responsive.onlyTablet}>
                    <Segment
                        style={{
                            minHeight: 'calc(100vh - 100px)',
                            backgroundColor: '#2196f3'
                        }}
                        vertical>

                            <h1 style={{position: 'absolute', top: '35%', left: '5%', fontSize: '4.5rem', fontWeight: 200, color: 'white', textAlign: 'left'}}>Let's Talking</h1>
                            <canvas id="waves"></canvas>

                    </Segment>
                </Responsive>

                <Responsive {...Responsive.onlyMobile}>
                    <Sidebar.Pushable as={Segment}>
                        <Sidebar as={Menu} animation='uncover' inverted vertical visible={this.state.sidebarOpened}>

                            <Menu.Item as='a' style={{marginBottom: 0}}>Introduction</Menu.Item>
                            <Menu.Item as='a' style={{marginBottom: 0}}>Using</Menu.Item>
                            <Menu.Item as='a' style={{marginBottom: 0}}>Careers</Menu.Item>
                            <Menu.Item position='right'>
                                {this.props.isLoggedIn ? logoutButton : loginButton}
                            </Menu.Item>
                        </Sidebar>

                        <Sidebar.Pusher dimmed={this.state.sidebarOpened}
                                        onClick={this.handlePusherClick}
                                        style={{minHeight: '100vh'}}
                        >
                            <Segment inverted textAlign='center' style={{minHeight: '100vh', padding: 0}}>

                                <Menu inverted secondary style={{marginTop: 0}}>
                                    <Menu.Item onClick={this.handleToggle}>
                                        <Icon name='sidebar' style={{marginLeft: 8}}/>
                                    </Menu.Item>
                                    <Menu.Item position='right'>
                                        <Menu.Item
                                            as={Link}
                                            to="/register"
                                            inverted
                                        >Sign up</Menu.Item>

                                        <Menu.Item as={Link}
                                                   to="/login"
                                                   inverted
                                        >Sign in</Menu.Item>
                                    </Menu.Item>
                                </Menu>

                            </Segment>
                        </Sidebar.Pusher>
                    </Sidebar.Pushable>
                </Responsive>
            </Segment.Group>
        )


        return (
            <div>
                {this.props.isLoggedIn ? chatView : homeView}
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        isLoggedIn: state.authentication.status.isLoggedIn
    }
}

export default connect(mapStateToProps)(Home);
