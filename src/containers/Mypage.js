import React from 'react';
import {Authentication} from 'components'
import 'antd/dist/antd.css';
import { message } from 'antd'
import {connect} from 'react-redux'
import {loginRequest} from "../actions/authentication"
import {browserHistory} from 'react-router'

class MyPage extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div>
            <p>회원정보수정페이지</p>
            </div>
        )
    }
}

// store 안의 state 값을 props로 연결
const mapStateToProps = (state) => {
    return {
        status: state.authentication.login.status   // status를 authentication 컴포넌트에 매핑
    }
}


const mapDispatchToProps = (dispatch) => {
}

// react-redux를 통해 MyPage 컴포넌트를 Redux에 연결
export default connect(mapStateToProps, mapDispatchToProps)(MyPage)
