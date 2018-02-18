import React from "react";
import {Link} from "react-router";
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

class CreateTeam extends React.Component{


    render() {

        return (
        <Container textAlign='center' style={{width: '100%', height: '100%', marginTop: 100}}>
            <Button as={Link}
                    to="/chat">채팅으로</Button>
        </Container>
        )
    }
}


export default CreateTeam;
