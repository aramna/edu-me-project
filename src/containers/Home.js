import React from 'react';
// import {Jumbotron, Button} from 'reactstrap';
import {connect} from 'react-redux'
import {ChatContainer, CreateTeam} from 'containers'
import {
    Button,
    Container,
    Divider,
    Grid,
    Header,
    Icon,
    Image,
    List,
    Menu,
    Responsive,
    Segment,
    Sidebar,
    Visibility,
    Dropdown
} from 'semantic-ui-react'
import backgroundImage from '../images/Scooter.jpg'

import '../sample.scss'
import {Link} from "react-router";

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
                    style={{ minHeight: 700,
                        padding: '1em 0em',
                        // backgroundImage: "url(" + 'http://globalmedicalco.com/photos/globalmedicalco/9/44188.jpg' + ")",
                        backgroundColor:'black'}}
                    vertical>
                    <div className="container" style={{backgroundColor: 'black'}}>
                        <div className="coast">
                            <div className="wave-rel-wrap">
                                <div className="wave"></div>
                            </div>
                        </div>
                        <div className="coast delay">
                            <div className="wave-rel-wrap">
                                <div className="wave delay"></div>
                            </div>
                        </div>
                        <div className="text text-w">T</div>
                        <div className="text text-a">A</div>
                        <div className="text text-v">L</div>
                        <div className="text text-e">K</div>
                    </div>
                </Segment>
            </Responsive>

            <Responsive {...Responsive.onlyTablet}>
                <Segment
                    style={{ minHeight: 700,
                        padding: '1em 0em',
                        // backgroundImage: "url(" + 'http://globalmedicalco.com/photos/globalmedicalco/9/44188.jpg' + ")",
                        backgroundColor:'black'}}
                    vertical>
                    <div className="container" style={{backgroundColor: 'black'}}>
                        <div className="coast">
                            <div className="wave-rel-wrap">
                                <div className="wave"></div>
                            </div>
                        </div>
                        <div className="coast delay">
                            <div className="wave-rel-wrap">
                                <div className="wave delay"></div>
                            </div>
                        </div>
                        <div className="text text-w">T</div>
                        <div className="text text-a">A</div>
                        <div className="text text-v">L</div>
                        <div className="text text-e">K</div>
                    </div>
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

                            <Menu inverted secondary style={{marginTop: 0}} >
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
                            <div className="container" style={{backgroundColor: 'black'}}>
                                <div className="coast">
                                    <div className="wave-rel-wrap">
                                        <div className="wave"></div>
                                    </div>
                                </div>
                                <div className="coast delay">
                                    <div className="wave-rel-wrap">
                                        <div className="wave delay"></div>
                                    </div>
                                </div>

                                <div className="text text-w" style={{marginLeft: 42}}>T</div>
                                <div className="text text-a" style={{marginLeft: 42}}>A</div>
                                <div className="text text-v" style={{marginLeft: 42}}>L</div>
                                <div className="text text-e" style={{marginLeft: 42}}>K</div>

                            </div>

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
        );
    }
}

const mapStateToProps = (state) => {
    return {
        isLoggedIn: state.authentication.status.isLoggedIn
    }
}

export default connect(mapStateToProps)(Home);
