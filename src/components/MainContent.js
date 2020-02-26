import React, { Component } from 'react'
import Services from './Services';
import Home from './Home';
import Calendar from './Calendar';

export default class MainContent extends Component {
    constructor() {
        super();

        this.state = {
            calendarID: null
        };

        this.setCalendarID = this.setCalendarID.bind(this);
    }

    componentDidMount() {
        const url = window.location.href;
        if (url.includes('services')) {
            document.getElementById('services-link').className += ' active';
        }
    }

    setCalendarID(id) {
        this.setState({
            calendarID: id
        });
    }

    render() {
        const url = window.location.href;

        if (url.includes('services')) {
            return(<Services setCalendarID={this.setCalendarID} />);
        } else if (url.includes('calendar')) {
            return(<Calendar id={this.state.calendarID} />);  
        } else {
            return(<Home />);
        }
    }
}

