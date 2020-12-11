import React from 'react'
import {time} from'../stringDate';
import Cookies from 'js-cookie';

export default function Event(props) {
    const start = new Date(props.event.epoch_date*1000);
    const end = new Date(start.getTime());
    var duration = props.event.duration === null ? props.event.serviceduration : props.event.duration;
    end.setUTCMinutes(end.getUTCMinutes() + (duration*60));
    const height = (5*(duration === 100 ? 9 : duration)) + 'em';

    // Check if this event is in the past if unmanaged
    var display = '';
    if (!props.managed) {
        if (start.getTime() < (new Date().getTime() - (1000*60*60*4))) {
            display = 'none';
        }
    }

    // Set colour based on number of open event spots
    var background = '';
    var ratio = props.event.open_spots / props.event.total_spots;
    var className = 'event btn btn-';
    var disabled = false;
    if (ratio >= 0.8) {
        className += 'primary';
    } else if (ratio >= 0.5 && ratio < 0.8) {
        className += 'warning';
    } else if (ratio >= 0.2 && ratio < 0.5) {
        className += 'danger';
    } else {
        className += 'dark';
        background = 'black';
        disabled = true;
    }
    className += ' my-1';

    // Check if this event is currently in the cart
    var cart = Cookies.getJSON('cart');
    if (cart) {
        for (var i in cart.items) {
            if (cart.items[i].epoch_date === props.event.epoch_date) {
                className = 'event btn btn-success my-1';
                disabled = true;
            }
        }
    }

    if (props.managed) {
        background = props.event.colour;
        disabled = false;
        className = 'event btn btn-dark my-1';
    }
    if (props.event.name === 'Class') {
        className = 'event btn btn-dark my-1';
        disabled = true;
    }
    if (props.event.name === 'Unavailable') {
        className = 'event btn btn-dark my-1';
        disabled = true;
    }

    var buttonText = time(start) + ' - ' + time(end);
    if (props.event.open_spots === 0) buttonText = 'Booked';
    if (props.event.name === 'Class') buttonText = 'Class Booked';
    if (props.event.name === 'Unavailable') buttonText = 'Unavailable';
    if (duration === 100) buttonText = 'Whole Day';

    return (
        <button id={props.event.id + 'b'} className={className} style={{height: height, display: display, background: background}} disabled={disabled} onClick={() => props.eventHandler(props.event)}>
            {buttonText}
        </button>
    )
}
