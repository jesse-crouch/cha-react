import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Cookies from 'js-cookie';
import time from '../stringDate';
import CheckoutForm from './CheckoutForm';
import $ from 'jquery';
import server from '../fetchServer';
import { /*setHTMLContent,*/ togglePopup, setPopupContent } from './popupMethods';
//import { uuid } from 'uuidv4';

var subtotal = 0;
var total = 0;

export default class Checkout extends Component {

    addTotals() {
        // Add subtotal, tax, and total rows
        var tax = subtotal*0.13;
        total = Number.parseFloat(subtotal) + Number.parseFloat(tax);
        this.addRow({
            event_name: '',
            time: 'Subtotal',
            price: subtotal + '/'
        });
        this.addRow({
            event_name: '',
            time: 'Tax (HST)',
            price: tax + '/'
        });
        this.addRow({
            event_name: '',
            time: 'Total',
            price: total + '/'
        });
        ReactDOM.render(<CheckoutForm amount={total} />, document.getElementById('details'));
    }

    addRow(event) {
        var cartBody = document.getElementById('checkout-table');
        var newRow = document.createElement('tr');

        var nameRow = document.createElement('td');
        var timeRow = document.createElement('td');
        var priceRow = document.createElement('td');

        nameRow.innerHTML = event.event_name;
        if (event.event_name.length > 0) {
            var start = new Date(event.epoch_date*1000);
            var end = new Date(start.getTime());
            end.setMinutes(end.getMinutes() + (60*event.duration));
            timeRow.innerHTML = time(start) + ' - ' + time(end);
        } else {
            timeRow.innerHTML = event.time;
        }
        if (event.event_name.length === 0) {
            if (event.time.includes('Membership')) {
                priceRow.innerHTML = '-' + this.extractPrice(event.price);
            } else {
                priceRow.innerHTML = this.extractPrice(event.price);
            }
        } else {
            priceRow.innerHTML = this.extractPrice(event.price);
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
            event_name: '',
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
        var items = Cookies.getJSON('cart').items;
        for (var i in items) {
            this.addRow(items[i]);
            subtotal = Number.parseFloat(subtotal) + Number.parseFloat(this.extractPrice(items[i].price));
        }

        // Check if logged in, and check for membership
        var token = Cookies.get('token');
        if (token) {
            $.post(server + '/api/checkMemberDiscount', { token: token, date: new Date().getTime()/1000 }, result => {
                if (!result.error) {
                    if (result.applyDiscount) {
                        // Count the number of classes in the cart
                        var classes = [];
                        for (var i in items) {
                            if (items[i].type === 'class') {
                                classes.push(items[i]);
                            }
                        }
                        if (classes.length > 1) {
                            // Apply the discount to the only class in the cart
                            this.addRow({
                                event_name: '',
                                time: 'Membership Discount',
                                price: classes[0].price
                            });
                            subtotal -= this.extractPrice(classes[0].price);
                        }
                        /*if (classes.length > 1) {
                            // Show popup letting user choose the cart item to apply the discount to
                            var rows = [];
                            for (var j in classes) {
                                var start = new Date(classes[j].epoch_date*1000);
                                var end = new Date(start.getTime());
                                end.setMinutes(end.getMinutes() + (60*classes[j].duration));

                                var newRow = <tr>
                                    <td>
                                        <input id={uuid()} type="radio" onClick={(e) => this.updateClassSelection(e)} />
                                        <div style={{display: 'none'}}>{this.extractPrice(classes[j].price)}</div>
                                    </td>
                                    <td>{classes[j].event_name}</td>
                                    <td>{time(start) + ' - ' + time(end)}</td>
                                    <td>{this.extractPrice(classes[j].price)}</td>
                                </tr>;
                                rows.push(newRow);
                            }

                            var content = <div>
                                <p>Your membership allows you one free class per day.</p>
                                <br />
                                <p>Please choose which class to apply your discount to.</p>
                                <table id="selectTable" className="table table-striped">
                                    <thead className="thead thead-dark">
                                        <tr>
                                            <th>Select</th>
                                            <th>Item</th>
                                            <th>Time</th>
                                            <th>Price</th>
                                        </tr>
                                    </thead>
                                    <tbody id="select-table">
                                        {rows}
                                    </tbody>
                                </table>
                            </div>;
                            setHTMLContent('Membership Discount', content);
                            togglePopup(true);
                        } else {
                            
                        }*/
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
        } else {
            this.addTotals();
        }
    }
    
    render() {
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
        )
    }
}
