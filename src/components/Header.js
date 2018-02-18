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
} from 'semantic-ui-react'
import whitelogoImage from '../images/logo.png'
import blacklogoImage from '../images/logo2.png'
// import {
//     Collapse,
//     Navbar,
//     NavbarToggler,
//     NavbarBrand,
//     Nav,
//     NavItem,
//     NavLink,
//     UncontrolledDropdown,
//     DropdownToggle,
//     DropdownMenu,
//     DropdownItem,
// } from 'reactstrap';
import {Link} from 'react-router'
import {connect} from 'react-redux'

class FixedHeader extends React.Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.state = {
            isOpen: false
        };
    }

    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    // hideFixedMenu() {
    //     this.setState({fixed: false})
    // }
    // showFixedMenu() {
    //     this.setState({ fixed: true })
    // }


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

        const loggedHeader = (
            <Menu
                fixed='top'
                secondary
                inverted
                style={{marginTop: 8}}
            >
                <Container>
                    <Menu.Item style={{marginBottom: 0}}>
                        <Image
                            size='small'
                            src={whitelogoImage}
                        />
                    </Menu.Item>
                    <Menu.Item as='a' style={{marginBottom: 0}}>Introduction</Menu.Item>
                    <Menu.Item as='a' style={{marginBottom: 0}}>Using</Menu.Item>
                    <Menu.Item as='a' style={{marginBottom: 0}}>Careers</Menu.Item>
                    <Menu.Item position='right'>
                        {this.props.isLoggedIn ? logoutButton : loginButton}
                    </Menu.Item>
                </Container>
            </Menu>
        )

        const logoutedHeader = (
            <Segment inverted color='brown' style={{textAlign: 'center', minHeight: 55, padding: 0, borderRadius: 0}}>
                <Menu
                    fixed='top'
                    secondary
                    inverted
                    style={{marginTop: 0, width: '100%'}}

                >
                    <Container
                        style={{width: '100%'}}>
                        <Menu.Item as='a' style={{marginTop: 0}}>
                            <Image
                                size='tiny'
                                src={whitelogoImage}
                            />
                        </Menu.Item>

                        <Menu.Item position='right'>
                            <Menu.Item style={{marginBottom: 0}}>
                                <Icon name="alarm outline"/>
                            </Menu.Item>
                            <Menu.Item style={{marginBottom: 0}}>
                                <Icon name="add user"/>
                            </Menu.Item>
                            <Menu.Item style={{marginBottom: 0}}>
                                <Icon name="users"/>
                            </Menu.Item>
                            <Menu.Item style={{marginLeft: 20, marginRight: 0}}>
                            {this.props.isLoggedIn ? logoutButton : loginButton}
                            </Menu.Item>
                        </Menu.Item>
                    </Container>
                </Menu>
            </Segment>
        )


        return (
            <div>
                {this.props.isLoggedIn ? logoutedHeader : loggedHeader}
            </div>
        );
    }
}


// // props의 type과 기본값 설정하는 부분
// Header.propTypes = {
//     isLoggedIn: React.PropTypes.bool,   // 현재 로그인 상태인지 아닌지 여부를 알려주는 값
//     onLogout: React.PropTypes.func      // 함수형 props로 로그아웃 담당
// }
//
// Header.defaultProps = {
//     isLoggedIn: false,
//     onLogout: () => {
//         console.error("로그아웃 기능이 정의되지 않았습니다.")
//     }
// }

const mapStateToProps = (state) => {
    return {
        isLoggedIn: state.authentication.status.isLoggedIn,
        currentUser: state.authentication.status.currentUser
    }
}

export default connect(mapStateToProps)(FixedHeader)
