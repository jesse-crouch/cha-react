import Cookies from 'js-cookie';
import {time, shortDate} from "../stringDate";
import { togglePopup, setPopupContent } from './popupMethods';
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import { FaArrowRight, FaShoppingCart } from 'react-icons/fa';
import server from '../fetchServer';

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

export function addSpecialToCart(service) {
    var eventID = null;
    if (service === 39) eventID = 176;
    if (service === 40) eventID = 177;
    if (service === 41) eventID = 178;
    if (service === 42) eventID = 179;

    if (eventID) {
        $.post(server + '/api/getEvent', { id: eventID }, result => {
            if (!result.error) addToCart(result.event, true);
        });
    }
}

export function addNonEventToCart(event, userAdded) {
    // Check that the cart doesn't already contain a membership product
    var cart = Cookies.getJSON('cart');
    var notAdded = true;
    if (userAdded) {
        if (cart) {
            for (var i in cart.items) {
                if (cart.items[i].eventType === 'membership') {
                    togglePopup(false);
                    setPopupContent('Error', 'You already have a membership change added to the cart. Please remove it first if you wish to add a different one.');
                    togglePopup(true);
                    notAdded = false;
                } else {
                    notAdded = true;
                }
            }
        }
    }

    if (notAdded) {
        var cartBody = document.getElementById('cart-table');
        var newRow = document.createElement('tr');
        newRow.id = event.id + 'r';
        event.type = 'nonevent';
        event.eventType = 'membership';

        var nameRow = document.createElement('td');
        var timeRow = document.createElement('td');
        var priceRow = document.createElement('td');
        var removeRow = document.createElement('td');

        
        timeRow.innerHTML = '';
        if (event.cancel) {
            nameRow.innerHTML = 'Cancel Membership';
            priceRow.innerHTML = '0.00';
            event.cancelling = true;
        } else {
            nameRow.innerHTML = 'Membership - ' + event.name;
            var price = parseInt(event.price.split('/')[0]);
            if (event.name === 'Yearly') {
                price *= 12;
            } else if (event.name === '6 Monthly') {
                price *= 6;
            }
            priceRow.innerHTML = price + '.00';
        }

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
            if (cart.items.length === 1) {
                Cookies.remove('cart');
                toggleCart();
            } else {
                for (var i in cart.items) {
                    if (cart.items[i].id === event.id) {
                        cart.items.splice(i,1);
                        Cookies.set('cart', { items: cart.items }, { expires: 0.5 });
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

        if (userAdded) {
            if (cart) {
                // Cart exists, append new item
                cart.items.push(event);
                Cookies.set('cart', { items: cart.items }, { expires: 0.5 });

                console.log(Cookies.getJSON('cart'));
            } else {
                var items = [];
                items.push(event);
                Cookies.set('cart', { items: items }, { expires: 0.5 });

                console.log(Cookies.getJSON('cart'));
            }
            // Close the popup and open the cart
            togglePopup(false);
            toggleCart();
        }
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

    nameRow.innerHTML = event.name;

    // Handle event times
    var eventStart = new Date(event.epoch_date*1000);
    var eventEnd = new Date(eventStart.getTime());
    if (event.duration > 100 && event.duration < 200) {
        // Event spans multiple days
        eventEnd.setDate(eventEnd.getDate() + 70);
        timeRow.innerHTML = shortDate(eventStart) + ' - ' + shortDate(eventEnd);
    } else if (event.duration > 200) {
        // Event spans multiple weeks
        eventEnd.setDate(eventEnd.getDate() + ((event.duration - 201)*7));
        timeRow.innerHTML = shortDate(eventStart) + ' - ' + shortDate(eventEnd);
    } else {
        // Event spans multiple minutes or hours
        eventEnd.setMinutes(eventEnd.getMinutes() + (event.duration*60));
        timeRow.innerHTML = time(eventStart) + ' - ' + time(eventEnd);
    }
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
            eventBtn.style.background = event.colour;
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
                    Cookies.set('cart', { items: cart.items }, { expires: 0.5 });
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
            Cookies.set('cart', { items: cart.items }, { expires: 0.5 });

            console.log(Cookies.getJSON('cart'));
        } else {
            var items = [];
            items.push(event);
            Cookies.set('cart', { items: items }, { expires: 0.5 });

            console.log(Cookies.getJSON('cart'));
        }

        // Close the popup and open the cart
        togglePopup(false);
        toggleCart();
    }
}
