import React, { Component } from 'react'
import server from '../fetchServer'
import $ from 'jquery';
import { setPopupContent, togglePopup } from './popupMethods';

export default class Verification extends Component {
    constructor() {
        super();
        this.state = {
            error: null
        };
    }

    componentDidMount() {
        var token = new URL(window.location.href).searchParams.get('t');
        $.post(server + '/api/verification', { token: token }, result => {
            if (result.error) {
                this.setState({
                    error: true
                });
            } else {
                this.setState({
                    error: false
                }, () => {
                    document.getElementById('submitBtn').disabled = true;
                });
            }
        });
    }

    render() {
        if (this.state.error === null) {
            return (
                <div className="text-center mt-5">
                    <h5>Loading...</h5>
                </div>
            );
        } else if (this.state.error) {
            return (
                <div className="text-center mt-5">
                    <h5>This verification token has expired, please re-register and verifiy within 30 minutes.</h5>
                </div>
            );
        } else {
            return (
                <div className="text-center mt-5">
                    <h5 className="mb-5">Please enter a password below.</h5>
                    <div className="form-row w-50 mx-auto">
                        <div className="form-group col-md-12">
                            <label>Password</label>
                            <input className="form-control" id="passwordField" type="password" />
                        </div>
                    </div>
                    <div className="form-row w-50 mx-auto">
                        <div className="form-group col-md-12">
                            <label>Repeat Password</label>
                            <input className="form-control" id="repeatPasswordField" type="password" onChange={() => {
                                var passField = document.getElementById('passwordField');
                                var repeatPassField = document.getElementById('repeatPasswordField');
                                if (passField.value === repeatPassField.value) {
                                    document.getElementById('submitBtn').disabled = false;
                                } else {
                                    document.getElementById('submitBtn').disabled = true;
                                }
                            }} />
                        </div>
                    </div>
                    <button className="btn btn-primary mx-auto w-25" id="submitBtn" onClick={() => {
                        $.post(server + '/api/finishRegistration', { password: document.getElementById('passwordField').value, token: new URL(window.location.href).searchParams.get('t') }, result => {
                            if (result.error) {
                                setPopupContent('Error', result.error);
                                togglePopup(true);
                            } else {
                                setPopupContent('Success', 'You have been successfully registered.');
                                togglePopup(true);
                                setTimeout(() => {
                                    window.location.replace('/login');
                                }, 3000);
                            }
                        });
                    }}>Submit</button>
                </div>
            );
        }
    }
}
