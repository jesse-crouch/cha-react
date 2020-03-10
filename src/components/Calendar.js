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
        const urlParams = new URLSearchParams(new URL(window.location.href).search);
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
            console.log(result);
            var days = [];
            var date = new Date(result.startDate);
            for (var i=0; i<7; i++) {
                var events = [];
                for (var j in result.events) {
                    const eventDate = new Date(result.events[j].epoch_date*1000);
                    if (eventDate.getDay() === i) {
                        events.push(result.events[j]);
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
    }

    changeWeek(next) {
        console.log('changing');
        var newDate = new Date(this.state.currentDate.getTime());
        var dayChange = next ? 7 : -7;
        newDate.setDate(newDate.getDate() + dayChange);
        console.log(this.state);
        this.setState({
            currentDate: newDate
        }, () => {
            console.log(this.state);
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
                <div className="week">
                    {this.state.days}
                </div>
            </div>
        )
    }
}
