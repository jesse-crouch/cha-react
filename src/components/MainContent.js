import React, { Component } from 'react'
import Services from './Services';
import Home from './Home';
import Calendar from './Calendar';

export default class MainContent extends Component {
    componentDidMount() {
        const url = window.location.href;
        if (url.includes('services')) {
            document.getElementById('services-link').className += ' active';
        }
    }

    render() {
        const url = window.location.href;

        if (url.includes('services')) {
            return(<Services setCalendarID={this.setCalendarID} />);
        } else if (url.includes('calendar')) {
            return(<Calendar />);  
        } else {
            return(<Home />);
        }
    }
}

