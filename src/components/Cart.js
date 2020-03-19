import React, { Component } from 'react'
import { addToCart } from './cartMethods';
import Cookies from 'js-cookie';

export default class Cart extends Component {
    componentDidMount() {
        // Check for cookies
        var cart = Cookies.getJSON('cart');
        if (cart) {
            for (var i in cart.items) {
                var row = document.getElementById(cart.items[i].id + 'r');
                if (!row) { addToCart(cart.items[i], false); }
            }
        }
    }

    render() {
        return (
            <div id="cart-container" style={{overflow: 'hidden'}}>
                <div className="cart" id="cart">
                    <h4>Cart</h4>
                    <h5 id="emptyMsg">Your cart is empty, visit the services page to add a booking.</h5>
                    <table id="cartTable" className="table table-striped">
                        <thead className="thead thead-dark">
                            <tr>
                                <th>Item</th>
                                <th>Time</th>
                                <th>Price</th>
                                <th>Remove</th>
                            </tr>
                        </thead>
                        <tbody id="cart-table"></tbody>
                    </table>
                    <div id="buttonDiv">
                        <button className="btn btn-primary" style={{width: '25%'}} onClick={() => { window.location.replace('/checkout'); }}>Checkout</button>
                    </div>
                </div>
            </div>
        )
    }
}
