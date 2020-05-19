import React, { Component } from 'react'
import server from '../fetchServer';
import $ from 'jquery';
import ScheduleDay from './ScheduleDay';
import { uuid } from 'uuidv4';

export default class Schedule extends Component {
    constructor() {
        super();

        this.state = { days: [] };
    }

    componentDidMount() {
        document.getElementById('main').style.background = 'url(./images/reception_show.png)';
        document.getElementById('schedule-week').style.height = (document.documentElement.clientHeight - document.getElementById('navbar').clientHeight) + 'px';

        var date = new Date();
        if (date.getDay() === 6) {
            date.setDate(date.getDate() + 1);
        } else {
            date.setDate(date.getDate() - date.getDay());
        }
        date.setHours(1);
        $.post(server + '/api/getScheduleEvents', { date: date.getTime() }, result => {
            var days = [[],[],[],[],[],[],[]], formattedDays = [];
            for (var j in result.events) {
                var eventDate = new Date(result.events[j].epoch_date);
                days[eventDate.getDay()].push(result.events[j]);
            }

            for (var k in days) {
                formattedDays.push(<ScheduleDay key={uuid()} events={days[k]} date={date.getTime()} />);
                date.setDate(date.getDate() + 1);
            }

            this.setState({ days: formattedDays });
        });
    }

    render() {
        return (
            <div>
                <div id="schedule-week" className="schedule-week">
                    {this.state.days}
                </div>
            </div>
        )
    }
}
