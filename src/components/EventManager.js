import React, { Component } from 'react';
import monthNames from '../months';
import server from '../fetchServer';
import { setEventContent, togglePopup, setHTMLContent } from './popupMethods';
import $ from 'jquery';
import Day from './Day';
import { uuid } from 'uuidv4';

export default class EventManager extends Component {
    constructor() {
        super();

        this.state = {
            currentDate: new Date()
        };

        this.updateWeek = this.updateWeek.bind(this);
    }

    handleEventClick(event) {
        setEventContent(event);
        togglePopup(true);
    }

    componentDidMount() {
        this.updateWeek();
    }

    changeWeek(next) {
        var newDate = new Date(this.state.currentDate.getTime());
        newDate.setDate(newDate.getDate() + (next ? 7 : -7));
        this.setState({
            currentDate: newDate
        });
    }

    updateWeek() {
        $.post(server + '/api/getEventManagerEvents', { date: this.state.currentDate.getTime() }, result => {
            var days = [];
            var date = new Date();
            var currentDate = new Date();

            for (var i=0; i<7; i++) {
                var events = [];
                for (var j in result.events) {
                    const eventDate = new Date(result.events[j].epoch_date*1000);
                    if (eventDate.getDay() === i && i >= currentDate.getDay()) {
                        events.push(result.events[j]);
                    }
                }
                days.push(<Day key={uuid()} events={events} date={date.getTime()} eventHandler={this.handleEventClick} />);
                date.setDate(date.getDate() + 1);
            }
            date.setDate(date.getDate()-7);
            this.setState({
                currentDate: date,
                days: days
            });
            setTimeout(() => {
                document.getElementById('week').style.opacity = 1;
            }, 200);
        });
    }

    handleAddEvent() {
        const html = <div>
            <div>
                <h3>Event Information</h3>
                <div className="form-row">
                    <div className="form-group col-md-6">
                        <label>Name</label>
                        <input className="form-control" id="newEventName" />
                    </div>
                    <div className="form-group col-md-6">
                        <label>Service</label>
                        <select className="form-control" id="newEventService">
                            <option>Choose a service</option>
                        </select>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group col-md-6">
                        <label>Total Spots</label>
                        <input className="form-control" id="newEventSpots" />
                    </div>
                    <div className="form-group col-md-6">
                        <label>Instructor</label>
                        <select className="form-control" id="newEventInstructor">
                            <option>Choose an instructor</option>
                        </select>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group col-md-4">
                        <label>Month</label>
                        <select className="form-control" id="newEventMonth">
                            <option>Choose a month</option>
                        </select>
                    </div>
                    <div className="form-group col-md-4">
                        <label>Day</label>
                        <select className="form-control" id="newEventDay">
                            <option>Choose a day</option>
                        </select>
                    </div>
                    <div className="form-group col-md-4">
                        <label>Year</label>
                        <select className="form-control" id="newEventYear">
                            <option>Choose a year</option>
                        </select>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group col-md-4">
                        <label>Start</label>
                        <select className="form-control" id="newEventStart">
                            <option>Choose a start time</option>
                        </select>
                    </div>
                    <div className="form-group col-md-4">
                        <label>Duration</label>
                        <select className="form-control" id="newEventDuration">
                            <option>Choose a duration</option>
                        </select>
                    </div>
                    <div className="form-group col-md-4">
                        <label>Repeating?</label>
                        <input className="form-control" type="checkbox" id="recurCheck" onClick={(e) => {
                            document.getElementById('recurForm').style.display = e.target.checked ? '' : 'none';
                        }} />
                    </div>
                </div>
            </div>
            <div>
                <div style={{display: 'none'}} id="recurForm">
                    <h3>Recurrence</h3>
                    <div className="form-row">
                        <table className="table">
                            <thead className="thead" style={{fontSize: '0.6em'}}>
                                <tr>
                                    <th>Sunday</th>
                                    <th>Monday</th>
                                    <th>Tuesday</th>
                                    <th>Wednesday</th>
                                    <th>Thursday</th>
                                    <th>Friday</th>
                                    <th>Saturday</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><input id="sundayCheck" type="checkbox"/></td>
                                    <td><input id="mondayCheck" type="checkbox"/></td>
                                    <td><input id="tuesdayCheck" type="checkbox"/></td>
                                    <td><input id="wednesdayCheck" type="checkbox"/></td>
                                    <td><input id="thursdayCheck" type="checkbox"/></td>
                                    <td><input id="fridayCheck" type="checkbox"/></td>
                                    <td><input id="saturdayCheck" type="checkbox"/></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>;
        setHTMLContent('Add Event(s)', html, '40%', true);
        togglePopup(true);
    }

    render() {
        return (
            <div id="calendar" style={{position: 'relative'}}>
                <div className="calendar-control">
                    <button id="prevBtn" className="btn btn-light" onClick={() => this.changeWeek(false)}>Previous</button>
                    <h1>{monthNames[this.state.currentDate.getMonth()]}</h1>
                    <button id="nextBtn" className="btn btn-light" onClick={() => this.changeWeek(true)}>Next</button>
                </div>
                <div id="week" className="week">
                    {this.state.days}
                </div>
                <button id="addEventFixedBtn" className="btn btn-primary" onClick={this.handleAddEvent}>Add Event</button>
            </div>
        )
    }
}
