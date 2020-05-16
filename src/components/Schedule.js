import React, { Component } from 'react'
import server from '../fetchServer';
import $ from 'jquery';
import Day from './Day';

export default class Schedule extends Component {
    constructor() {
        super();

        this.state = { days: [] };
    }

    componentDidMount() {
        var date = new Date();
        date.setHours(1);
        $.get(server + '/api/getScheduleEvents', result => {
            var days = [], formattedDays = [];
            for (var i=0; i<7; i++) days.push([]);
            for (var j in result.events) {
                var eventDate = new Date(result.events[j].epoch_date);
                days[eventDate.getDay()].push(result.events[j]);
            }

            for (var k in days) {
                formattedDays.push(<Day events={days[k]} date={date} />);
                date.setDate(date.getDate() + 1);
            }

            this.setState({ days: formattedDays });
        });
    }

    render() {
        return (
            <div>
                <div className="week">
                    {this.state.days}
                </div>
            </div>
        )
    }
}
