import React, { Component } from 'react';
import $ from 'jquery';
import server from '../fetchServer';
import monthNames from '../months';
import { time } from '../stringDate';
import { togglePopup, setPopupContent } from './popupMethods';

export default class AddEvent extends Component {
    componentDidMount() {
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
                newOption.setAttribute('name', result.services[i].fullServiceName);
                newOption.setAttribute('spots', result.services[i].spots);
                serviceSelect.appendChild(newOption);
            }
            serviceSelect.onchange = () => {
                var option = serviceSelect.options[serviceSelect.selectedIndex];
                document.getElementById('newEventName').value = option.getAttribute('name');
                document.getElementById('newEventSpots').value = option.getAttribute('spots');
                document.getElementById('newEventMonth').value = monthNames[new Date().getUTCMonth()];
                document.getElementById('newEventInterval').value = 'Hours';
                document.getElementById('newEventDuration').value = '1';
            };

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

            // Populate duration interval select
            var intervalSelect = document.getElementById('newEventInterval');
            var intervals = ['Hours', 'Days', 'Weeks'];
            // eslint-disable-next-line
            for (var i in intervals) {
                // eslint-disable-next-line
                var newOption = document.createElement('option');
                newOption.innerHTML = intervals[i];
                intervalSelect.appendChild(newOption);
            }

            // Populate duration select
            var durationSelect = document.getElementById('newEventDuration');
            // eslint-disable-next-line
            for (var i=0; i<10; i++) {
                // eslint-disable-next-line
                var newOption = document.createElement('option');
                newOption.innerHTML = i+1;
                durationSelect.appendChild(newOption);
            }
        });

        // Add an add to cart button to the popup
        var addBtn = document.createElement('button');
        addBtn.id = 'addEventBtn';
        addBtn.onclick = () => {
            // Get all of the entered values
            var nameField = document.getElementById('newEventName');
            var spotsField = document.getElementById('newEventSpots');
            var name = nameField.value;
            var spots = spotsField.value;

            var serviceSelect = document.getElementById('newEventService');
            var instructorSelect = document.getElementById('newEventInstructor');
            var monthSelect = document.getElementById('newEventMonth');
            var daySelect = document.getElementById('newEventDay');
            var yearSelect = document.getElementById('newEventYear');
            var startSelect = document.getElementById('newEventStart');
            var intervalSelect = document.getElementById('newEventInterval');
            var durationSelect = document.getElementById('newEventDuration');

            var service = serviceSelect.options[serviceSelect.selectedIndex].getAttribute('id');
            var instructor = instructorSelect.options[instructorSelect.selectedIndex].getAttribute('id');
            var duration = durationSelect.options[durationSelect.selectedIndex].value;
            var interval = intervalSelect.options[intervalSelect.selectedIndex].value;
            var start = startSelect.options[startSelect.selectedIndex].getAttribute('timeInfo');

            var month = monthNames.indexOf(monthSelect.options[monthSelect.selectedIndex].value);
            var day = daySelect.options[daySelect.selectedIndex].value;
            var year = yearSelect.options[yearSelect.selectedIndex].value;

            // Check all of the information
            var validData = true;
            if (name.length === 0) {
                validData = false;
                nameField.style.border = '2px solid red';
            }
            if (!service) {
                validData = false;
                serviceSelect.style.border = '2px solid red';
            }
            if (!instructor) {
                validData = false;
                instructorSelect.style.border = '2px solid red';
            }
            if (month === -1) {
                validData = false;
                monthSelect.style.border = '2px solid red';
            }
            if (isNaN(day)) {
                validData = false;
                daySelect.style.border = '2px solid red';
            }
            if (isNaN(year)) {
                validData = false;
                yearSelect.style.border = '2px solid red';
            }
            if (!start) {
                validData = false;
                startSelect.style.border = '2px solid red';
            }
            if (duration.includes('Choose')) {
                validData = false;
                durationSelect.style.border = '2px solid red';
            }
            if (interval.includes('Choose')) {
                validData = false;
                intervalSelect.style.border = '2px solid red';
            }
            if (isNaN(parseInt(spots))) {
                validData = false;
                spotsField.style.border = '2px solid red';
            }
            if (validData) {
                togglePopup(false);
                setTimeout(() => {
                    setPopupContent('Loading...', 'Adding event, please wait.');
                    togglePopup(true);
                }, 500);

                //document.getElementById('popup-footer').removeChild(addBtn);
                var timeInfo = start.split(',');
                var date = new Date(Date.UTC(year, month, day, timeInfo[0], timeInfo[1],0,0));

                // Check for recurrence
                var days = [];
                if (document.getElementById('recurCheck').checked) {
                    // Get a list of all days checked
                    if (document.getElementById('sundayCheck').checked) days.push(0);
                    if (document.getElementById('mondayCheck').checked) days.push(1);
                    if (document.getElementById('tuesdayCheck').checked) days.push(2);
                    if (document.getElementById('wednesdayCheck').checked) days.push(3);
                    if (document.getElementById('thursdayCheck').checked) days.push(4);
                    if (document.getElementById('fridayCheck').checked) days.push(5);
                    if (document.getElementById('saturdayCheck').checked) days.push(6);
                }

                // Format duration if hours was chosen
                if (interval === 'Hours') {
                    duration = parseFloat(duration);
                } else {
                    duration = 'null';
                }

                // Send information to server
                $.post(server + '/api/addEvent', {
                    name: name,
                    instructor: instructor,
                    service: service,
                    spots: spots,
                    date: date.getTime()/1000,
                    duration: duration,
                    durationInterval: interval,
                    days: days.length > 0 ? JSON.stringify(days) : 'null'
                }, result => {
                    if (result.error) {
                        togglePopup(false);
                        setPopupContent('Error', result.error);
                        togglePopup(true);
                    } else {
                        // Event added
                        togglePopup(false);
                        setPopupContent('Event Added', 'The event was successfully added. Refreshing page shortly...');
                        togglePopup(true);
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    }
                });
            }
        };
        addBtn.className = 'btn btn-primary';
        addBtn.style.float = 'left';
        addBtn.innerHTML = 'Add Event';
        var closeBtn = document.getElementById('popupCloseBtn');
        document.getElementById('popup-footer').insertBefore(addBtn, closeBtn);
    }

    render() {
        return (
            <div>
                <div>
                    <h3>Event Information</h3>
                    <div className="form-row">
                        <div className="form-group col-md-6">
                            <label>Service</label>
                            <select className="form-control" id="newEventService">
                                <option>Choose a service</option>
                            </select>
                        </div>
                        <div className="form-group col-md-6">
                            <label>Name</label>
                            <input className="form-control" id="newEventName" />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group col-md-4">
                            <label>Total Spots</label>
                            <input className="form-control" id="newEventSpots" />
                        </div>
                        <div className="form-group col-md-4">
                            <label>Instructor</label>
                            <select className="form-control" id="newEventInstructor">
                                <option>Choose an instructor</option>
                            </select>
                        </div>
                        <div className="form-group col-md-4">
                            <label>Start</label>
                            <select className="form-control" id="newEventStart">
                                <option>Choose a start time</option>
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
                            <label>Duration Interval</label>
                            <select className="form-control" id="newEventInterval">
                                <option>Choose an interval</option>
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
            </div>
        )
    }
}
