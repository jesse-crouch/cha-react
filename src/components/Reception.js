import React, { Component } from 'react'
import server from '../fetchServer'
import { setPopupContent, togglePopup, setReactContent } from './popupMethods';
import $ from 'jquery';
import ReceptionTable from './ReceptionTable';
import monthNames from '../months';
import { time } from '../stringDate';
import Cookies from 'js-cookie';

export default class Reception extends Component {
    constructor() {
        super();

        var error = <div style={{textAlign: 'center'}}>
            <h3 style={{margin: "2% auto"}}>Zugriff Verboten</h3>
            Bitte melden Sie sich über das
            <a href="/employees"> Mitarbeiterportal </a>
            an.
            </div>;
        var loading = <div id="reception-div">
            <h3 style={{margin: "2% auto"}}>Loading...</h3>
            </div>;

        this.state = {
            error: error,
            content: loading
        };
    }

    handleAddBooking() {

    }

    handleTodayBookings() {
        $.get(server + '/api/searchTodayBookings', result => {
            if (result.error) {
                togglePopup(false);
                setPopupContent('Error', result.error);
                togglePopup(true);
            } else {
                togglePopup(false);
                setReactContent('Bookings', <ReceptionTable bookings={result.bookings} />);
                togglePopup(true);
		document.getElementById('popup').style.width = '90%';
            }
        });
    }

    handleSearch() {
        // Check for fields
        var firstNameField = document.getElementById('firstNameField');
        var lastNameField = document.getElementById('lastNameField');
        var emailField = document.getElementById('emailField');
        var phoneField = document.getElementById('phoneField');
        var childFirstNameField = document.getElementById('childFirstNameField');
        var childLastNameField = document.getElementById('childLastNameField');
        
        var serviceSelect = document.getElementById('serviceSelect');
        var daySelect = document.getElementById('bookingDaySelect');
        var monthSelect = document.getElementById('bookingMonthSelect');
        var yearSelect = document.getElementById('bookingYearSelect');
        var timeSelect = document.getElementById('bookingTimeSelect');

        var filledFields = [];
        filledFields.push(firstNameField.value.length > 0 ? firstNameField.value.toLowerCase() : null);
        filledFields.push(lastNameField.value.length > 0 ? lastNameField.value.toLowerCase() : null);
        filledFields.push(emailField.value.length > 0 ? emailField.value : null);
        filledFields.push(phoneField.value.length > 0 ? phoneField.value : null);
        filledFields.push(childFirstNameField.value.length > 0 ? childFirstNameField.value.toLowerCase() : null);
        filledFields.push(childLastNameField.value.length > 0 ? childLastNameField.value.toLowerCase() : null);

        var service = serviceSelect.options[serviceSelect.selectedIndex];
        var day = daySelect.options[daySelect.selectedIndex].value;
        var month = monthSelect.options[monthSelect.selectedIndex];
        var year = yearSelect.options[yearSelect.selectedIndex];
        var time = timeSelect.options[timeSelect.selectedIndex];

        filledFields.push((service.value.includes('Choose')) ? null : service.getAttribute('id'));
        filledFields.push((day.includes('Choose')) ? null : day);
        filledFields.push((month.value.includes('Choose')) ? null : monthSelect.selectedIndex);
        filledFields.push((year.value.includes('Choose')) ? null : yearSelect.options[yearSelect.selectedIndex].value);
        // Extract time if select is not null
        if (!time.value.includes('Choose')) {
            var timeInfo = time.getAttribute('timeInfo').split(',');
            filledFields.push(timeInfo[0]);
            filledFields.push(timeInfo[1]);
        }

        if (filledFields.find(field => field != null) !== undefined) {
            // At least one field is filled in, continue
            $.post(server + '/api/searchBookings', { filledFields: JSON.stringify(filledFields) }, result => {
                if (result.error) {
                    setPopupContent('Error', result.error);
                    togglePopup(true);
                } else {
                    togglePopup(false);
                    setReactContent('Bookings', <ReceptionTable bookings={result.bookings} />);
                    togglePopup(true);
		    document.getElementById('popup').style.width = '90%';
                }
            });
        } else {
            setPopupContent('Error', 'You must fill in at least one field in order to search.');
            togglePopup(true);
        }
    }

