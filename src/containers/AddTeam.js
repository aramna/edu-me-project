import React from 'react';

// Login 컴포넌트를 Redux에 연결
import {connect} from 'react-redux'
import {
    Button,
    Grid,
    Form,
    Icon,
    Input,
    Menu,
    Divider,
    Dimmer,
    Loader
} from 'semantic-ui-react'
class AddTeam extends React.Component {

    render() {
        const CreateTeamView = (
            <Grid
                style={{ padding: 250 }}>
                <Grid.Row centered>
                    <Form style={{width: 300}}>
                        <Form.Field style={{textAlign: 'center'}}>
                            <h2>팀 생성하기</h2>
                        </Form.Field><br/>
                        <Form.Field>
                            <label>팀 이름</label>
                            <Input
                                   placeholder='팀 이름'
                                   style={{borderRadius: 30}}/>
                        </Form.Field>
                        <Form.Field>
                            <label>팀 도메인</label>
                            <Input
                                   placeholder='팀 도메인'
                                   label={{ basic: true, content: '.edume.com' }}
                                   labelPosition='right'
                                   style={{borderRadius: 30}}/>
                        </Form.Field>
                        <Form.Field>
                        </Form.Field>
                        <Form.Field style={{paddingTop: 30}}>
                            <Button primary
                                    disabled
                                    type='submit'
                                    style={{width: '100%', borderRadius: 5}}
                                    >팀으로 이동하기</Button>
                        </Form.Field>
                    </Form>
                </Grid.Row>
            </Grid>
        )

        return (
            <div>
                {this.props.currentUser}
                {CreateTeamView}
            </div>
        )
    }
}

// store 안의 state 값을 props로 연결
const mapStateToProps = (state) => {
    return {
        status: state.authentication.status,
        currentUser: state.authentication.status.currentUser,
        currentEmail: state.authentication.status.currentEmail,
    }
}



// react-redux를 통해 Login 컴포넌트를 Redux에 연결
export default connect(mapStateToProps)(AddTeam)