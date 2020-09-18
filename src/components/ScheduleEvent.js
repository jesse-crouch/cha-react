import React from 'react'
import {time} from'../stringDate';
import { addToCart } from './cartMethods.js';
import { togglePopup, setPopupContent } from './popupMethods.js';

export default function Event(props) {
    const start = new Date(props.event.epoch_date);
    const end = new Date(start.getTime());
    var duration = props.event.duration === null ? props.event.serviceduration : props.event.duration;
    end.setUTCMinutes(end.getUTCMinutes() + (duration*60));
    const height = (7*duration) + 'em';

    var className = 'event btn btn-';
    className += 'primary my-1';

    return (
        <button id={props.event.id + 'b'} className={className} style={{height: height, background: props.event.colour}} onClick={() => {
		//console.log(props.event);
		if (props.event.open_spots > 0) {
			props.event.epoch_date = props.event.epoch_date/1000;
			addToCart(props.event, true);
		} else {
			setPopupContent('Error', 'This class is full, please choose another.');
			togglePopup(true);
		}
	}}>
            {props.event.name}
            <br />
            {time(start) + ' - ' + time(end)}
        </button>
    )
}
