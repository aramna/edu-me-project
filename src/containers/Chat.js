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
import {Link} from "react-router";
import {connect} from "react-redux";


class Chat extends React.Component {


    render() {

        const chatHeader = (
            <Menu
                fixed='top'
                secondary
                style={{marginTop: 0, width: '100%'}}
            >
                <Menu.Item>
                    <Image
                        size='tiny'
                        src={blacklogoImage}
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
                </Menu.Item>
            </Menu>
        )

        const sidebar = (
            <Container style={{width: '300px', backgroundColor: 'blue'}}>
                사이드바
            </Container>
        )

        return (
            <Grid celled>
                <Grid.Row style={{height: '100px'}}>
                    {chatHeader}
                </Grid.Row>
                <Grid.Row>
                    {sidebar}
                </Grid.Row>
            </Grid>
        );

    }
}

export default Chat