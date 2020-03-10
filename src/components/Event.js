import React from 'react'
import time from '../stringDate';

export default function Event(props) {
    const start = new Date(props.event.epoch_date*1000);
    const end = new Date(start.getTime());
    end.setHours(end.getHours(), end.getMinutes() + (props.event.duration*60));
    const height = (3*props.event.duration) + 'em';

    return (
        <button className="event btn btn-primary my-1" style={{height: height}} onClick={() => props.eventHandler(props.event)}>
            {time(start) + ' - ' + time(end)}
        </button>
    )
}
