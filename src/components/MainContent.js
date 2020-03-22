import React, { Component } from 'react'
import Services from './Services';
import Home from './Home';
import Calendar from './Calendar';
import Checkout from './Checkout';
import Login from './Login';
import Account from './Account';
import EventManager from './EventManager';

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
        } else if (url.includes('checkout')) {
            return (
                <div id="main">
                    <Checkout />
                </div>
            );
        } else if (url.includes('login')) {
            return (
                <div id="main">
                    <Login />
                </div>
            );
        } else if (url.includes('account')) {
            return (
                <div id="main">
                    <Account />
                </div>
            );
        } else if (url.includes('event-manager')) {
            return (
                <div id="main">
                    <EventManager />
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

