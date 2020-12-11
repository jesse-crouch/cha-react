import React, { Component } from 'react'
import { uuid } from 'uuidv4';
import Event from './Event';

export default class Day extends Component {
    constructor(props) {
        super();

        this.state = {
            events: props.events.map(event => {
                return <Event key={uuid()} event={event} eventHandler={props.eventHandler} managed={props.managed} />
            }),
            blocked_times: props.blocked_times.map(blocked => {
                return <Event key={uuid()} event={blocked} />
            }),
            blocked_days: props.blocked_days.map(blocked => {
                return <Event key={uuid()} event={blocked} />
            }),
            date: new Date(props.date)
        };
    }

    render() {
        var currentDate = new Date();
        var background = (currentDate.getMonth() === this.state.date.getMonth() && currentDate.getDate() === this.state.date.getDate()) ? 'rgb(153, 204, 153)' : '#cccccc';
        if (this.state.date.getDay() === 0 || this.state.date.getDay() === 6) {
            background = 'rgb(191,191,191)';
        }

        return (
            <div className="day" style={{background: background}}>
                <p>{this.state.date.getDate()}</p>
                {this.state.events}
                {this.state.blocked_times}
                {this.state.blocked_days}
            </div>
        )
    }
}
