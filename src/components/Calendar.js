import React, { Component } from 'react'
import server from '../fetchServer';
import $ from 'jquery';
import Day from './Day';
import { uuid } from 'uuidv4';
import { togglePopup, setPopupContent, setEventContent } from './popupMethods';
import monthNames from '../months';
import { addToCart } from './cartMethods';

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
            date: this.state.currentDate.getTime()/1000
        }, (result) => {
            console.log(result);
            if (result.error) {
                setPopupContent('No Classes', result.error);
                togglePopup(true);
                setTimeout(() => {
                    window.location.replace('/services');
                }, 3000);
            } else {
                console.log(result);
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

                for (var i=0; i<7; i++) {
                    var events = [];
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
                                    result.events[j].name = 'Unavailabe';
                                    events.push(result.events[j]);
                                }
                            }
                            if (!conflict) events.push(result.events[j]);
                        }
                    }

                    if (result.service_info.type === 'open') {
                        // Adding ghost events for open services
                        // Business hours - Weekdays (4 PM - 9 PM), Weekends (8 AM - 9 PM)
                        const open_time = (i === 0 || i === 6) ? 12 : 9;
                        const close_time = (i === 0 || i === 6) ? 17 : 21;

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
                                    // Conflict
                                    conflict = true;
                                    event.name = 'Unavailable';
                                    events.push(event);
                                    console.log(event);
                                }
                            }

                            trackDate.setMinutes(trackDate.getMinutes() + (60*event.duration));
                            // Check that this event won't exceed the closing time
                            if (trackDate.getUTCHours() < close_time && !conflict) {
                                events.push(event);
                            }
                            eventNum++;
                        }
                    }

                    days.push(<Day key={uuid()} events={events} date={date.getTime()} eventHandler={this.handleEventClick} managed={false} />);
                    date.setDate(date.getDate() + 1);
                }
                console.log(events);
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
