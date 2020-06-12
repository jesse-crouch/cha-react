import React from 'react';
import {useStripe, useElements, CardElement} from '@stripe/react-stripe-js';
import CardSection from './CardSection';
import { setPopupContent, togglePopup, setDOMContent } from './popupMethods';
import Cookies from 'js-cookie';
import $ from 'jquery';
import server from '../fetchServer';
import { date, time } from '../stringDate';

export default function PaymentForm(props) {
    const stripe = useStripe();
    const elements = useElements();

/*    useEffect(() => {
        document.getElementById('paymentForm').style.display = props.amount === 0 ? 'none' : '';
        //document.getElementById('paySubmitBtn').style.display = props.amount === 0 ? '' : 'none';
        //document.getElementById('payCheckDiv').style.display = props.amount === 0 ? 'none' : '';
    }, []);
*/
    async function handleSubmit(event) {
        // We don't want to let default form submission happen here,
        // which would refresh the page.
        event.preventDefault();
    
        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            return;
        }
    
        // Check for entered fields on checkout form
        var firstNameField = document.getElementById('firstNameField');
        var lastNameField = document.getElementById('lastNameField');
        var phoneField = document.getElementById('phoneField');
        var emailField = document.getElementById('emailField');
        var minorCheck = document.getElementById('minorCheck');
    
        var chargeCard = true;
        if (!Cookies.get('token')) {            
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
            // Disable the submit button to prevent spam clicking and confusing the api
            document.getElementById('submitBtn').innerHTML = 'Loading...';
            document.getElementById('submitBtn').className = 'btn btn-warning';
            document.getElementById('submitBtn').disabled = true;

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
                        (async function() {
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
                    
                                    // Get payload info
                                    document.getElementById('submitBtn').style.display = 'none';
                                    $.post(server + '/api/getPayload', { token: Cookies.get('token') }, payloadResult => {
                                        var payload = payloadResult.payload;
                                        
                                        var token = Cookies.get('token');
                                        var user_id = token ? payload.id : 'null';
                                        var first_name = token ? payload.first_name : firstNameField.value.toLowerCase();
                                        var last_name = token ? payload.last_name : lastNameField.value.toLowerCase();
                                        var email = token ? payload.email : emailField.value.toLowerCase();
                                        var phone = token ? payload.phone : phoneField.value.toLowerCase();
                                        var child_first_name = minorCheck.checked ? childFirstNameField.value.toLowerCase() : '';
                                        var child_last_name = minorCheck.checked ? childLastNameField.value.toLowerCase() : '';
                    
                                        $.post(server + '/api/sale', {
                                            user_id: user_id,
                                            token: Cookies.get('token'),
                                            first_name: first_name,
                                            last_name: last_name,
                                            email: email,
                                            phone: phone,
                                            child_first_name: child_first_name,
                                            child_last_name: child_last_name,
                                            amount_due: 0,
                                            cart: Cookies.get('cart'),
                                            free: document.getElementById('membershipRow') != null
                                        }, result => {
                                            if (!result.error) {
                                                setPopupContent('Success', 'Your order has been received. Please be sure to arrive 10 minutes early to your bookings, thanks!');
                                                togglePopup(true);
                                                setTimeout(() => {
                                                    window.location.replace('/services');
                                                }, 3000);
                    
                                                Cookies.remove('cart');
                                                document.getElementById('submitBtn').style.display = 'none';
                                            } else {
                                                setPopupContent('Error', result.error);
                                                togglePopup(true);
                                            }
                                        });
                                    });
                                }
                            }
                        })();
                    }
                }
            });
        }
    }

    return (
        <form id="paymentForm" onSubmit={handleSubmit}>
            <CardSection />
            <div className="text-center">
                <button id="submitBtn" style={{display: 'none'}} className="btn btn-primary" disabled={!stripe}>Confirm Order</button>
            </div>
        </form>
    )
}
