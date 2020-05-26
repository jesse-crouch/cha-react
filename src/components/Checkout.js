import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Cookies from 'js-cookie';
import {time} from '../stringDate';
import CheckoutForm from './CheckoutForm';
import $ from 'jquery';
import server from '../fetchServer';
import { /*setHTMLContent,*/ togglePopup, setPopupContent } from './popupMethods';
import { uuid } from 'uuidv4';
//import { uuid } from 'uuidv4';

var subtotal = 0;
var total = 0;
var timer = null;

export default class Checkout extends Component {
    constructor() {
        super();

        this.state = {
            staging: false
        };
    }

    finishStaging() {
        // Refresh the page
        setPopupContent('Success', 'Drop-In added successfully');
        togglePopup(true);
        setTimeout(() => {
            Cookies.remove('cart');
            window.location.replace('/account');
        }, 2000);
    }

    addTotals() {
        // Add subtotal, tax, and total rows
        var tax = subtotal*0.13;
        total = Number.parseFloat(subtotal) + Number.parseFloat(tax);
        this.addRow({
            name: '',
            time: 'Subtotal',
            price: subtotal + '/'
        });
        this.addRow({
            name: '',
            time: 'Tax (HST)',
            price: tax + '/'
        });
        this.addRow({
            name: '',
            time: 'Total',
            price: total + '/'
        });
        ReactDOM.render(<CheckoutForm amount={total} />, document.getElementById('details'));
    }

    addRow(event, id = uuid()) {
        var cartBody = document.getElementById('checkout-table');
        var newRow = document.createElement('tr');
        newRow.id = id;

        var nameRow = document.createElement('td');
        var timeRow = document.createElement('td');
        var priceRow = document.createElement('td');

        nameRow.innerHTML = event.name;
        if (event.name.length > 0) {
            var start = new Date(event.epoch_date*1000);
            var end = new Date(start.getTime());
            end.setMinutes(end.getMinutes() + (60*event.duration));
            timeRow.innerHTML = time(start) + ' - ' + time(end);
        } else {
            timeRow.innerHTML = event.time;
        }
        if (event.name.length === 0) {
            if (event.time.includes('Membership')) {
                priceRow.innerHTML = '-' + this.extractPrice(event.price);
            } else {
                priceRow.innerHTML = this.extractPrice(event.price);
            }
        } else {
            priceRow.innerHTML = this.extractPrice(event.price);
        }

        // Check for membership item
        if (event.eventType === 'membership') {
            if (event.cancelling) {
                priceRow.innerHTML = '0.00';
            } else {
                var price = parseInt(event.price.split('/')[0]);
                if (event.id === 2) {
                    price *= 6;
                } else if (event.id === 3) {
                    price *= 12;
                }
                priceRow.innerHTML = price + '.00';
            }
            timeRow.innerHTML = '';
            nameRow.innerHTML = event.name.includes('Cancel') ? event.name : 'Membership - ' + event.name;
        }

        newRow.appendChild(nameRow);
        newRow.appendChild(timeRow);
        newRow.appendChild(priceRow);

        cartBody.appendChild(newRow);
    }

    updateClassSelection(event) {
        var price = Number.parseFloat(event.target.parentNode.children[1].innerHTML);
        subtotal -= price;
        this.addRow({
            name: '',
            time: 'Membership Discount',
            price: price + '/'
        });
    }

    extractPrice(price) {
        var priceIndex = price.indexOf('/');
        var priceFloat = Number.parseFloat(price.substr(0, priceIndex));
        return priceFloat.toFixed(2);
    }

