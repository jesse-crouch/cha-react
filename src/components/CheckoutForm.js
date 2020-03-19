import React, { Component } from 'react'
import PaymentForm from './PaymentForm';
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import server from '../fetchServer';
import $ from 'jquery';
import Cookies from 'js-cookie';
import { setPopupContent, togglePopup } from './popupMethods';

export default class CheckoutForm extends Component {
    constructor(props) {
        super();

        $.post(server + '/api/getClientSecret', { amount: props.amount }, result => {
            this.setState(prevState => {
                return {
                    stripePromise: prevState.stripePromise,
                    clientSecret: result.clientSecret
                };
            });
            document.getElementById('submitBtn').style.display = '';

            $.post(server + '/api/getPayload', { token: Cookies.get('token') }, result => {
                this.setState(prevState => {
                    return {
                        stripePromise: prevState.stripePromise,
                        clientSecret: prevState.clientSecret,
                        payload: result.payload         
                    };
                });
            });
        });

        this.state = {
            stripePromise: loadStripe('pk_test_cAJXHTciFWzvt1n3Tq1nLpsZ003fCUfr5C')
        }
    }

    componentDidMount() {
        var token = Cookies.get('token');
        if (token) {
            var divs = document.getElementsByClassName('non-user');
            for (var i in divs) {
                if (divs[i].style !== undefined) {
                    divs[i].style.display = 'none';
                }
            }
        }
    }

    handleMinorCheck(event) {
        // Display or hide the minor form
        document.getElementById('childForm').style.display = event.target.checked ? '' : 'none';
    }

    handlePayCheck(event) {
        // Display or hide the stripe form
        document.getElementById('paymentForm').style.display = event.target.checked ? 'none' : '';
        document.getElementById('paySubmitBtn').style.display = event.target.checked ? '' : 'none';
    }

    handleSubmit() {
        // Check for entered fields on checkout form
        var completeOrder = true;
        if (Cookies.get('token')) {
            var firstNameField = document.getElementById('firstNameField');
            var lastNameField = document.getElementById('lastNameField');
            var phoneField = document.getElementById('phoneField');
            var emailField = document.getElementById('emailField');
            var minorCheck = document.getElementById('minorCheck');
            if (firstNameField.value.length === 0) {
                firstNameField.style.border = '2px solid red';
                completeOrder = false;
            }
            if (lastNameField.value.length === 0) {
                lastNameField.style.border = '2px solid red';
                completeOrder = false;
            }
            if (phoneField.value.length === 0) {
                phoneField.style.border = '2px solid red';
                completeOrder = false;
            }
            if (emailField.value.length === 0) {
                emailField.style.border = '2px solid red';
                completeOrder = false;
            }
        }

        if (minorCheck.checked) {
            var childFirstNameField = document.getElementById('childFirstNameField');
            var childLastNameField = document.getElementById('childLastNameField');
            if (childFirstNameField.value.length === 0) {
                childFirstNameField.style.border = '2px solid red';
                completeOrder = false;
            }
            if (childLastNameField.value.length === 0) {
                childLastNameField.style.border = '2px solid red';
                completeOrder = false;
            }
        }

        // Assemble the item ids
        var itemIDs = [];
        var items = Cookies.getJSON('cart').items;
        for (var i in items) {
            var item = {};
            item.id = items[i].id;
            item.date = items[i].epoch_date;
            itemIDs.push(item);
        }

        if (completeOrder) {
            var token = Cookies.get('token');
            var first_name = token ? this.state.payload.last_name : firstNameField.value.toLowerCase();
            var last_name = token ? this.state.payload.last_name : lastNameField.value.toLowerCase();
            var email = token ? this.state.payload.email : emailField.value.toLowerCase();
            var phone = token ? this.state.payload.phone : phoneField.value.toLowerCase();
            var child_first_name = minorCheck.checked ? childFirstNameField.value.toLowerCase() : null;
            var child_last_name = minorCheck.checked ? childLastNameField.value.toLowerCase() : null;

            $.post(server + '/sale', {
                first_name: first_name,
                last_name: last_name,
                email: email,
                phone: phone,
                child_first_name: child_first_name,
                child_last_name: child_last_name,
                items: itemIDs,
                amount_due: this.props.amount
            }, result => {
                if (!result.error) {
                    setPopupContent('Success', 'Your order has been received. Please be sure to arrive 10 minutes early to your bookings, thanks!');
                    togglePopup(true);

                    Cookies.remove('cart');
                    document.getElementById('paySubmitBtn').style.display = 'none';
                    setTimeout(() => {
                        window.location.replace('/services');
                    }, 3000);
                } else {

                }
            });
        }
    }

    render() {
        return (
            <div id="checkout-div" style={{width: '60%', margin: '2% auto'}}>
                <div>
                    <div className="form-row non-user">
                        <div className="form-group col-md-6">
                            <label>First Name</label>
                            <input className="form-control" id="firstNameField" type="text" />
                        </div>
                        <div className="form-group col-md-6">
                            <label>Last Name</label>
                            <input className="form-control" id="lastNameField" type="text" />
                        </div>
                    </div>
                    <div className="form-row non-user">
                        <div className="form-group col-md-12">
                            <label>Email Address</label>
                            <input className="form-control" id="phoneField" type="text" />
                        </div>
                    </div>
                    <div className="form-row non-user">
                        <div className="form-group col-md-12">
                            <label>Phone Number</label>
                            <input className="form-control" id="phoneField" type="text" />
                        </div>
                    </div>
                    <div id="minorCheckForm" style={{display: 'block'}}>
                        <div className="form-row">
                            <div className="form-group col-md-6 text-center">
                                <label>Is this booking for a minor?</label>
                                <input id="minorCheck" type="checkbox" style={{marginLeft: '0.5em', verticalAlign: '-0.3em'}} onClick={(e) => this.handleMinorCheck(e)} />
                            </div>
                            <div className="form-group col-md-6 text-center">
                                <label>Are you paying in person?</label>
                                <input id="payCheck" type="checkbox" style={{marginLeft: '0.5em', verticalAlign: '-0.3em'}} onClick={(e) => this.handlePayCheck(e)} />
                            </div>
                        </div>
                    </div>
                    <div id="childForm" style={{display: 'none'}}>
                        <div className="form-group" style={{flex: '49%', marginRight: '0.5em'}}>
                            <label>Child's First Name</label>
                            <input className="form-control" id="childFirstNameField" type="text" />
                        </div>
                        <div className="form-group" style={{flex: "49%"}}>
                            <label>Child's Last Name</label>
                            <input className="form-control" id="childLastNameField" type="text" />
                        </div>
                    </div>
                </div>
                <div className="text-center">
                    <button id="paySubmitBtn" className="btn btn-primary" style={{display: 'none'}} onClick={this.handleSubmit} >Confirm Order</button>
                </div>
                
                <Elements stripe={this.state.stripePromise}>
                    <PaymentForm clientSecret={this.state.clientSecret} />
                </Elements>

            </div>
        )
    }
}