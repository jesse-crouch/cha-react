import React, { Component } from 'react';
import Cookies from 'js-cookie';
import { setPopupContent, setDOMContent, togglePopup } from './popupMethods';
import server from '../fetchServer';
import $ from 'jquery';

export default class Login extends Component {    
    login() {
        var token = Cookies.get('token');
        if (!token) {
            // Temporary, check for names
            // Check if verified first
            $.post(server + '/api/checkVerified', { email: document.getElementById('loginEmail').value }, verifiedResult => {
            	if (verifiedResult.verified) {
            	$.post(server + '/api/login', {
					email: document.getElementById('loginEmail').value,
					pass: document.getElementById('loginPassword').value
				    }, result => {
					if (result) {
					    if (result.error) {
						setPopupContent('Error', result.error);
						togglePopup(true);
					    } else {
						Cookies.set('token', result.token, { expires: 0.5 });
						window.location.replace('/');
					    }
					} else {
					    alert('Something went wrong logging in');
					}
				    });
            	} else {
            var nameCheckContainer = document.createElement('div');
            nameCheckContainer.className = 'text-center';
            var description = document.createElement('p');
            description.innerHTML = 'Please provide the following information to verify your account:';
            
            var nameCheck = document.createElement('div');
            nameCheck.className = 'form-row';
            var firstNameGroup = document.createElement('div');
            firstNameGroup.className = 'form-group col-md-6';
            var firstNameInput = document.createElement('input');
            firstNameInput.id = 'firstNameInput';
            firstNameInput.placeholder = 'First Name';
            firstNameGroup.appendChild(firstNameInput);

            var lastNameGroup = document.createElement('div');
            lastNameGroup.className = 'form-group col-md-6';
            var lastNameInput = document.createElement('input');
            lastNameInput.id = 'lastNameInput';
            lastNameInput.placeholder = 'Last Name';
            lastNameGroup.appendChild(lastNameInput);
            
            var loginBtn = document.createElement('button');
            loginBtn.className = 'btn btn-primary';
            loginBtn.innerHTML = 'Login';
            loginBtn.addEventListener('click', () => {
            	var firstName = document.getElementById('firstNameInput').value;
            	var lastName = document.getElementById('lastNameInput').value;
            	
            	if (firstName.length > 0) {
            		if (lastName.length > 0) {
            			$.post(server + '/api/login', {
            				first_name: firstName,
            				last_name: lastName,
					email: document.getElementById('loginEmail').value,
					pass: document.getElementById('loginPassword').value
				    }, result => {
					if (result) {
					    if (result.error) {
						setPopupContent('Error', result.error);
						togglePopup(true);
					    } else {
						Cookies.set('token', result.token, { expires: 0.5 });
						window.location.replace('/');
					    }
					} else {
					    alert('Something went wrong logging in');
					}
				    });
            		} else {
            			document.getElementById('firstNameInput').style.border = '1px solid black';
            			document.getElementById('lastNameInput').style.border = '1px solid red';
            		}
            	} else {
            		document.getElementById('firstNameInput').style.border = '1px solid red';
            	}
            });
            nameCheck.appendChild(firstNameGroup);
            nameCheck.appendChild(lastNameGroup);
            nameCheckContainer.appendChild(description);
            nameCheckContainer.appendChild(nameCheck);
            nameCheckContainer.appendChild(loginBtn);

            setDOMContent('Security Check', nameCheckContainer);
            togglePopup(true);
            }
            });
            
        } else {
            setPopupContent('Error', 'You are already logged in.');
            togglePopup(true);
        }
    }

    register() {
        window.location.replace('/register');
    }

    componentDidMount() {
        document.getElementById('loginPassword').addEventListener('keypress', e => {
            if (e.key === 'Enter') {
                this.login();
            }
        });
    }

    render() {
	var width = document.documentElement.clientWidth < 950 ? '80%' : '50%';

        return (
            <div id="login-page" style={{
                width: width,
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
                        <button style={{width: '25%', marginLeft: '2%'}} className="btn btn-light" onClick={this.register}>Register</button>
                    </div>
            </div>
        )
    }
}
