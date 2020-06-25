import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Cookies from 'js-cookie';
import {time} from '../stringDate';
import CheckoutForm from './CheckoutForm';
import $ from 'jquery';
import server from '../fetchServer';
import { /*setHTMLContent,*/ togglePopup, setPopupContent } from './popupMethods';
import { uuid } from 'uuidv4';
import { isDOMComponent } from 'react-dom/test-utils';
//import { uuid } from 'uuidv4';

var subtotal = 0;
var total = 0;
var timer = null;
var payload = null;

var selected = [];

export default class Checkout extends Component {
    constructor() {
        super();

        if (!Cookies.get('cart')) {
            window.location.replace('/services');
        }

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
        var details = document.getElementById('details');
        if (details.childElementCount > 0) {
            while(details.firstChild) details.removeChild(details.firstChild);
        }

        var tax = subtotal*0.13;
        total = Number.parseFloat(subtotal) + Number.parseFloat(tax);
        this.addRow({
            name: '',
            time: 'Subtotal',
            price: subtotal + '/'
        }, 'subtotal-row');
        this.addRow({
            name: '',
            time: 'Tax (HST)',
            price: tax + '/'
        }, 'tax-row');
        this.addRow({
            name: '',
            time: 'Total',
            price: total + '/'
        }, 'total-row');
        ReactDOM.render(<CheckoutForm amount={total} />, details);
    }

    formatName(first, last) {
        var first_name =  first.substr(0,1).toUpperCase() + first.substr(1);
        var last_name =  last.substr(0,1).toUpperCase() + last.substr(1);
        return first_name + ' ' + last_name;
    }

    includes(option) {
        for (var i in selected) {
            if (selected[i][1] === option) {
                return true;
            }
        }
        return false;
    }

    addRow(event, id = uuid()) {
        var cartBody = document.getElementById('checkout-table');
        var newRow = document.createElement('tr');
        newRow.id = id;

        var nameRow = document.createElement('td');
        var timeRow = document.createElement('td');
        var priceRow = document.createElement('td');
        var personRow = document.createElement('td');
        if (payload) {
            var personSelect = document.createElement('select');
            var personSelectOption = document.createElement('option');

            personSelect.id = 's-' + id;
            personSelectOption.innerHTML = 'Select a person';
            personSelect.appendChild(personSelectOption);
            var userOption = document.createElement('option');
            var userName = this.formatName(payload.first_name, payload.last_name);
            userOption.innerHTML = userName;
            personSelect.appendChild(personSelectOption);
            personSelect.appendChild(userOption);
            personSelect.addEventListener('change', () => {
                 if (personSelect.selectedIndex > 0) {
                    var option = personSelect.options[personSelect.selectedIndex].value;

                    // Check for discount only if this option hasn't been selected
                    if (!this.includes(option)) {
                            $.post(server + '/api/checkDiscount', { token: Cookies.get('token'), eventDate: event.epoch_date, index: personSelect.selectedIndex }, result => {
                                if (result.error) {
                                    setPopupContent('Error', result.error);
                                    togglePopup(true);
                                } else {
                                    if (result.discount !== null) {
                                        if (result.discount) {
                                            if (priceRow.innerHTML !== '0.00') {
                                                priceRow.innerHTML = '0.00';
                                                subtotal -= this.extractPrice(event.price);
                                                var tax = subtotal*0.13;
                                                total = parseFloat(subtotal) + parseFloat(tax);
                                                document.getElementById('subtotal-row').children[3].innerHTML = subtotal.toFixed(2);
                                                document.getElementById('tax-row').children[3].innerHTML = tax.toFixed(2);
                                                document.getElementById('total-row').children[3].innerHTML = total.toFixed(2);
                                            }
                                        }
                                    }
                                }
                            });
                    }
                    selected.push(['s-' + id, option]);
                 } else {
                    // Remove any entries from selected
                    // eslint-disable-next-line
                    for (var i in selected) {
                        if (selected[i][0] === 's-' + id) {
                            selected.splice(i);
                        }
                    }

                    if (priceRow.innerHTML === '0.00') {
                        var price = parseFloat(this.extractPrice(event.price));
                        priceRow.innerHTML = price.toFixed(2);
                        subtotal += price;
                        var tax = subtotal*0.13;
                        total = parseFloat(subtotal) + parseFloat(tax);
                        document.getElementById('subtotal-row').children[3].innerHTML = subtotal.toFixed(2);
                        document.getElementById('tax-row').children[3].innerHTML = tax.toFixed(2);
                        document.getElementById('total-row').children[3].innerHTML = total.toFixed(2);
                    }
                 }
            });

            for (var i in payload.children) {
                var childOption = document.createElement('option');
                var childInfo = payload.children[i].split(' ');
                var childName = this.formatName(childInfo[0], childInfo[1]);
                if (childName !== userName) {
                    childOption.innerHTML = childName;
                    childOption.setAttribute('event-id', event.id);
                    personSelect.appendChild(childOption);   
                }
            }

            personRow.appendChild(personSelect);
        } else {
            var container = document.createElement('div');
            container.className = 'form-row';

            var firstName = document.createElement('input');
            var lastName = document.createElement('input');

            firstName.placeholder = 'First Name';
            lastName.placeholder = 'Last Name';

            container.appendChild(firstName);
            container.appendChild(lastName);

            personRow.appendChild(container);
        }

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
        if (payload && event.name.length > 0) {
            newRow.appendChild(personRow);
        } else {
            newRow.appendChild(document.createElement('td'));
        }
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
                payload = result.payload;
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
                    var items = Cookies.getJSON('cart').items;
                    for (var i in items) {
                        this.addRow(items[i]);
                        if (!items[i].name.includes('Cancel')) {
                            subtotal = parseFloat(subtotal) + parseFloat(this.extractPrice(items[i].price));
                        }
                    }
                    this.addTotals();
                    /*
                    $.post(server + '/api/checkMemberDiscount', { token: Cookies.get('token'), date: new Date().getTime()/1000 }, result => {
                        if (!result.error) {
                            var items = Cookies.getJSON('cart').items;
                            

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
                            // eslint-disable-next-line
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
                    });*/
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
                                <th>Booking For</th>
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
