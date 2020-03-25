import React, { Component } from 'react';
import Cookies from 'js-cookie';
import server from '../fetchServer';
import $ from 'jquery';

export default class Header extends Component {
    componentDidMount() {
        var token = Cookies.get('token');
        if (token) {
            $.post(server + '/api/getPayload', { token: token }, result => {
                if (result) {
                    var name = result.payload.first_name[0].toUpperCase() + result.payload.first_name.substr(1);
                    document.getElementById('headerLogin').innerHTML = name;

                    var registerBtn = document.getElementById('headerRegister');
                    registerBtn.innerHTML = 'Logout';
                    registerBtn.className = 'btn btn-outline-danger';
                } else {
                    alert('Something went wrong fetching payload');
                }
            });
        } else {
            document.getElementById('headerLogin').innerHTML = 'Login';

            var registerBtn = document.getElementById('headerRegister');
            registerBtn.innerHTML = 'Register';
            registerBtn.className = 'btn btn-outline-light';
        }
    }

    handleLogin() {
        // Check if already logged in, and send to account page instead
        if (document.getElementById('headerLogin').innerHTML === 'Login') {
            window.location.replace('/login');
        } else {
            window.location.replace('/account');
        }
    }

    handleRegister() {
        var registerBtn = document.getElementById('headerLogin');
        if (registerBtn.innerHTML === 'Register') {
            window.location.replace('/register');
        } else {
            Cookies.remove('token');
            window.location.replace('/');
        }
    }

    render() {
        return (
            <nav id="navbar" className="navbar navbar-expand-lg navbar-dark bg-black">
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo01" aria-controls="navbarTogglerDemo01" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
                    <a className="navbar-brand" href="/">
                        <img src="./images/branding/logo_white_lg.png" alt="logo" height="75"/>
                    </a>
                    <ul className="main-navbar navbar-nav mr-auto mt-2 mt-lg-0">
                        <li className="nav-item">
                            <a className="nav-link" href="/schedule">Schedule</a>
                        </li>
                        <li className="nav-item" id="services-link">
                            <a className="nav-link" href="/services">Services</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/memberships">Memberships</a>
                        </li>
                    </ul>
                    <div className="form-inline my-2 my-lg-0">
                        <button id="headerLogin" className="btn btn-outline-light mr-2" onClick={this.handleLogin}>Login</button>
                        <button id="headerRegister" className="btn btn-outline-light" onClick={this.handleRegister}>Register</button>
                    </div>
                </div>
            </nav>
        )
    }
}
