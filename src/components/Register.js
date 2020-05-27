import React from 'react'
import server from '../fetchServer';
import { togglePopup, setPopupContent } from './popupMethods';
import $ from 'jquery';

function register() {
    var firstNameField = document.getElementById('firstNameField');
    var lastNameField = document.getElementById('lastNameField');
    var emailField = document.getElementById('emailField');
    var phoneField = document.getElementById('phoneField');

    // Check for empty or invalid fields
    var validInfo = true;
    if (firstNameField.value.length < 1) {
        validInfo = false;
        firstNameField.style.border = '1px solid red';
    }
    if (lastNameField.value.length < 1) {
        validInfo = false;
        lastNameField.style.border = '1px solid red';
    }
    if (emailField.value.length < 1 || !emailField.value.includes('@')) {
        validInfo = false;
        emailField.style.border = '1px solid red';
    }
    if (phoneField.value.length < 1) {
        validInfo = false;
        phoneField.style.border = '1px solid red';
    }
    if (validInfo) {
        $.post(server + '/api/register', {
            first_name: firstNameField.value,
            last_name: lastNameField.value,
            email: emailField.value,
            phone: phoneField.value
        }, result => {
            if (result.error) {
                setPopupContent('Error', result.error);
                togglePopup(true);
            } else {
                setPopupContent('Success', 'Your information has been saved, but you are not yet registered. Please click the link sent to your email address to complete the process.');
                togglePopup(true);
                setTimeout(() => {
                    window.location.replace('/login');
                }, 4000);
            }
        })
    }
}

export default function Register() {
    return (
        <div className="container" style={{marginTop: "2em"}}>
            <div className="titles text-center" style={{marginBottom: "2em"}}>
                <h2 style={{fontWeight: "bold"}}>Registration</h2>
                <h6>Thanks for signing up with us!</h6>
                <h6>Simply fill out the form below, verify your email, and you'll be part of the team.</h6>
            </div>
            <div className="w-75" style={{margin: "0 auto"}}>
                <div className="form-row">
                    <div className="form-group col-md-6">
                        <label for="inputEmail4">First Name</label>
                        <input className="form-control" id="firstNameField" type="text" />
                    </div>
                    <div className="form-group col-md-6">
                        <label for="inputPassword4">Last Name</label>
                        <input className="form-control" id="lastNameField" type="text" />
                    </div>
                </div>
                <div className="form-group">
                    <label for="inputAddress">Email Address</label>
                    <input className="form-control" id="emailField" type="text" />
                </div>
                <div className="form-row">
                    <div className="form-group col-md-12">
                        <label for="inputPhone">Phone Number</label>
                        <input className="form-control" id="phoneField" type="text" maxLength="10" />
                    </div>
                </div>
                <div className="text-center">
                    <h6>Cosgrove Hockey Academy will never send unsolicited emails or phone calls, only to confirm payments or bookings.</h6>
                    <h6 style={{color: "red", display: "none"}} id="emptyWarning">Please fill in the required information</h6>
                    <button className="btn btn-primary" onClick={register}>Register</button>
                </div>
            </div>
        </div>
    );
}
