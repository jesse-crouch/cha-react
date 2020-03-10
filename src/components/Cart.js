import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import $ from 'jquery';
import { FaShoppingCart } from 'react-icons/fa';

export default class Cart extends Component {
    render() {
        return (
            <div id="cart-container" style={{overflow: 'hidden'}}>
                <div className="cart" id="cart">
                    <h5>Cart</h5>
                    <table className="table table-striped">
                        <thead className="thead thead-dark">
                            <tr>
                                <th>Item</th>
                                <th>Time</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody id="cart-table">
                            <tr>
                                <td>Item</td>
                                <td>Time</td>
                                <td>Price</td>
                            </tr>
                        </tbody>
                    </table>
                    <div>
                        <button className="btn btn-primary" style={{width: '25%', marginRight: '50%'}}>Checkout</button>
                    </div>
                </div>
            </div>
        )
    }
}
