import React, { Component } from 'react'
import server from '../fetchServer';
import $ from 'jquery';
import Day from './Day';
import { uuid } from 'uuidv4';
import { togglePopup, setEventContent } from './popupMethods';
import monthNames from '../months';

export default class Calendar extends Component {
    constructor(props) {
        super();
        this.state = {
            currentDate: new Date(),
            service: props.id,
            days: []
        };

        this.updateWeek = this.updateWeek.bind(this);
        this.changeWeek = this.changeWeek.bind(this);
    }

    componentDidMount() {
        this.updateWeek();
    }

    updateWeek() {
        $.post(server + '/api/getCalendarInfo', {
            id: this.props.id,
            date: this.state.currentDate.getTime()
        }, (result) => {
            var days = [];
            var date = new Date(result.startDate);
            var currentDate = new Date();
            var eventNum = 0;

            for (var i=0; i<7; i++) {
                var events = [];
                for (var j in result.events) {
                    const eventDate = new Date(result.events[j].epoch_date*1000);
                    if (eventDate.getDay() === i && i >= currentDate.getDay()) {
                        events.push(result.events[j]);
                    }
                }

                if (result.service_info.type === 'open') {
                    // Adding ghost events for open services
                    // Business hours - Weekdays (4 PM - 9 PM), Weekends (8 AM - 9 PM)
                    const open_time = (i === 0 || i === 6) ? 16 : 8;
                    const close_time = 21;

                    var trackDate = new Date(date.getTime());
                    trackDate.setUTCHours(open_time,0,0,0);
                    for (var k=0; k<((close_time - open_time) / result.service_info.default_duration); k++) {
                        var event = {
                            id: 'i-' + eventNum,
                            event_name: result.service_info.primary_name + ' - ' + result.service_info.name,
                            duration: result.service_info.default_duration,
                            price: result.service_info.price,
                            epoch_date: trackDate.getTime() / 1000,
                            open_spots: result.service_info.default_spots,
                            total_spots: result.service_info.default_spots,
                            instructor: result.service_info.default_instructor,
                            instructor_name: result.service_info.instructor_name
                        };
                        trackDate.setMinutes(trackDate.getMinutes() + (60*event.duration));
                        events.push(event);
                        eventNum++;
                    }
                }

                days.push(<Day key={uuid()} events={events} date={date.getTime()} eventHandler={this.handleEventClick} />);
                date.setDate(date.getDate() + 1);
            }
            date.setDate(date.getDate()-7);
            this.setState(prevState => {
                return {
                    currentDate: date,
                    service: prevState.service,
                    days: days
                };
            });
        });
        setTimeout(() => {
            document.getElementById('week').style.opacity = 1;
        }, 200);
    }

    changeWeek(next) {
        var newDate = new Date(this.state.currentDate.getTime());
        var dayChange = next ? 7 : -7;
        newDate.setDate(newDate.getDate() + dayChange);
        document.getElementById('week').style.opacity = 0;
        this.setState({
            currentDate: newDate
        }, () => {
            this.updateWeek();
        });
    }

    handleEventClick(event) {
        setEventContent(event);
        togglePopup(true);
    }

    render() {
        return (
            <div id="calendar">
                <div className="calendar-control">
                    <button id="prevBtn" className="btn btn-light" onClick={() => this.changeWeek(false)}>Previous</button>
                    <h1>{monthNames[this.state.currentDate.getMonth()]}</h1>
                    <button id="nextBtn" className="btn btn-light" onClick={() => this.changeWeek(true)}>Next</button>
                </div>
                <div id="week" className="week">
                    {this.state.days}
                </div>
            </div>
        )
    }
}
