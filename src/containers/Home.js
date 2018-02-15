import React from 'react';
import {Jumbotron, Button} from 'reactstrap';
import {connect} from 'react-redux'
import {Chat} from 'containers'


class Home extends React.Component {
    sayHey() {
        alert("hey")
    }

    render() {

        const chatView = (<Chat/>)
        const homeView = (
            <div>
                <Jumbotron>
                    <h1 className="display-3">에듀미다</h1>
                    <p className="lead">에듀미는 </p>
                    <hr className="my-2"/>
                    <p>ㅋㅋㅋㅋ</p>
                    <p className="lead">
                        <Button onClick={this.sayHey} color="primary">가즈아!</Button>
                    </p>
                </Jumbotron>
            </div>
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