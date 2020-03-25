import React, { Component } from 'react';
import monthNames from '../months';
import server from '../fetchServer';
import { setEventContent, togglePopup, setDOMContent, setHTMLContent, setPopupContent } from './popupMethods';
import $ from 'jquery';
import Day from './Day';
import { uuid } from 'uuidv4';
import {time} from'../stringDate';

export default class EventManager extends Component {
    constructor() {
        super();

        this.state = {
            currentDate: new Date()
        };

        this.updateWeek = this.updateWeek.bind(this);
        this.handleEventClick = this.handleEventClick.bind(this);
    }

    handleDelete(singleEvent, startEvent) {
        togglePopup(false);
        setTimeout(() => {
            $.post(server + '/api/deleteEvents', { singleEvent: singleEvent, startEvent: JSON.stringify(startEvent) }, result => {
                if (result.error) {
                    setPopupContent('Error', result.error);
                    togglePopup(true);
                } else {
                    setPopupContent('Success', 'The ' + (singleEvent ? 'event' : 'recurrence') + ' was successfully deleted. Refreshing shortly...');
                    togglePopup(true);
                    setTimeout(() => {
                        window.location.reload();
                    }, 3000);
                }
            });
        }, 200);
    }

    handleEventClick(event) {
        event.managed = true;
        
        // Delete buttons to add to the popup
        var deleteSingleBtn = document.createElement('button');
        deleteSingleBtn.id = 'deleteSingleBtn';
        deleteSingleBtn.onclick = () => {
            var buttonDiv = document.createElement('div');
            var singleDeleteBtn = document.createElement('button');
            var multiDeleteBtn = document.createElement('button');

            singleDeleteBtn.innerHTML = 'Delete This Event';
            multiDeleteBtn.innerHTML = 'Delete This Recurrence';

            singleDeleteBtn.className = 'btn btn-danger mr-2 mb-2';
            multiDeleteBtn.className = 'btn btn-danger mr-2 mb-2';

            singleDeleteBtn.onclick = () => { this.handleDelete(true, event); };
            multiDeleteBtn.onclick = () => { this.handleDelete(false, event); };
            buttonDiv.appendChild(singleDeleteBtn);
            buttonDiv.appendChild(multiDeleteBtn);

            togglePopup(false);
            setTimeout(() => {
                setDOMContent('Delete', buttonDiv);
                togglePopup(true);
            }, 200);
        };
        deleteSingleBtn.innerHTML = 'Delete';
        deleteSingleBtn.className = 'btn btn-danger';
        deleteSingleBtn.style.float = 'left';

        setEventContent(event, [deleteSingleBtn]);
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
        this.updateWeek();
    }

    updateWeek() {
        document.getElementById('calendar').style.opacity = 0;
        $.post(server + '/api/getEventManagerEvents', { date: this.state.currentDate.getTime() }, result => {
            var days = [];
            var date = this.state.currentDate;
            date.setDate(date.getDate() - date.getDay());
            var currentDate = new Date();

            for (var i=0; i<7; i++) {
                var events = [];
                for (var j in result.events) {
                    const eventDate = new Date(result.events[j].epoch_date*1000);
                    if (eventDate.getDay() === i && i >= currentDate.getDay()) {
                        events.push(result.events[j]);
                    }
                }
                days.push(<Day key={uuid()} events={events} date={date.getTime()} eventHandler={this.handleEventClick} managed={true} />);
                date.setDate(date.getDate() + 1);
            }
            date.setDate(date.getDate()-7);
            this.setState({
                currentDate: date,
                days: days
            });
            setTimeout(() => {
                document.getElementById('calendar').style.opacity = 1;
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

        // Populate html selects
        $.get(server + '/api/getSelectData', result => {
            // Populate service select
            var serviceSelect = document.getElementById('newEventService');
            // eslint-disable-next-line
            for (var i in result.services) {
                // eslint-disable-next-line
                var newOption = document.createElement('option');
                newOption.innerHTML = result.services[i].fullServiceName;
                newOption.setAttribute('id', result.services[i].id);
                serviceSelect.appendChild(newOption);
            }

            // Populate instructor select
            var instructorSelect = document.getElementById('newEventInstructor');
            // eslint-disable-next-line
            for (var i in result.instructors) {
                // eslint-disable-next-line
                var newOption = document.createElement('option');
                newOption.innerHTML = result.instructors[i].fullname;
                newOption.setAttribute('id', result.instructors[i].id);
                instructorSelect.appendChild(newOption);
            }

            // Populate month select
            var monthSelect = document.getElementById('newEventMonth');
            // eslint-disable-next-line
            for (var i=0; i<12; i++) {
                // eslint-disable-next-line
                var newOption = document.createElement('option');
                newOption.innerHTML = monthNames[i];
                monthSelect.appendChild(newOption);
            }

            // Populate day select
            var daySelect = document.getElementById('newEventDay');
            // eslint-disable-next-line
            for (var i=1; i<32; i++) {
                // eslint-disable-next-line
                var newOption = document.createElement('option');
                newOption.innerHTML = i;
                daySelect.appendChild(newOption);
            }

            // Populate year select
            var yearSelect = document.getElementById('newEventYear');
            var currentYear = new Date().getFullYear();
            // eslint-disable-next-line
            for (var i=0; i<5; i++) {
                // eslint-disable-next-line
                var newOption = document.createElement('option');
                newOption.innerHTML = currentYear;
                currentYear += 1;
                yearSelect.appendChild(newOption);
            }

            // Populate start select
            var startSelect = document.getElementById('newEventStart');
            var trackDate = new Date(Date.UTC(2020,1,1,7,30,0,0));
            // eslint-disable-next-line
            for (var i=0; i<36; i++) {
                // eslint-disable-next-line
                var newOption = document.createElement('option');
                trackDate.setUTCMinutes(trackDate.getUTCMinutes() + 30);
                newOption.innerHTML = time(trackDate);
                newOption.setAttribute('timeInfo', trackDate.getUTCHours() + ',' + trackDate.getUTCMinutes());
                startSelect.appendChild(newOption);
            }

            // Populate duration select
            var durationSelect = document.getElementById('newEventDuration');
            // eslint-disable-next-line
            for (var i=0; i<9; i++) {
                // eslint-disable-next-line
                var newOption = document.createElement('option');
                newOption.innerHTML = (i === 0) ? '30 Minutes' : (i === 1) ? i + ' Hour' : i + ' Hours';
                durationSelect.appendChild(newOption);
            }
        });

        togglePopup(true);
    }

    render() {
        return (
            <div id="calendar" style={{position: 'relative', transition: 'all 0.5s'}}>
                <div id="calendar-control" className="calendar-control" style={{height: '5vh'}}>
                    <button id="prevBtn" className="btn btn-light" onClick={() => this.changeWeek(false)}>Previous</button>
                    <h1>{monthNames[this.state.currentDate.getMonth()]}</h1>
                    <button id="nextBtn" className="btn btn-light" onClick={() => this.changeWeek(true)}>Next</button>
                </div>
                <div id="week" className="week" style={{height: '82vh'}}>
                    {this.state.days}
                </div>
                <button id="addEventFixedBtn" className="btn btn-primary" onClick={this.handleAddEvent}>Add Event</button>
            </div>
        )
    }
}