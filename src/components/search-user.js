import React, {Component} from 'react';
import _ from 'lodash';

export default class SearchUser extends Component{

    render(){

      const {Store, search} = this.props;

      const users = Store.searchUsers(search);

      return <div>
                <div>
                  {users.map((user, index) => {

                      return <div key = {index}>
                          <h2>{_.get(user,'name')}</h2>
                      </div>
                  })}
                </div>

            </div>
    }
}
