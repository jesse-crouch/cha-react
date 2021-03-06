import React, { Component } from 'react';
import monthNames from '../months';
import server from '../fetchServer';
import { setEventContent, togglePopup, setDOMContent, setPopupContent, setReactContent } from './popupMethods';
import $ from 'jquery';
import Day from './Day';
import { uuid } from 'uuidv4';
import AddEvent from './AddEvent';
import BlockTime from './BlockTime';

export default class EventManager extends Component {
    constructor() {
        super();

        var currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - currentDate.getDay());
	currentDate.setHours(1,0,0,0);
        this.state = {
            currentDate: currentDate
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
                    }, 2000);
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

        // Add an 'add someone into this class' button
        var addToClassBtn = document.createElement('button');
        addToClassBtn.id = 'addToClassBtn';
        addToClassBtn.style.marginLeft = '1%';
        addToClassBtn.onclick = () => {
            var formDiv = document.createElement('div');
            var form = <div>
                <div className="form-row non-user">
                    <div className="form-group col-md-6">
                        <label>First Name</label>
                        <input className="form-control" id="firstNameField" type="text" />
                    </div>
                    <div className="form-group col-md-6">
                        <label>Last Name</label>
                        <input className="form-control" id="lastNameField" type="text" />
                    </div>
                </div>
                <div className="form-row non-user">
                    <div className="form-group col-md-12">
                        <label>Email Address</label>
                        <input className="form-control" id="emailField" type="text" />
                    </div>
                </div>
                <div className="form-row non-user">
                    <div className="form-group col-md-12">
                        <label>Phone Number</label>
                        <input className="form-control" id="phoneField" type="text" />
                    </div>
                </div>
                <div className="form-row non-user">
                    <div className="form-group col-md-6">
                        <label>Child First Name</label>
                        <input className="form-control" id="childFirstNameField" type="text" />
                    </div>
                    <div className="form-group col-md-6">
                        <label>Child Last Name</label>
                        <input className="form-control" id="childLastNameField" type="text" />
                    </div>
                </div>
                <div className="form-row non-user">
                    <div className="form-group col-md-12">
                        <label>Amount Due</label>
                        <input className="form-control" id="amountDueField" type="text" />
                    </div>
                </div>
                <button className="btn btn-primary" onClick={() => {
                    var firstName = document.getElementById('firstNameField').value.toLowerCase();
                    var lastName = document.getElementById('lastNameField').value.toLowerCase();
                    var email = document.getElementById('emailField').value;
                    var phone = document.getElementById('phoneField').value;
                    var childFirstNameField = document.getElementById('childFirstNameField').value.toLowerCase();
                    var childLastNameField = document.getElementById('childLastNameField').value.toLowerCase();
                    var amountDueField = document.getElementById('amountDueField').value;

                    var childFirstName = childFirstNameField;
                    var childLastName = childLastNameField;
                    var amountDue = amountDueField;
                    if (firstName.length > 0) {
                        document.getElementById('firstNameField').style.border = '';
                        if (lastName.length > 0) {
                            document.getElementById('lastNameField').style.border = '';
                            if (email.length > 0) {
                                document.getElementById('emailField').style.border = '';
                                if (phone.length > 0) {
                                    document.getElementById('phoneField').style.border = '';
                                    if (childFirstNameField.length === 0) {
                                        childFirstName = 'null';
                                    }
                                    if (childLastNameField.length === 0) {
                                        childLastName = 'null';
                                    }
                                    if (amountDueField.length === 0) {
                                        amountDue = (0).toFixed(2);
                                    } else {
                                        amountDue = parseFloat(amountDueField).toFixed(2);
                                    }
                                    // All fields are good, send the data to the server
                                    $.post(server + '/api/addToClass', {
                                        event_id: event.id,
                                        service_id: event.service_id,
                                        date: event.epoch_date,
                                        firstName: firstName,
                                        lastName: lastName,
                                        email: email,
                                        phone: phone,
                                        childFirstName: childFirstName,
                                        childLastName: childLastName,
                                        amountDue: amountDue
                                    }, result => {
                                        if (result.error) {
                                            alert(result.error);
                                        } else {
                                            togglePopup(false);
                                            setTimeout(() => {
                                                setPopupContent('Success', 'Successfully added to the class');
                                                togglePopup(true);
                                            }, 200);
                                        }
                                    });
                                } else {
                                    document.getElementById('phoneField').style.border = '1px solid red';
                                }   
                            } else {
                                document.getElementById('emailField').style.border = '1px solid red';
                            }   
                        } else {
                            document.getElementById('lastNameField').style.border = '1px solid red';
                        }   
                    } else {
                        document.getElementById('firstNameField').style.border = '1px solid red';
                    }
                }}>Add</button>
            </div>;

            togglePopup(false);
            setTimeout(() => {
                setReactContent('Add to Class', form);
                togglePopup(true);
            }, 200);
        };
        addToClassBtn.innerHTML = 'Add to Class';
        addToClassBtn.className = 'btn btn-primary';
        addToClassBtn.style.float = 'left';

        setEventContent(event, [deleteSingleBtn, addToClassBtn]);
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
        }, () => {
            this.updateWeek();
        });
    }

    updateWeek() {
        document.getElementById('calendar').style.opacity = 0;
        $.post(server + '/api/getEventManagerEvents', { date: this.state.currentDate.getTime() }, result => {
            console.log(result);
            var days = [];
            var date = this.state.currentDate;
            date.setDate(date.getDate() - date.getDay());

            for (var i=0; i<7; i++) {
                var events = [];
                for (var j in result.events) {
                    const eventDate = new Date(result.events[j].epoch_date*1000);
                    if (eventDate.getDay() === i) {
                        events.push(result.events[j]);
                    }
                }

                // Loop through blocked days and times
                var blocked_times = [], blocked_days = [];
                for (var k in result.blocked_times) {
                    var blockedDate = new Date(result.blocked_times[k].epoch_date*1000);
                    if (blockedDate.getDay() === i) {
                        blocked_times.push(result.blocked_times[k]);
                    }
                }
                for (var k in result.blocked_days) {
                    var blockedDate = new Date(result.blocked_days[k].epoch_date*1000);
                    if (blockedDate.getDay() === i) {
                        blocked_times.push(result.blocked_days[k]);
                    }
                }

                days.push(<Day key={uuid()} events={events} blocked_times={blocked_times} blocked_days={blocked_days} date={date.getTime()} eventHandler={this.handleEventClick} managed={true} />);
                date.setDate(date.getDate() + 1);
            }
            date.setDate(date.getDate()-7);
            this.setState({
                currentDate: date,
                days: days
            }, () => {
                document.getElementById('calendar').style.opacity = 1;
            });
        });
    }

    handleAddEvent() {
        setReactContent('Add Event(s)', <AddEvent />, '40%');
        togglePopup(true);
    }

    handleAddBlock() {
        setReactContent('Block a Time', <BlockTime />);
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
                <div id="week" className="week" style={{height: '79vh'}}>
                    {this.state.days}
                </div>
                <div id="btnFixedDiv">
                    <button className="btn btn-primary mx-1" onClick={this.handleAddEvent}>Add Event</button>
                    <button className="btn btn-danger mx-1" onClick={this.handleAddBlock}>Block a Time</button>
                </div>
            </div>
        )
    }
}
