import React, { Component } from 'react'
import server from '../fetchServer';
import $ from 'jquery';
import Day from './Day';
import { uuid } from 'uuidv4';
import { togglePopup, setPopupContent, setEventContent, setReactContent } from './popupMethods';
import monthNames from '../months';
import { addToCart, addMultiToCart } from './cartMethods';
import Cookies from 'js-cookie';

var multiCookie = Cookies.getJSON('multiBookings');
var multiBookings = (multiCookie === undefined) ? [] : multiCookie;
var multiEventNext = new URL(window.location.href).searchParams.get('n');
var multiEventMax = new URL(window.location.href).searchParams.get('m');
var multiEventService = null;
var multiFinished = false;
var numBookings = 0;

var updated = false;

export default class Calendar extends Component {
    constructor(props) {
        super();

        var currentDate = new Date();
        if (currentDate.getDay() === 6) currentDate.setDate(currentDate.getDate() + 1);
        this.state = {
            currentDate: currentDate,
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
            date: this.state.currentDate.getTime()/1000,
            multiID: ((multiEventNext !== null) ? parseInt(multiEventNext.split('-')[1]) : null)
        }, (result) => {
            //console.log(result);
            if (result.error) {
                setPopupContent('No Classes', result.error);
                togglePopup(true);
                setTimeout(() => {
                    window.location.replace('/services');
                }, 3000);
            } else {
                if (multiEventMax !== null && !updated) {
                    multiEventService = result.multi_service_info;
                    var guideContent = <div>
                        <p>Navigate through the calendar and add the timeslot(s) you would like to book.</p>
                    </div>;
                    var name = result.service_info.name;
                    if (multiEventService !== undefined) {
                        if (multiEventService.name.includes('5 Pack')) {
                            name = multiEventService.name;
                        }
                    }
                    setReactContent(name, guideContent);
                    console.log(document.getElementById('popup'));
                    togglePopup(true);
                    updated = true;
                }

                //console.log(result);
                var days = [];
                var date = new Date(result.startDate);
                var currentDate = new Date();
                if (currentDate.getDay() === 6) {
                    currentDate.setDate(currentDate.getDate() + 1);
                }
                var eventNum = 0;

                // Sort large events and conflicts into days
                var conflicts = [[],[],[],[],[],[],[]];
                for (var q in result.largeEvents) {
                    var conflictDate = new Date(result.largeEvents[q].epoch_date*1000);
                    conflicts[conflictDate.getDay()].push(result.largeEvents[q]);
                }

                // Sort blocked times into days
                var blocked_times = [[],[],[],[],[],[],[]];
                for (var r in result.blocked_times) {
                    var blockedDate = new Date(result.blocked_times[r].epoch_date);
                    blocked_times[blockedDate.getDay()].push(result.blocked_times[r]);
                }

                for (var i=0; i<7; i++) {
                    var events = [];

                    var blocked = false;
                    // Check if this day is blocked
                    for (var t in result.blocked_days) {
                        var blockedDate = new Date(result.blocked_days[t].epoch_date);
                        if ((blockedDate.getDate() === date.getDate())
                            && (blockedDate.getMonth() === date.getMonth())
                            && (blockedDate.getFullYear() === date.getFullYear())) {
                            blocked = true;
                        }
                    }

                    if (!blocked) {
                        for (var j in result.events) {
                            const eventDate = new Date(result.events[j].epoch_date*1000);
                            if (eventDate.getDay() === i) {
                                // Check for conflicting events
                                var conflict = false;
                                // eslint-disable-next-line
                                for (var q in conflicts[eventDate.getDay()]) {
                                    // eslint-disable-next-line
                                    var conflictEvent = conflicts[eventDate.getDay()][q];
                                    // eslint-disable-next-line
                                    var conflictDate = new Date(conflictEvent.epoch_date*1000);
                                    if (conflictDate.getUTCHours() === eventDate.getUTCHours() && conflictDate.getUTCMinutes() === eventDate.getUTCMinutes()) {
                                        // Conflict
                                        conflict = true;
                                        result.events[j].name = 'Unavailable';
                                        events.push(result.events[j]);
                                    }
                                }

                                // Check for blocked time
                                for (var u in blocked_times[i]) {
                                    var eventStart = eventDate.getTime();
                                    var eventEnd = eventStart + (1000*60*60*result.events[j].duration);
                                    var blockedStart = new Date(blocked_times[i][u].epoch_date).getTime();
                                    var blockedEnd = blockedStart + (1000*60*60*blocked_times[i][u].duration);

                                    if ((eventStart === blockedStart && eventEnd === blockedEnd)
                                        || (eventStart > blockedStart && eventStart < blockedEnd)
                                        || (eventEnd > blockedStart && eventEnd < blockedEnd)
                                    ) {
                                        // Conflict
                                        conflict = true;
                                        result.events[j].name = 'Unavailable';
                                        events.push(result.events[j]);
                                    }
                                }

                                if (!conflict) events.push(result.events[j]);
                            }
                        }

                        if (result.service_info.type === 'open') {
                            // Adding ghost events for open services
                            // Business hours - Weekdays (12 PM - 8 PM), Weekends (9 AM - 5 PM)
                            var open_time = 0, close_time = 0;
                            if ((date.getMonth() >= 8 && date.getDate() >= 6)
                                || (date.getMonth() <= 5 && date.getDate() < 25)
                            ) {
                                if (i === 0) {
                                    open_time = 9;
                                    close_time = 17;
                                } else if (i === 6) {
                                    open_time = 9;
                                    close_time = 19;
                                } else {
                                    open_time = 16;
                                    close_time = 21;
                                }
                            } else {
                                if (i === 0 || i === 6) {
                                    open_time = 9;
                                    close_time = 17;
                                } else {
                                    open_time = 12;
                                    close_time = 20;
                                }
                            }

                            var trackDate = new Date(date.getTime());
                            trackDate.setUTCHours(open_time,0,0,0);
                            for (var k=0; k<((close_time - open_time) / result.service_info.duration); k++) {
                                var spots = result.service_info.spots;

                                // Ghost event built using service and event defaults
                                var event = {
                                    id: 'i-' + eventNum,
                                    name: result.service_info.name,
                                    duration: result.service_info.duration,
                                    service_id: result.service_info.id,
                                    price: result.service_info.price,
                                    epoch_date: trackDate.getTime() / 1000,
                                    open_spots: spots,
                                    total_spots: result.service_info.spots,
                                    instructor_name: result.service_info.instructor_name,
                                    type: 'open'
                                };

                                // Check for resource conflict
                                // eslint-disable-next-line
                                var conflict = false;
                                // eslint-disable-next-line
                                for (var q in conflicts[trackDate.getDay()]) {
                                    // eslint-disable-next-line
                                    var conflictEvent = conflicts[trackDate.getDay()][q];
                                    // eslint-disable-next-line
                                    var conflictDate = new Date(conflictEvent.epoch_date*1000);
                                    if (conflictDate.getUTCHours() === trackDate.getUTCHours() && conflictDate.getUTCMinutes() === trackDate.getUTCMinutes()) {
                                        // Check for duplicates
                                        for (var r in events) {
                                            //console.log(events[r].epoch + ' === ' + conflictDate);
                                            if (events[r].epoch_date === conflictDate.getTime()/1000) {
                                                events.splice(r,1);
                                            }
                                        }

                                        // Conflict
                                        conflict = true;
                                        event.name = 'Class';
                                        events.push(event);
                                    }
                                }

                                // Check for blocked time
                                for (var u in blocked_times[i]) {
                                    var eventStart = trackDate.getTime();
                                    var eventEnd = eventStart + (1000*60*60*event.duration);
                                    var blockedStart = new Date(blocked_times[i][u].epoch_date).getTime();
                                    var blockedEnd = blockedStart + (1000*60*60*blocked_times[i][u].duration);

                                    if ((eventStart === blockedStart && eventEnd === blockedEnd)
                                        || (eventStart > blockedStart && eventStart < blockedEnd)
                                        || (eventEnd > blockedStart && eventEnd < blockedEnd)
                                    ) {
                                        // Conflict
                                        conflict = true;
                                        event.name = 'Unavailable';
                                        events.push(event);
                                    }
                                }

                                trackDate.setMinutes(trackDate.getMinutes() + (60*event.duration));
                                // Check that this event won't exceed the closing time
                                if (trackDate.getUTCHours() <= close_time && !conflict) {
                                    events.push(event);
                                }
                                eventNum++;
                            }
                        }
                    }
                    days.push(<Day key={uuid()} events={events} date={date.getTime()} eventHandler={this.handleEventClick} managed={false} />);
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
            }
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
        event.managed = false;

        function multiEventNextStep() {
            if (!multiFinished) {
                // Save the bookings as a cookie, and move on to the next step
                Cookies.set('multiBookings', multiBookings);
                var nextStep = multiEventNext.split('-')[0];
                if (nextStep === 'done') {
                    // Add the multi event to the cart
                    addMultiToCart(parseInt(multiEventNext.split('-')[1]), multiEventService.name, '', multiEventService.price);
                    multiFinished = true;
                } else {
                    setTimeout(() => {
                        if (nextStep === '62') {
                            window.location.replace('/calendar?s=' + nextStep + '&m=2&n=done-64');
                        } else {
                            window.location.replace('/calendar?s=' + nextStep + '&m=1&n=62-64');
                        }
                    }, 500);
                }
            }
        }

        if (multiEventMax !== null) {
            var serviceID = parseInt(new URLSearchParams(new URL(window.location.href)).get('s'));
            for (var i in multiBookings) {
                if (multiBookings[i].service_id === serviceID) numBookings++;
            }
            if (numBookings === parseInt(multiEventMax)) {
                multiEventNextStep();
            } else {
                // Highlight the event button, and add it to the multiBookings array
                var button = document.getElementById(event.id + 'b');
                button.style.background = 'green';
                multiBookings.push(event);
                numBookings++;

                console.log(numBookings + ',' + parseInt(multiEventMax));

                // If this event was the last, go to the next step
                if (numBookings === parseInt(multiEventMax)) multiEventNextStep();
            }
        } else {
            // Add to cart button to add to the popup
            // Add an add to cart button to the popup, or delete if managed
            var addBtn = document.createElement('button');
            addBtn.id = 'addBtn';
            addBtn.onclick = () => {
                document.getElementById('popup-footer').removeChild(addBtn);
                addToCart(event, true);
                var button = document.getElementById(event.id + 'b');
                if (button) {
                    button.style.background = 'green';
                    button.disabled = true;
                }
            };
            addBtn.className = 'btn btn-primary';
            addBtn.style.float = 'left';
            addBtn.innerHTML = 'Add to Cart';

            setEventContent(event, [addBtn]);
            togglePopup(true);
        }
    }

    render() {
        return (
            <div id="calendar">
                <div id="calendar-control" className="calendar-control">
                    <button id="prevBtn" className="btn btn-light" onClick={() => this.changeWeek(false)}>Previous</button>
                    <h1>{monthNames[this.state.currentDate.getMonth()]}</h1>
                    <button id="nextBtn" className="btn btn-light" onClick={() => this.changeWeek(true)}>Next</button>
                </div>
                <div id="week" className="week" style={{minHeight: document.documentElement.clientHeight + 'px'}}>
                    {this.state.days}
                </div>
            </div>
        )
    }
}
