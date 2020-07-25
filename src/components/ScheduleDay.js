import React, { Component } from 'react'
import { uuid } from 'uuidv4';
import ScheduleEvent from './ScheduleEvent';

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default class Day extends Component {
    constructor(props) {
        super();

        this.state = {
            events: props.events.map(event => {
                return <ScheduleEvent key={uuid()} event={event} eventHandler={props.eventHandler ? props.eventHandler : null} />
            })
        };

        this.scroll = this.scroll.bind(this);
    }

    componentDidMount() {
        // Calculate the max events that the client can show before scrolling
        /*var clientHeight = document.documentElement.clientHeight - document.getElementById('navbar').clientHeight;
        var dayHeight = document.getElementById('day-' + this.props.date).scrollHeight;
        console.log(clientHeight + ',' + dayHeight);
        if (dayHeight > clientHeight) {
            //setInterval(this.scroll, 100);
        }*/
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

        return (
            <div id={"day-" + this.props.date} direction="1" className="schedule-day">
                <p>{days[date.getDay()] + ' - ' + date.getDate()}</p>
                {this.state.events}
            </div>
        )
    }
}
