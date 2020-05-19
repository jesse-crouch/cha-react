import React, { Component } from 'react'
import { uuid } from 'uuidv4';
import ScheduleEvent from './ScheduleEvent';

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default class Day extends Component {
    constructor(props) {
        super();

        this.state = {
            events: props.events.map(event => {
                return <ScheduleEvent key={uuid()} event={event} />
            })
        };

        this.scroll = this.scroll.bind(this);
    }

    scroll() {
        var day = document.getElementById("day-" + this.props.date);
        var direction = parseInt(day.getAttribute('direction'));
        if (day.scrollTop === (day.scrollHeight - day.clientHeight)) {
            day.setAttribute('direction', -1);
        } else if (day.scrollTop === 0) {
            day.setAttribute('direction', 1);
        }
        day.scrollBy(0,1*direction);
    }

    render() {
        var date = new Date(this.props.date);
        if (this.props.events.length > 8) {
            setInterval(this.scroll, 100);
        }

        return (
            <div id={"day-" + this.props.date} direction="1" className="schedule-day">
                <p>{days[date.getDay()] + ' - ' + date.getDate()}</p>
                {this.state.events}
            </div>
        )
    }
}
