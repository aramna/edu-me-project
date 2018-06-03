import {
    AUTH_LOGIN,
    AUTH_LOGIN_SUCCESS,
    AUTH_LOGIN_FAILURE,
    AUTH_REGISTER,
    AUTH_REGISTER_SUCCESS,
    AUTH_REGISTER_FAILURE,
    AUTH_GET_STATUS,
    AUTH_GET_STATUS_SUCCESS,
    AUTH_GET_STATUS_FAILURE,
    AUTH_REREGISTER,
    AUTH_LOGOUT
} from './ActionTypes';
import axios from 'axios';

/* ====== AUTH ====== */

/* 로그인 */
export function loginRequest(email, password) {
    return (dispatch) => {
        dispatch(login());

        return axios.post('/api/user/login', { email, password })
            .then((response) => {
                let userInfo = [response.data.info.username, response.data.info.email]
                dispatch(loginSuccess(userInfo));
            }).catch((error) => {
                dispatch(loginFailure());
            });
    };
}


export function login() {
    return {
        type: AUTH_LOGIN
    };
}

export function loginSuccess(userData) {
    return {
        type: AUTH_LOGIN_SUCCESS,
        userData
    };
}

export function loginFailure() {
    return {
        type: AUTH_LOGIN_FAILURE
    };
}

/* 회원가입 */
export function registerRequest(username, email, password) {
    return (dispatch) => {
        dispatch(register());

        return axios.post('/api/user/adduser', { username, email, password })
            .then((response) => {
                dispatch(registerSuccess());
            }).catch((error) => {
                dispatch(registerFailure(error.response.data.code));
            });
    };
}

export function register() {
    return {
        type: AUTH_REGISTER
    };
}

export function registerSuccess() {
    return {
        type: AUTH_REGISTER_SUCCESS,
    };
}

export function registerFailure(error) {
    return {
        type: AUTH_REGISTER_FAILURE,
        error
    };
}

/* 로그인 세션 확인 */

export function getStatusRequest() {
    return (dispatch) => {
        dispatch(getStatus());
        return axios.get('/api/user/getinfo')
            .then((response) => {
                let userInfo = [response.data.info.username, response.data.info.email]
                dispatch(getStatusSuccess(userInfo));
            }).catch((error) => {
                dispatch(getStatusFailure());
            });
    };
}

export function getStatus() {
    return {
        type: AUTH_GET_STATUS
    };
}

export function getStatusSuccess(userData) {
    return {
        type: AUTH_GET_STATUS_SUCCESS,
        userData
    };
}

export function getStatusFailure() {
    return {
        type: AUTH_GET_STATUS_FAILURE
    };
}

/* 리레지스터 */
export function reRegister(username){
  return (dispatch) => {
      return axios.post('api/user/reregister', {username})
          .then((response) => {
              dispatch(reregister());
          });
  };
}

export function reregister() {
    return {
        type: AUTH_REREGISTER
    };
}


/* 로그아웃 */
export function logoutRequest() {
    return (dispatch) => {
        return axios.post('/api/user/logout')
            .then((response) => {
                dispatch(logout());
            });
    };
}

export function logout() {
    return {
        type: AUTH_LOGOUT
    };
}
