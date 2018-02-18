import React from 'react';
import { Jumbotron, Button } from 'reactstrap';


class Home extends React.Component{
    sayHey(){
        alert("hey")
    }

    render() {
        return (
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
        );
    }
}

export default Home;
