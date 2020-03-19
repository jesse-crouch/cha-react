import React from 'react'
import time from '../stringDate';
import Cookies from 'js-cookie';

export default function Event(props) {
    const start = new Date(props.event.epoch_date*1000);
    const end = new Date(start.getTime());
    end.setHours(end.getHours(), end.getMinutes() + (props.event.duration*60));
    const height = (4.2*props.event.duration) + 'em';

    // Check if this event is in the past
    var display = '';
    if (start.getTime() < new Date().getTime()) {
        display = 'none';
    }

    // Check if this event is currently in the cart
    var cart = Cookies.getJSON('cart');
    var background = '#007bff';
    var disabled = false;
    if (cart) {
        for (var i in cart.items) {
            if (cart.items[i].id === props.event.id) {
                background = '#28a745';
                disabled = true;
            }
        }
    }

    return (
        <button id={props.event.id + 'b'} className="event btn btn-primary my-1" style={{height: height, background: background, display: display}} disabled={disabled} onClick={() => props.eventHandler(props.event)}>
            {time(start) + ' - ' + time(end)}
        </button>
    )
}
