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

    searchUsers(search = ""){

        console.log("서치 네임", search);
        console.log("서치 네임", search.length);
        console.log("길이", _.trim(search).legnth);
        let searchItems = new OrderedMap();
        if(search.length){

            users.filter((user) => {
                const name = _.get(user, 'name');
               const userId = _.get(user, '_id');
                console.log("name is:", name);
                if(_.includes(name, search)){
                      searchItems = searchItems.set(userId, user);
                }
            })
        }
        console.log("name is2:", name);
        return searchItems.valueSeq();

    }

    onCreatedNewChannel(channel){

    const channelId = _.get(channel, '_id');
    this.addChannel(channelId, channel);
    this.setActiveChannelId(channelId);
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

    componentDidMount(){
      console.log("디드마운트됌");
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

        //return this.channels.valueSeq(); //기존 불러오는방식

        this.channels = this.channels.sort((a,b) => a.created < b.created);

        return this.channels.valueSeq();
    }


    cube2(x) {
      return x;
    }
  }
