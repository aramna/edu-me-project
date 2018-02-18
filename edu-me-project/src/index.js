import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, IndexRoute, browserHistory} from 'react-router';
import {App, Home, Login, Register, Chat} from 'containers'

// Redux
import {Provider} from 'react-redux'
import {createStore, applyMiddleware} from 'redux'
import reducers from 'reducers'
import thunk from 'redux-thunk'

import 'semantic-ui-css/semantic.min.css'
import 'bootstrap/dist/css/bootstrap.css';

const store = createStore(reducers, applyMiddleware(thunk))


const rootElement = document.getElementById('root')
ReactDOM.render(
    <Provider store={store}>
        <Router history={browserHistory}>
            <Route path="/" component={App}>
                <IndexRoute component={Home}/>
                <Route path="login" component={Login}/>
                <Route path="register" component={Register}/>
                <Route path="chat" component={Chat}/>
            </Route>
        </Router>
    </Provider>,
    rootElement
);
