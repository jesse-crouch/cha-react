import React, { Component } from 'react'
import { uuid } from 'uuidv4';
import Event from './Event';

export default class Day extends Component {
    constructor(props) {
        super();

        this.state = {
            events: props.events.map(event => {
                return <Event key={uuid()} event={event} eventHandler={props.eventHandler} />
            }),
            date: new Date(props.date)
        };
    }

    render() {
        return (
            <div className="day">
                <p>{this.state.date.getDate()}</p>
                {this.state.events}
            </div>
        )
    }
}
