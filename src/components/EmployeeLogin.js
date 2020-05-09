import React, { Component } from 'react';
import Cookies from 'js-cookie';
import { setPopupContent, togglePopup } from './popupMethods';
import server from '../fetchServer';
import $ from 'jquery';

export default class Login extends Component {    
    login() {
        var token = Cookies.get('token');
        if (!token) {
            $.post(server + '/api/employeeLogin', {
                email: document.getElementById('loginEmail').value,
                pass: document.getElementById('loginPassword').value
            }, result => {
                if (result) {
                    if (result.error) {
                        setPopupContent('Error', result.error);
                        togglePopup(true);
                    } else {
                        Cookies.set('token', result.token, { expires: 3 });
                        // Check for special logins and redirect as necessary
                        var email = document.getElementById('loginEmail').value;
                        if (email === 'reception') {
                            window.location.replace('/reception');
                        } else if (email === 'cosgrove') {
                            window.location.replace('/account');
                        } else {
                            window.location.replace('/employee');
                        }
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

    componentDidMount() {
        document.getElementById('loginPassword').addEventListener('keypress', e => {
            if (e.key === 'Enter') {
                this.login();
            }
        });
    }

    register() {
        window.location.replace('/register');
    }

    render() {
        return (
            <div style={{
                width: '50%',
                margin: '2% auto'
            }}>
                <div className="text-center mb-4">
                    <h3 style={{fontWeight: 'bold'}}>Employee Portal</h3>
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
