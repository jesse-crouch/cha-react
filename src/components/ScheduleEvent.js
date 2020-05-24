import React from 'react'
import {time} from'../stringDate';

export default function Event(props) {
    const start = new Date(props.event.epoch_date);
    const end = new Date(start.getTime());
    var duration = props.event.duration === null ? props.event.serviceduration : props.event.duration;
    end.setUTCMinutes(end.getUTCMinutes() + (duration*60));
    const height = (5.5*duration) + 'em';

    var className = 'event btn btn-';
    className += 'primary my-1';

    return (
        <button id={props.event.id + 'b'} className={className} style={{height: height, background: props.event.colour}}>
            {props.event.name}
            <br />
            {time(start) + ' - ' + time(end)}
        </button>
    )
}
