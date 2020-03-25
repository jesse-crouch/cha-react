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
            </div>
        )
    }
}
