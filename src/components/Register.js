import React from 'react'

function register() {

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
