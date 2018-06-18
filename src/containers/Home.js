import React from 'react';
import {connect} from 'react-redux'
import {ChatContainer} from 'containers'
import {
    Icon,
    Menu,
    Responsive,
    Segment,
    Header
} from 'semantic-ui-react'
import {Link} from "react-router"
import './styles'
import image from '../images/mainhome.png'

class Home extends React.Component {
    constructor(props) {
        super(props);
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


        const chatView = (<ChatContainer/>)
        const homeView = (
            <Segment.Group>
                <Responsive {...Responsive.onlyComputer}>
                    <Segment
                        style={{
                            height: '100vh',
                            backgroundImage: 'url(' + image + ')',
                            backgroundSize: 'cover',
                            backgroundPosition: 'right'
                        }}
                        vertical>
                    </Segment>


                </Responsive>
                <Responsive {...Responsive.onlyTablet}>
                    <Segment
                        style={{
                            height: '100vh',
                            backgroundImage: 'url(' + image + ')',
                            backgroundSize: 'cover',
                            backgroundPosition: 'left'

                        }}
                        vertical>
                        <h1 style={{position: 'absolute', top: '35%', left: '5%', fontSize: '4.5rem', fontWeight: 200, color: 'black', textAlign: 'left'}}>Let's Talking</h1>

                    </Segment>
                </Responsive>

                <Responsive {...Responsive.onlyMobile}>

                            <Segment textAlign='center' style={{minHeight: '100vh', padding: 0, backgroundColor: '#2196F3'}}>
                                <Menu inverted secondary style={{marginTop: 0}}>
                                    <Menu.Item style={{marginLeft: 10}}>
                                        <Header inverted size='huge' style={{fontFamily: 'Quicksand'}} >Talky</Header>
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
                                <canvas id="waves"></canvas>
                            </Segment>

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
