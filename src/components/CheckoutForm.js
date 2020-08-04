import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import PaymentForm from './PaymentForm';
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import server from '../fetchServer';
import $ from 'jquery';
import Cookies from 'js-cookie';
import { setPopupContent, togglePopup, setDOMContent } from './popupMethods';
import { date, time } from '../stringDate';
// eslint-disable-next-line
import { STRIPE_API_KEY_LIVE, STRIPE_API_KEY_TEST } from '../privateKeys';

var payload = null, clientSecret = null;

export default class CheckoutForm extends Component {
    constructor(props) {
        super();

        this.state = {
            stripePromise: loadStripe(STRIPE_API_KEY_LIVE)
        }

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        $.post(server + '/api/getClientSecret', { amount: this.props.amount }, result => {
            clientSecret = result.clientSecret;
            var elements =  <Elements stripe={this.state.stripePromise}>
                                <PaymentForm clientSecret={clientSecret} amountDue={this.props.amount} />
                            </Elements>;
            ReactDOM.render(elements, document.getElementById('payment-form'), () => {
                document.getElementById('submitBtn').style.display = '';
                if (Cookies.get('token')) {
                    $.post(server + '/api/getPayload', { token: Cookies.get('token') }, result => {
                        payload = result.payload;
                    });

                    var divs = document.getElementsByClassName('non-user');
                    for (var i in divs) {
                        if (divs[i].style !== undefined) {
                            divs[i].style.display = 'none';
                        }
                    }
                }
            });
        });
    }

    handleMinorCheck(event) {
        // Display or hide the minor form
        document.getElementById('childForm').style.display = event.target.checked ? '' : 'none';
    }

    handlePayCheck(event) {
        // Display or hide the stripe form
        var paymentForm = document.getElementById('paymentForm');
        var paySubmitBtn = document.getElementById('paySubmitBtn');

        if (paymentForm === null) paymentForm.style.display = event.target.checked ? 'none' : '';
        if (paySubmitBtn === null) paySubmitBtn.style.display = event.target.checked ? '' : 'none';
    }

    handleSubmit() {
        // Check for entered fields on checkout form
        var firstNameField = document.getElementById('firstNameField');
        var lastNameField = document.getElementById('lastNameField');
        var phoneField = document.getElementById('phoneField');
        var emailField = document.getElementById('emailField');
        var minorCheck = document.getElementById('minorCheck');

        var completeOrder = true;
        if (!Cookies.get('token')) {            
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

        if (completeOrder) {
            // Disable the submit button to prevent spam clicking and confusing the api
            document.getElementById('paySubmitBtn').innerHTML = 'Loading...';
            document.getElementById('paySubmitBtn').className = 'btn btn-warning';
            document.getElementById('paySubmitBtn').disabled = true;

            // Check before charging if any items have become unavailable
            $.post(server + '/api/checkAvailable', { cart: Cookies.get('cart') }, availableResult => {
                if (availableResult.error) {
                    setPopupContent('Error', availableResult.error);
                    togglePopup(true);
                } else {
                    if (availableResult.fullEvents.length > 0) {
                        // At least one item has become unavailable
                        var items = document.createElement('p');
                        var warning = document.createTextNode('Some of the items you have booked have become unavailble while they have been in your cart. The following items have been removed from your cart:');
                        items.appendChild(warning);
                        items.appendChild(document.createElement('br'));
                        items.appendChild(document.createElement('br'));
                        var cart = JSON.parse(Cookies.get('cart'));
                        for (var i in availableResult.fullEvents) {
                            var itemDate = new Date(parseInt(availableResult.fullEvents[i].epoch_date)*1000);
                            var item = document.createTextNode(availableResult.fullEvents[i].name + ' on ' + date(itemDate) + ' at ' + time(itemDate));
                            items.appendChild(item);
                            items.appendChild(document.createElement('br'));

                            // Remove this item from the cart
                            if (cart.items.length === 1) {
                                Cookies.remove('cart');
                            } else {
                                for (var j in cart.items) {
                                    if (cart.items[j].id === availableResult.fullEvents[i].id) {
                                        cart.items.splice(j,1);
                                        Cookies.set('cart', { items: cart.items }, { expires: 0.5 });
                                    }
                                }
                            }
                        }
                        Cookies.set('reload', 'true');
                        setDOMContent('Warning', items);
                        togglePopup(true);
                    } else {
                        var token = Cookies.get('token');
                        var user_id = token ? payload.id : 'null';
                        var first_name = token ? payload.first_name : firstNameField.value.toLowerCase();
                        var last_name = token ? payload.last_name : lastNameField.value.toLowerCase();
                        var email = token ? payload.email : emailField.value.toLowerCase();
                        var phone = token ? payload.phone : phoneField.value.toLowerCase();
                        var child_first_name = minorCheck.checked ? childFirstNameField.value.toLowerCase() : '';
                        var child_last_name = minorCheck.checked ? childLastNameField.value.toLowerCase() : '';
            
                        //alert(Cookies.get('token'));
                        $.post(server + '/api/sale', {
                            user_id: user_id,
                            token: Cookies.get('token'),
                            first_name: first_name,
                            last_name: last_name,
                            email: email,
                            phone: phone,
                            child_first_name: child_first_name,
                            child_last_name: child_last_name,
                            amount_due: this.props.amount,
                            cart: Cookies.get('cart'),
                            free: document.getElementById('membershipRow') != null,
                            intent: null
                        }, result => {
                            if (!result.error) {
                                if (result.fullEvents.length > 0) {
                                    // One or more items in the cart could not be booked
                                    var items = document.createElement('p');
                                    var warning = document.createTextNode('Some of the items you have booked have become unavailble in the time since you added them to your cart. Any other bookings in your cart have been booked successfully. The unavailable items are:');
                                    items.appendChild(warning);
                                    items.appendChild(document.createElement('br'));
                                    items.appendChild(document.createElement('br'));
                                    for (var i in result.fullEvents) {
                                        var itemDate = new Date(parseInt(result.fullEvents[i].epoch_date)*1000);
                                        var item = document.createTextNode(result.fullEvents[i].name + ' on ' + date(itemDate) + ' at ' + time(itemDate));
                                        items.appendChild(item);
                                        items.appendChild(document.createElement('br'));
                                    }
                                    setDOMContent('Warning', items);
                                    togglePopup(true);
                                } else {
                                    setPopupContent('Success', 'Your order has been received. Please be sure to arrive 10 minutes early to your bookings, thanks!');
                                    togglePopup(true);
                                    Cookies.remove('multiBookings');
                                    setTimeout(() => {
                                        // Check for new token
                                        if (result.token !== null) {
                                            Cookies.set('token', result.token);
                                        }

                                        window.location.replace('/services');
                                    }, 3000);
                                }
                                Cookies.remove('cart');
                                document.getElementById('paySubmitBtn').style.display = 'none';
                            } else {
                                setPopupContent('Error', result.error);
                                togglePopup(true);
                            }
                        });
                    }
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
                            <input className="form-control" id="emailField" type="text" />
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
                            <div className="form-group col-md-6 text-center" id="payCheckDiv">
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
                <div id="payment-form"></div>
            </div>
        )
    }
}
