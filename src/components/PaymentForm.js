import React from 'react';
import {useStripe, useElements, CardElement} from '@stripe/react-stripe-js';
import CardSection from './CardSection';
import { setPopupContent, togglePopup } from './popupMethods';
import Cookies from 'js-cookie';
import $ from 'jquery';
import server from '../fetchServer';

export default function PaymentForm(props) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    // Check for entered fields on checkout form
    var chargeCard = true;
    var firstNameField = document.getElementById('firstNameField');
    var lastNameField = document.getElementById('lastNameField');
    var phoneField = document.getElementById('phoneField');
    var emailField = document.getElementById('emailField');
    var minorCheck = document.getElementById('minorCheck');
    if (firstNameField.value.length === 0) {
        firstNameField.style.border = '2px solid red';
        chargeCard = false;
    }
    if (lastNameField.value.length === 0) {
        lastNameField.style.border = '2px solid red';
        chargeCard = false;
    }
    if (phoneField.value.length === 0) {
        phoneField.style.border = '2px solid red';
        chargeCard = false;
    }
    if (emailField.value.length === 0) {
        emailField.style.border = '2px solid red';
        chargeCard = false;
    }
    if (minorCheck.checked) {
        var childFirstNameField = document.getElementById('childFirstNameField');
        var childLastNameField = document.getElementById('childLastNameField');
        if (childFirstNameField.value.length === 0) {
            childFirstNameField.style.border = '2px solid red';
            chargeCard = false;
        }
        if (childLastNameField.value.length === 0) {
            childLastNameField.style.border = '2px solid red';
            chargeCard = false;
        }
    }

    if (chargeCard) {
        const result = await stripe.confirmCardPayment(props.clientSecret, {
        payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
            name: document.getElementById('firstNameField').innerHTML + ' ' + document.getElementById('lastNameField').innerHTML,
            },
        }
        });

        if (result.error) {
            // Show error to your customer (e.g., insufficient funds)
            console.log(result.error.message);
            setPopupContent('Error', result.error.message);
            togglePopup(true);
        } else {
            // The payment has been processed!
            if (result.paymentIntent.status === 'succeeded') {
                // Show a success message to your customer
                // There's a risk of the customer closing the window before callback
                // execution. Set up a webhook or plugin to listen for the
                // payment_intent.succeeded event that handles any business critical
                // post-payment actions.
                // Assemble the item ids
                var itemIDs = [];
                var items = Cookies.getJSON('cart').items;
                for (var i in items) {
                    var item = {};
                    item.id = items[i].id;
                    item.date = items[i].epoch_date;
                    itemIDs.push(item);
                }

                // Get payload info
                $.post(server + '/api/getPayload', { token: Cookies.get('token') }, payloadResult => {
                    var payload = payloadResult.payload;
                    
                    var token = Cookies.get('token');
                    var user_id = token ? payload.id : null;
                    var first_name = token ? payload.last_name : firstNameField.value.toLowerCase();
                    var last_name = token ? payload.last_name : lastNameField.value.toLowerCase();
                    var email = token ? payload.email : emailField.value.toLowerCase();
                    var phone = token ? payload.phone : phoneField.value.toLowerCase();
                    var child_first_name = minorCheck.checked ? childFirstNameField.value.toLowerCase() : null;
                    var child_last_name = minorCheck.checked ? childLastNameField.value.toLowerCase() : null;

                    $.post(server + '/sale', {
                        user_id: user_id,
                        first_name: first_name,
                        last_name: last_name,
                        email: email,
                        phone: phone,
                        child_first_name: child_first_name,
                        child_last_name: child_last_name,
                        items: itemIDs,
                        amount_due: 0,
                        free: document.getElementById('membershipRow') != null
                    }, result => {
                        if (!result.error) {
                            setPopupContent('Success', 'Your order has been received. Please be sure to arrive 10 minutes early to your bookings, thanks!');
                            togglePopup(true);

                            Cookies.remove('cart');
                            document.getElementById('submitBtn').style.display = 'none';
                            setTimeout(() => {
                                togglePopup(false);
                                window.location.replace('/services');
                            }, 3000);
                        } else {
                            setPopupContent('Error', result.error);
                            togglePopup(true);
                        }
                    });
                });
            }
        }
    }
  };

  return (
    <form id="paymentForm" onSubmit={handleSubmit}>
      <CardSection />
      <div className="text-center">
        <button id="submitBtn" style={{display: 'none'}} className="btn btn-primary" disabled={!stripe}>Confirm Order</button>
      </div>
    </form>
  );
}