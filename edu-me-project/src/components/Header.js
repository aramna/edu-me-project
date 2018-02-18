import React from 'react';
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Button
} from 'reactstrap';
import {Dropdown, Icon} from 'semantic-ui-react'
import {Link} from 'react-router'

export default class Header extends React.Component {
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


    render() {

        const trigger = (
            <span>
            <Icon name='user'/> Hello, {this.props.username}
             </span>
        )

        const options = [
            {
                key: 'user',
                text: <span><strong>{this.props.username}</strong>님</span>,
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
            <NavItem>
                <Button
                    tag={Link}
                    to="/register"
                    outline color="secondary"
                    style={{marginRight: 10}}
                >회원가입</Button>

                <Button tag={Link} to="/login" outline color="secondary">로그인</Button>
            </NavItem>
        )

        const logoutButton = (
            <NavItem>
                <DropdownTrigger/>
            </NavItem>
        )

        return (
            <div>
                <Navbar color="faded" light expand="md">
                    <NavbarBrand tag={Link} to="/">EduMe</NavbarBrand>
                    <NavbarToggler onClick={this.toggle}/>
                    <Collapse isOpen={this.state.isOpen} navbar>
                        <Nav className="ml-auto" navbar>
                            <NavItem>
                                <NavLink href="/components/">소개</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink>사용법</NavLink>
                            </NavItem>
                            <UncontrolledDropdown nav inNavbar
                                                  style={{marginRight: 30}}>
                                <DropdownToggle nav caret>
                                    메뉴
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem>
                                        Option 1
                                    </DropdownItem>
                                    <DropdownItem>
                                        Option 2
                                    </DropdownItem>
                                    <DropdownItem divider/>
                                    <DropdownItem>
                                        Reset
                                    </DropdownItem>
                                </DropdownMenu>
                            </UncontrolledDropdown>

                            <NavItem>
                                {this.props.isLoggedIn ? logoutButton : loginButton}
                            </NavItem>
                        </Nav>
                    </Collapse>
                </Navbar>
            </div>
        );
    }
}


// props의 type과 기본값 설정하는 부분
Header.propTypes = {
    isLoggedIn: React.PropTypes.bool,   // 현재 로그인 상태인지 아닌지 여부를 알려주는 값
    onLogout: React.PropTypes.func      // 함수형 props로 로그아웃 담당
}

Header.defaultProps = {
    isLoggedIn: false,
    onLogout: () => {
        console.error("로그아웃 기능이 정의되지 않았습니다.")
    }
}
