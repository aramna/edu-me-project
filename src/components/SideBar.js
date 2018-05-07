import React from 'react';
import _ from 'lodash'
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
    Search,
    Dropdown,
    Responsive,
    Segment,
    Sidebar,
    Visibility,
    Comment,
} from 'semantic-ui-react'
import {connect} from "react-redux";



class SideBar extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            visibleList: false,
            visibleAdd: false,
        }
        this.handleShow = this.handleShow.bind(this)
        this.handleChannelAdd = this.handleChannelAdd.bind(this)
    }

    componentWillMount() {
        this.resetComponent()
    }

    resetComponent() {
        this.setState({isLoading: false, results: [], value: ''})
    }

    handleShow() {
        if (this.state.visibleList === false) {
            this.setState({visibleList: true})
        } else {
            this.setState({visibleList: false})
        }
    }

    handleChannelAdd() {
        if (this.state.visibleAdd === false) {
            this.setState({visibleAdd: true})
        } else {
            this.setState({visibleAdd: false})
        }
    }

    handleItemClick(name) {
        this.setState({activeItem: name})
    }

    render() {

        return (
            <Menu inverted vertical style={{width: '100%', height: '90%', backgroundColor: '#455A64', marginTop: 30}}>
                <Menu.Item>
                    <div>
                        <Icon inverted name='user circle outline' size='huge' style={{marginRight: 10}}/>
                        <label style={{textAlign: 'center', fontWeight: 'bold', fontSize: 17, verticalAlign: 'center'}}>
                            {this.props.currentUser}
                            <br/>
                            <label style={{fontWeight: 'normal', fontSize: 13}}>
                            {this.props.currentEmail}
                            </label>
                        </label>


                    </div>
                </Menu.Item>

                <Menu.Item>
                    <Menu.Header>
                        <label onClick={this.handleShow}>
                            Channels
                        </label>
                        <Icon onClick={this.handleChannelAdd} name='add' style={{float: 'right'}}/>
                    </Menu.Header>
                    {this.state.visibleAdd ?
                        <Menu.Item>
                            <Input as='search' transparent={true} icon='search' inverted placeholder='검색'/>
                        </Menu.Item>
                        : ""}
                    {this.state.visibleList ? <Menu.Menu>
                        <Menu.Item onClick={this.handleItemClick}>
                            <label>{this.state.room}</label>
                        </Menu.Item>
                        <Menu.Item name='channel2' onClick={this.handleItemClick}/>
                    </Menu.Menu> : ""

                    }
                </Menu.Item>
            </Menu>
        )
    }
}


const mapStateToProps = (state) => {
    return {
        isLoggedIn: state.authentication.status.isLoggedIn,
        currentUser: state.authentication.status.currentUser,
        currentEmail: state.authentication.status.currentEmail
    }
}

export default connect(mapStateToProps)(SideBar)