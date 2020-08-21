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
        }, () => {
            this.updateWeek();
        });
    }

    updateWeek() {
        document.getElementById('calendar').style.opacity = 0;
        $.post(server + '/api/getEventManagerEvents', { date: this.state.currentDate.getTime() }, result => {
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
                days.push(<Day key={uuid()} events={events} date={date.getTime()} eventHandler={this.handleEventClick} managed={true} />);
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
                <div id="week" className="week" style={{height: '82vh'}}>
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