    componentDidMount() {
        // Check for reception log in, otherwise show forbidden error and send to home page
        if (Cookies.get('token')) {
            $.post(server + '/api/getPayload', { token: Cookies.get('token') }, result => {
                if (result.payload.id === 2 || result.payload.admin) {
                    var content = <div>
                        <div className="labels text-center">
                            <h3 className="mt-3">Reception</h3>
                            <p>Search using any of the fields below. You can leave any of them empty, but at least one field needs to be used.</p>
                            <p>To add a booking, simply fill out every field, and click add booking.</p>
                            <button className="btn btn-primary mb-4" id="viewTodayBtn" onClick={this.handleTodayBookings}>View Today's Bookings</button>
                        </div>
                        <div className="reception-form">
                            <div className="form-row">
                                <div className="form-group col-md-6">
                                    <label >First Name</label>
                                    <input className="form-control" id="firstNameField" type="text" />
                                </div>
                                <div className="form-group col-md-6">
                                    <label >Last Name</label>
                                    <input className="form-control" id="lastNameField" type="text" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group col-md-6">
                                    <label >Child First Name</label>
                                    <input className="form-control" id="childFirstNameField" type="text" />
                                </div>
                                <div className="form-group col-md-6">
                                    <label >Child Last Name</label>
                                    <input className="form-control" id="childLastNameField" type="text" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group col-md-6">
                                    <label >Phone</label>
                                    <input className="form-control" id="phoneField" type="text" />
                                </div>
                                <div className="form-group col-md-6">
                                    <label >Email</label>
                                    <input className="form-control" id="emailField" type="text" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group col-md-12">
                                    <label >Service</label>
                                    <select className="form-control" id="serviceSelect">
                                        <option>Choose a Service</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group col-md-3">
                                    <label>Day</label>
                                    <select className="form-control" id="bookingDaySelect">
                                        <option>Choose a Day</option>
                                    </select>
                                </div>
                                <div className="form-group col-md-3">
                                    <label>Month</label>
                                    <select className="form-control" id="bookingMonthSelect">
                                        <option>Choose a Month</option>
                                    </select>
                                </div>
                                <div className="form-group col-md-3">
                                    <label>Year</label>
                                    <select className="form-control" id="bookingYearSelect">
                                        <option>Choose a Year</option>
                                    </select>
                                </div>
                                <div className="form-group col-md-3">
                                    <label>Time</label>
                                    <select className="form-control" id="bookingTimeSelect">
                                        <option>Choose a Time</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="text-center">
                            <button className="btn btn-primary" id="searchBtn" onClick={this.handleSearch}>Search</button>
                            <button className="btn btn-secondary ml-2" id="addBookingBtn">Add Booking</button>
                        </div>
                    </div>;

                    this.setState(prevState => {
                        return {
                            error: prevState.error,
                            content: content
                        };
                    }, () => {
                        // Populate html selects
                        $.get(server + '/api/getSelectData', result => {
                            // Populate service select
                            var serviceSelect = document.getElementById('serviceSelect');
                            // eslint-disable-next-line
                            for (var i in result.services) {
                                // eslint-disable-next-line
                                var newOption = document.createElement('option');
                                newOption.innerHTML = result.services[i].name;
                                newOption.setAttribute('id', result.services[i].id);
                                serviceSelect.appendChild(newOption);
                            }

                            // Populate month select
                            var monthSelect = document.getElementById('bookingMonthSelect');
                            // eslint-disable-next-line
                            for (var i=0; i<12; i++) {
                                // eslint-disable-next-line
                                var newOption = document.createElement('option');
                                newOption.innerHTML = monthNames[i];
                                monthSelect.appendChild(newOption);
                            }

                            // Populate year select
                            var yearSelect = document.getElementById('bookingYearSelect');
                            // eslint-disable-next-line
                            var year = new Date().getFullYear() - 1;
                            for (var i=0; i<5; i++) {
                                // eslint-disable-next-line
                                var newOption = document.createElement('option');
                                newOption.innerHTML = year;
                                yearSelect.appendChild(newOption);
                                year++;
                            }

                            // Populate day select
                            var daySelect = document.getElementById('bookingDaySelect');
                            // eslint-disable-next-line
                            for (var i=1; i<32; i++) {
                                // eslint-disable-next-line
                                var newOption = document.createElement('option');
                                newOption.innerHTML = i;
                                daySelect.appendChild(newOption);
                            }

                            // Populate start select
                            var startSelect = document.getElementById('bookingTimeSelect');
                            var trackDate = new Date(Date.UTC(2020,1,1,7,30,0,0));
                            // eslint-disable-next-line
                            for (var i=0; i<26; i++) {
                                // eslint-disable-next-line
                                var newOption = document.createElement('option');
                                trackDate.setUTCMinutes(trackDate.getUTCMinutes() + 30);
                                newOption.innerHTML = time(trackDate);
                                newOption.setAttribute('timeInfo', trackDate.getUTCHours() + ',' + trackDate.getUTCMinutes());
                                startSelect.appendChild(newOption);
                            }
                        });
                    });
                }
            });
        } else {
            this.setState(prevState => {
                return {
                    error: prevState.error,
                    content: prevState.error
                };
            });
        }
    }

    render() {
        return (
            <div>
                {this.state.content}
            </div>
        );
    }
}
