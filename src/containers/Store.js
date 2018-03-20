import React from 'react';
import {OrderedMap} from 'immutable';
import _ from 'lodash';

const users = OrderedMap({
    '1': {_id: '1', name:"듀랑고", created: new Date()},
    '2': {_id: '2', name:"캡디", created: new Date()},
    '3': {_id: '3', name:"빡시다", created: new Date()},
});

export default class Store extends React.Component{
    constructor(props){
        super(props);
        this.messages = new OrderedMap();
        this.channels = new OrderedMap();
        this.activeChannelId = null;
        this.user = {
            _id : '1',
            name: '이용재',
            created: new Date(),
      };
        this.addMessage = this.addMessage.bind(this);
        this.setActiveChannelId = this.setActiveChannelId.bind(this);
    }



    getCurrentUser(){

        return this.user;
    }

    setActiveChannelId(id){

        this.activeChannelId = id;

    }

    getActiveChannel(){
        const channel = this.activeChannelId ? this.channels.get(this.activeChannelId) : this.channels.first();
        return channel;
    }

    addMessage(id, message = {}){

        this.messages = this.messages.set(`${id}`, message);

        const channelId = _.get(message, 'channelId');
        if(channelId){

            const channel = this.channels.get(channelId);
            channel.messages = channel.messages.set(id, true);
            this.channels = this.channels.set(channelId, channel);
        }

    }

    getMessage(){

        return this.messages.valueSeq();
    }

    getMessageFromChannel(channel){

        let messages = [];

        if(channel){
            channel.messages.map((value, key) => {

                  const message = this.messages.get(key);

                  messages.push(message);

            });
        }
        return messages;
    }

    getMembersFromChannel(channel){

        const members = [];

        if(channel){

            channel.members.map((value, key) => {

                const member = users.get(key);

                members.push(member);
            });
        }
        return members;
    }

    addChannel(index, channel = {}){
        this.channels=this.channels.set(`${index}`, channel);
        //this.app.forceUpdate();
        //this.update();

    }
    getChannels(){

        return this.channels.valueSeq();
    }


    cube2(x) {
      return x;
    }
  }
