import React, { Component } from 'react'
import server from '../fetchServer'
import Cookies from 'js-cookie';
import $ from 'jquery';
import { setPopupContent, togglePopup, setHTMLContent } from './popupMethods';

var defaultFName = '', defaultLName = '', defaultEmail = '', defaultPhone = '';

export default class PersonalInfo extends Component {
    constructor() {
        super();

        this.toggleChangePass = this.toggleChangePass.bind(this);
    }

    changeInfo() {
        $.post(server + '/api/changeInfo', {
            token: Cookies.get('token'),
            first_name: document.getElementById('firstNameInput').value,
            last_name: document.getElementById('lastNameInput').value,
            email: document.getElementById('emailInput').value,
            phone: document.getElementById('phoneInput').value
        }, result => {
            if (result.error) {
                setPopupContent('Error', 'There was a problem changing your inforation. Please try again.');
                togglePopup(true);
            } else {
                // Re-establish the token cookie to reflect the new payload
                $.post(server + '/api/refreshToken', { token: Cookies.get('token') }, refresh => {
                    Cookies.set('token', refresh.token);
                    setPopupContent('Success', 'Your changes have been applied.');
                    togglePopup(true);
                    document.getElementById('changeBtn').style.display = 'none';
                });
            }
        });
    }

    changePassword() {
        var oldPass = document.getElementById('passInput').value;
        var newPass = document.getElementById('newPassInput').value;
        if (oldPass.length === 0 || newPass.length === 0) {
            togglePopup(false);
            setTimeout(() => {
                setPopupContent('Error', 'Password fields cannot be empty');
                togglePopup(true);
            }, 500);
        } else {
            $.post(server + '/api/changePassword', {
                token: Cookies.get('token'),
                oldPass: oldPass,
                newPass: newPass
            }, result => {
                if (result.error) {
                    togglePopup(false);
                    setTimeout(() => {
                        setPopupContent('Error', result.error);
                        togglePopup(true);
                    }, 500);
                } else {
                    togglePopup(false);
                    setTimeout(() => {
                        setPopupContent('Success', 'Your password has been changed.');
                        togglePopup(true);
                    }, 500);
                }
            });
        }
    }

    toggleChangePass() {
        var passwordContent = <div>
            <div className="form-group">
                <label>Current Password</label>
                <input className="form-control" id="passInput" />
            </div>
            <div className="form-group">
                <label>New Password</label>
                <input className="form-control" id="newPassInput" />
            </div>
            <div className="form-group text-center">
                <button id="changePassBtn" className="btn btn-primary" onClick={this.changePassword}>Set Password</button>
            </div>
        </div>;
        setHTMLContent('Change Password', passwordContent);
        togglePopup(true);
    }

    fieldChanged(field) {
        var value = '';
        if (field === 'f_name') {
            value = document.getElementById('firstNameInput').value;
            document.getElementById('changeBtn').style.display = value !== defaultFName ? '' : 'none';
        } else if (field === 'l_name') {
            value = document.getElementById('lastNameInput').value;
            document.getElementById('changeBtn').style.display = value !== defaultLName ? '' : 'none';
        } else if (field === 'email') {
            value = document.getElementById('emailInput').value;
            document.getElementById('changeBtn').style.display = value !== defaultEmail ? '' : 'none';
        } else {
            value = document.getElementById('phoneInput').value;
            document.getElementById('changeBtn').style.display = value !== defaultPhone ? '' : 'none';
        }
    }
    
    componentDidMount() {
        if (Cookies.get('token')) {
            // Get user info
            $.post(server + '/api/getPayload', { token: Cookies.get('token') }, result => {
                var firstName = result.payload.first_name.charAt(0).toUpperCase() + result.payload.first_name.substr(1);
                var lastName = result.payload.last_name.charAt(0).toUpperCase() + result.payload.last_name.substr(1);
                document.getElementById('firstNameInput').value = firstName;
                document.getElementById('lastNameInput').value = lastName;
                document.getElementById('emailInput').value = result.payload.email;
                document.getElementById('phoneInput').value = result.payload.phone;

                defaultFName = firstName;
                defaultLName = lastName;
                defaultEmail = result.payload.email;
                defaultPhone = result.payload.phone;
            });
        } else {
            window.location.replace('/login');
        }
    }

    render() {
        return (
            <div style={{width: "60%", margin: "1em auto"}}>
                <h4 style={{borderBottom: "1px solid #cccccc", marginBottom: "1em"}}>Personal Info</h4>
                <div className="form-group">
                    <label>First Name</label>
                    <input className="form-control" id="firstNameInput" onChange={() => this.fieldChanged('f_name')} />
                </div>
                <div className="form-group">
                    <label>Last Name</label>
                    <input className="form-control" id="lastNameInput" onChange={() => this.fieldChanged('l_name')} />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input className="form-control" id="emailInput" onChange={() => this.fieldChanged('email')} />
                </div>
                <div className="form-group">
                    <label>Phone Number</label>
                    <input className="form-control" id="phoneInput" onChange={() => this.fieldChanged('phone')} />
                </div>
                <div className="text-center">
                    <button className="btn btn-secondary" style={{marginBottom: '2%'}} onClick={this.toggleChangePass}>Change Password</button>
                    <button id="changeBtn" style={{display: 'none', marginLeft: '1%'}} className="btn btn-primary" onClick={this.changeInfo}>Save Changes</button>
                </div>
            </div>
        )
    }
}
