import React from 'react';
// import {Jumbotron, Button} from 'reactstrap';
import {connect} from 'react-redux'
import {Chat, CreateTeam} from 'containers'
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
} from 'semantic-ui-react'
import backgroundImage from '../images/blueback.jpg'

class Home extends React.Component {


    render() {


        const chatView = (<CreateTeam/>)
        const homeView = (
            <Segment textAlign='center'
                     style={{ minHeight: 700,
                         padding: '1em 0em',
                     // backgroundImage: "url(" + 'http://globalmedicalco.com/photos/globalmedicalco/9/44188.jpg' + ")",
                     backgroundImage: "url(" + backgroundImage + ")",
                     backgroundSize: 'cover'}}
                     vertical>
            <Container text>
                <Header
                    as='h1'
                    content='Edu-Me'
                    inverted
                    style={{
                        fontSize: '4em',
                        fontWeight: 'normal',
                        marginBottom: 0,
                        marginTop: '4em',
                    }}
                />
                <Header
                    as='h2'
                    content='에듀미에 오신걸 환영합니다.'
                    inverted
                    style={{
                        fontSize: '1.7em',
                        fontWeight: 'normal',
                        marginTop: '1.5em',
                    }}
                />

            </Container>
            </Segment>
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