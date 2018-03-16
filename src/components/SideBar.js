import React from 'react';
import socketio from 'socket.io-client'
import {
    Button,
    Container,
    Divider,
    Grid,
    Header,
    Icon,
    Input,
    Image,
    List,
    Menu,
    Responsive,
    Segment,
    Sidebar,
    Visibility,
    Comment,
} from 'semantic-ui-react'

class SideBar extends React.Component {
    handleItemClick (name) {
        this.setState({ activeItem: name })
    }

    render() {
        const { activeItem } = this.state || {}

        return (
            <Container>
                <Menu.Item>
                    <Menu.Header style={{color: 'white'}}>채널</Menu.Header>

                    <Menu.Menu>
                        <Menu.Item name='전체공지방' active={activeItem === '전체공지방'} onClick={this.handleItemClick} style={{color: 'white'}}/>

                    </Menu.Menu>

                    <Menu.Menu>
                        <Menu.Item name='1조스터디' active={activeItem === '1조스터디'} onClick={this.handleItemClick} style={{color: 'white'}}/>
                    </Menu.Menu>
                </Menu.Item>
            </Container>
        )
    }
}



export default SideBar
