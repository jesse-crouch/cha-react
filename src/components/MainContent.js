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
            return(
                <div id="main">
                    <Services />
                </div>
            );
        } else if (url.includes('calendar')) {
            const calendarID = new URL(url).searchParams.get('s');
            return(
                <div id="main">
                    <Calendar id={calendarID} />
                </div>
            );
        } else {
            return(
                <div id="main">
                    <Home />
                </div>
            );
        }
    }
}
