import Cookies from 'js-cookie';
import time from "../stringDate";
import { togglePopup } from './popupMethods';
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import { FaArrowRight, FaShoppingCart } from 'react-icons/fa';

export function toggleEmpty(isEmpty) {
    document.getElementById('emptyMsg').style.display = isEmpty ? '' : 'none';
    document.getElementById('cartTable').style.display = isEmpty ? 'none' : '';
    document.getElementById('buttonDiv').style.display = isEmpty ? 'none' : '';
}

export function toggleCart() {
    var open = (document.getElementById('cart-container').style.visibility !== 'visible');
    if (open) {
        toggleEmpty(!Cookies.getJSON('cart'));
    }    
    var cartBtn = document.getElementById('cartBtn');

    // Change the icon in the cart button
    var newIcon = open ? <FaArrowRight /> : <FaShoppingCart />;
    ReactDOM.unmountComponentAtNode(cartBtn);
    ReactDOM.render(newIcon, cartBtn);

    // Animate the cart sliding into view or out of view from right to left or from left to right
    var cart = document.getElementById('cart');
    var cartCont = document.getElementById('cart-container');
    if (open) {
        cartCont.style.visibility = 'visible';
    }
    var docWidth = document.getElementById('main').clientWidth;
    var leftValue = open ? (docWidth - cart.clientWidth) + 'px' : '100%';
    $('#cart').animate({left: leftValue}, 0);
    if (!open) {
        cartCont.style.visibility = 'hidden';
    }
}

export function addToCart(event, refresh) {
    var cartBody = document.getElementById('cart-table');
    var newRow = document.createElement('tr');
    newRow.id = event.id + 'r';

    var nameRow = document.createElement('td');
    var timeRow = document.createElement('td');
    var priceRow = document.createElement('td');
    var removeRow = document.createElement('td');

    nameRow.innerHTML = event.event_name;
    var start = new Date(event.epoch_date*1000);
    var end = new Date(start.getTime());
    end.setMinutes(end.getMinutes() + (60*event.duration));
    timeRow.innerHTML = time(start) + ' - ' + time(end);
    var priceIndex = event.price.indexOf('/');
    var price = Number.parseFloat(event.price.substr(0, priceIndex));
    priceRow.innerHTML = price.toFixed(2);

    var removeBtn = document.createElement('button');
    removeBtn.className = 'btn btn-outline-danger';
    removeBtn.innerHTML = 'x';
    removeBtn.onclick = () => {
        // Remove the row from the cart table, change the event button back, and remove from cart cookie
        cartBody.removeChild(newRow);
        var eventBtn = document.getElementById(event.id + 'b');
        if (eventBtn) {
            eventBtn.style.background = '#007bff';
            eventBtn.disabled = false;
        }
        var cart = Cookies.getJSON('cart');
        console.log(cart.items.length);
        if (cart.items.length === 1) {
            Cookies.remove('cart');
            toggleCart();
        } else {
            for (var i in cart.items) {
                if (cart.items[i].id === event.id) {
                    cart.items.splice(i,1);
                    Cookies.set('cart', { items: cart.items });
                }
            }
        }
    }
    removeRow.appendChild(removeBtn);

    newRow.appendChild(nameRow);
    newRow.appendChild(timeRow);
    newRow.appendChild(priceRow);
    newRow.appendChild(removeRow);

    cartBody.appendChild(newRow);

    // Update the cart cookie if not refreshing
    if (refresh) {
        var cart = Cookies.getJSON('cart');
        if (cart) {
            // Cart exists, append new item
            cart.items.push(event);
            Cookies.set('cart', { items: cart.items });

            console.log(Cookies.getJSON('cart'));
        } else {
            var items = [];
            items.push(event);
            Cookies.set('cart', { items: items });

            console.log(Cookies.getJSON('cart'));
        }

        // Close the popup and open the cart
        togglePopup(false);
        toggleCart();
    }
}