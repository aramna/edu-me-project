import React from 'react';
import socketio from 'socket.io-client'
import {OrderedMap} from 'immutable'
import _ from 'lodash'
import {ChatContainer} from '../containers'
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

      constructor(props) {
          super(props)
          this.state = {

            //  messages: [], //추가
          }
        }


        componentDidMount(){
            console.log("사이드바 디드 마운트");
        //    console.log(ChatContainer(cube3(3)));
        }

    // handleItemClick (name) {
    //     this.setState({ activeItem: name })
    // }

    //console.log("STORE:", this.props.Store);
    render() {
      const {Store} = this.props;
      const activeChannel = Store.getActiveChannel();
      const messages = Store.getMessageFromChannel(activeChannel);
      const channels = Store.getChannels();

      if(activeChannel){
        console.log("Active channel is:", activeChannel);
        console.log("Message in channel", activeChannel._id, messages);
      }
      //console.log(Store.getChannels());
      //console.log("ST2: ", this.props.Store);
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
                <div>
                    {channels.map((channel, key) => {
                      //const {ChatContainer} = this.state;
                      return (
                          <div onClick={(key) => {
                              Store.setActiveChannelId(channel._id);
                              this.forceUpdate();
                            //  console.log("작동중:", ChatContainer.cube3(3));

                          }} key={channel._id}>
                              <div>{channel.title}</div>
                                <div>{channel.lastMessage}</div>
                          </div>
                      )
                    })}

                </div>
            </Container>

        )
    }
}



export default SideBar