    componentDidMount() {
        // Check if this is reception
        if (Cookies.get('token')) {
            $.post(server + '/api/getPayload', { token: Cookies.get('token') }, result => {
                if (result.payload.id === 4) {
                    // Stage the cart for a drop-in booking
                    this.setState({ staging: true }, () => {
                        var items = Cookies.getJSON('cart').items;
                        for (var i in items) {
                            this.addRow(items[i]);
                            if (!items[i].name.includes('Cancel')) { subtotal = Number.parseFloat(subtotal) + Number.parseFloat(this.extractPrice(items[i].price)); }
                        }

                        $.post(server + '/api/stageCart', { cart: Cookies.get('cart') }, stageResult => {
                            // Check for form completion every 5 seconds
                            timer = setInterval(() => {
                                $.get(server + '/api/checkStaging', stageCheck => {
                                    if (stageCheck.active) {
                                        // Stop the timer
                                        clearInterval(timer);
                                        timer = null;

                                        // Client has completed data entry
                                        $.post(server + '/api/unstageCart', { token: Cookies.get('token') }, unstageResult => {
                                            if (unstageResult.error) {
                                                setPopupContent('Error', unstageResult.error);
                                                togglePopup(true);
                                            } else {
                                                document.getElementById('waiting-text').innerHTML = 'Waiting for payment...';
                                                document.getElementById('totalText').innerHTML = 'Amount due (with tax): $' + unstageResult.total.toFixed(2);
                                                document.getElementById('paid-btn').style.display = '';
                                                document.getElementById('totalText').style.display = '';
                                            }
                                        });
                                    }
                                });
                            }, 5000);
                        });
                    });
                } else {
                    $.post(server + '/api/checkMemberDiscount', { token: Cookies.get('token'), date: new Date().getTime()/1000 }, result => {
                        if (!result.error) {
                            if (result.applyDiscount) {
                                // Count the number of classes in the cart
                                var classes = [];
                                for (var i in items) {
                                    if (items[i].type === 'class') {
                                        classes.push(items[i]);
                                    }
                                }
                                if (classes.length > 0) {
                                    // Apply the discount to the only class in the cart
                                    this.addRow({
                                        name: '',
                                        time: 'Membership Discount',
                                        price: classes[0].price
                                    }, 'membershipRow');
                                    subtotal -= this.extractPrice(classes[0].price);
                                }
                            }
			    var items = Cookies.getJSON('cart').items;
			    for (var i in items) {
				this.addRow(items[i]);
				if (!items[i].name.includes('Cancel')) { subtotal = Number.parseFloat(subtotal) + Number.parseFloat(this.extractPrice(items[i].price)); }
			    }
                            this.addTotals();
                        } else {
                            if (result.error) {
                                if (result.error !== 'no_membership') {
                                    setPopupContent('Error', result.error);
                                    togglePopup(true);
                                }
                            } else {
                                alert('Something went wrong fetching token payload');
                            }
                        }
                    });
                }
            });
        } else {
            var items = Cookies.getJSON('cart').items;
            for (var i in items) {
                this.addRow(items[i]);
                if (!items[i].name.includes('Cancel')) { subtotal = Number.parseFloat(subtotal) + Number.parseFloat(this.extractPrice(items[i].price)); }
            }
            this.addTotals();
        }
    }
    
    // Render the checkout page normally unless client is logged in as 'reception', in which case
    //      render the drop-in page using what is in the cart for staging.
    render() {
        if (this.state.staging) {
            return (
                <div className="text-center mt-5">
                    <h3>Drop-In Booking</h3>
                    <h6 id="waiting-text">Navigate to https://cosgrovehockeyacademy.com/staging on the tablet to continue...</h6>
                    <table id="checkoutTable" className="table table-striped" style={{width: '60%', margin: '0 auto'}}>
                        <thead className="thead thead-dark">
                            <tr>
                                <th>Item</th>
                                <th>Time</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody id="checkout-table"></tbody>
                    </table>
                    <button id="cancelBtn" className="btn btn-danger mt-2" onClick={() => {
                        // Stop checking for staging updates, then cancel staging, clear cart, and send to account page
                        clearInterval(timer);
                        timer = null;
                        $.get(server + '/api/cancelStaging', result => {
                            if (result.error) {
                                setPopupContent('Error', result.error);
                                togglePopup(true);
                            } else {
                                Cookies.remove('cart');
                                window.location.replace('/account');
                            }
                        });
                    }}>Cancel</button>
                    <h5 id="totalText" style={{display: 'none'}}>Total</h5>
                    <button id="paid-btn" className="btn btn-primary" onClick={this.finishStaging} style={{display: 'none'}}>Amount Was Paid</button>
                </div>
            );
        } else {
            return (
                <div id="fullCheckoutDiv">
                    <h3 className="text-center" style={{fontWeight: 'bold', margin: '1%'}}>Checkout</h3>
                    <table id="checkoutTable" className="table table-striped" style={{width: '60%', margin: '0 auto'}}>
                        <thead className="thead thead-dark">
                            <tr>
                                <th>Item</th>
                                <th>Time</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody id="checkout-table"></tbody>
                    </table>
                    <div id="details" />
                </div>
            );
        }
    }
}
