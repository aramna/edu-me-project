import React from "react";
import {Link} from "react-router";
import {
    Dropdown,
    Button,
    Container,
    Header,
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
import socketio from "socket.io-client";
import {connect} from "react-redux";


class CreateTeam extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            teamList: [],
        }
    }


    componentDidMount() {

    }


    render() {
        const teamListView = (
            <Grid.Row style={{paddingBottom: 10}}>
                <Grid.Column style={{width: '100%'}}>
                    <div style={{width: '100%', height: 150, backgroundColor: 'white', border: '1px solid #d9dde2'}}>
                    </div>
                </Grid.Column>
            </Grid.Row>
        )

        const userView = (
            <div>
                <Grid>
                    <Grid.Row style={{height: 10}}>
                        <Header as='h4' color='grey'>
                            <Header.Content>
                                Profile
                            </Header.Content>
                        </Header>
                    </Grid.Row>

                    <Grid.Row verticalAlign='middle' style={{height: 100}}>
                        <Grid.Column style={{width: 80}}>
                            <Icon name='user circle' size='huge' style={{color: '#66bbff'}}/>
                        </Grid.Column>
                        <Grid.Column textAlign='left' style={{width: 150}}>
                            <Header as='h3'>
                                {this.props.currentUser}
                            <Header.Subheader>
                                {this.props.currentEmail}
                            </Header.Subheader>
                            </Header>
                        </Grid.Column>
                    </Grid.Row>

                    <Grid.Row style={{height: 10}}>
                        <Header as='h4' color='grey'>
                            <Header.Content>
                                Team List
                            </Header.Content>
                        </Header>
                    </Grid.Row>

                    {teamListView}

                    <Grid.Row style={{padding: 0}}>
                        <Grid.Column style={{width: '100%', height: 100}}>
                            <Button
                                as={Link}
                                to="/addTeam"
                                fluid
                            >
                                <Header style={{color: '#9ca6af'}}>
                                    팀 생성하기
                                </Header>
                            </Button>
                        </Grid.Column>
                    </Grid.Row>


                    <Grid.Row>
                        <Button as={Link}
                                to="/chat"
                        >채팅으로</Button>
                    </Grid.Row>
                </Grid>
            </div>
        )

        return (
            <div style={{
                width: '100%',
                backgroundColor: '#f7fbfe'
            }}>
                <Container textAlign='center'
                           style={{
                               width: '80vh',
                               height: 'calc(100vh - 55px)',
                               padding: 30
                           }}>
                    {userView}
                </Container>

            </div>
        )
    }
}


const mapStateToProps = (state) => {

    return {
        status: state.authentication.status,
        currentUser: state.authentication.status.currentUser,
        currentEmail: state.authentication.status.currentEmail
    }

}

export default connect(mapStateToProps)(CreateTeam)