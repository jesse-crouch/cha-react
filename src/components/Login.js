import React, { Component } from 'react';
import Cookies from 'js-cookie';
import { setPopupContent, togglePopup } from './popupMethods';
import server from '../fetchServer';
import $ from 'jquery';

export default class Login extends Component {    
    login() {
        var token = Cookies.get('token');
        if (!token) {
            $.post(server + '/api/login', {
                email: document.getElementById('loginEmail').value,
                pass: document.getElementById('loginPassword').value
            }, result => {
                if (result) {
                    if (result.error) {
                        setPopupContent('Error', result.error);
                        togglePopup(true);
                    } else {
                        Cookies.set('token', result.token, { expires: 3 });
                        window.location.replace('/');
                    }
                } else {
                    alert('Something went wrong logging in');
                }
            });
        } else {
            setPopupContent('Error', 'You are already logged in.');
            togglePopup(true);
        }
    }

    render() {
        return (
            <div style={{
                width: '50%',
                margin: '2% auto'
            }}>
                <div className="text-center mb-4">
                    <h3 style={{fontWeight: 'bold'}}>Cosgrove Hockey Portal</h3>
                    For employees, please head over to the
                    <a href="/employees"> employee portal</a>
                    .
                </div>
                    <div className="input-group mb-3">
                        <div className="input-group-prepend">
                            <span className="input-group-text">Email</span>
                        </div>
                        <input id="loginEmail" className="form-control" />
                    </div>
                    <div className="input-group mb-3">
                        <div className="input-group-prepend">
                            <span className="input-group-text">Password</span>
                        </div>
                        <input id="loginPassword" className="form-control" type="password" />
                    </div>
                    <div style={{textAlign: 'center'}}>
                    <button style={{width: '25%'}} className="btn btn-dark" onClick={this.login}>Login</button>
                    </div>
            </div>
        )
    }
}
