import React from 'react'
import {time} from'../stringDate';
import Cookies from 'js-cookie';

export default function Event(props) {
    const start = new Date(props.event.epoch_date*1000);
    const end = new Date(start.getTime());
    end.setUTCMinutes(end.getUTCMinutes() + (props.event.duration*60));
    const height = (4.2*props.event.duration) + 'em';

    // Check if this event is in the past
    var display = '';
    if (start.getTime() < (new Date().getTime() - (1000*60*60*4))) {
        display = 'none';
    }

    // Set colour based on number of open event spots
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
        disabled = true;
    }
    className += ' my-1';

    // Check if this event is currently in the cart
    var cart = Cookies.getJSON('cart');
    if (cart) {
        for (var i in cart.items) {
            if (cart.items[i].id === props.event.id) {
                className = 'event btn btn-success my-1';
                disabled = true;
            }
        }
    }

    if (props.event.name === 'Class Scheduled') {
        className = 'event btn btn-dark my-1';
        disabled = true
    }
    if (props.managed) {
        className = 'event btn btn-dark my-1';
    }

    return (
        <button id={props.event.id + 'b'} className={className} style={{height: height, display: display, background: props.managed ? props.event.colour : ''}} disabled={disabled} onClick={() => props.eventHandler(props.event)}>
            {time(start) + ' - ' + time(end)}
        </button>
    )
}
