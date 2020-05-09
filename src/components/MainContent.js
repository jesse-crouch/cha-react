import React, { Component } from 'react'
import Services from './Services';
import Home from './Home';
import Calendar from './Calendar';
import Checkout from './Checkout';
import Login from './Login';
import Account from './Account';
import EventManager from './EventManager';
import Reception from './Reception';
import Memberships from './Memberships';
import EmployeeLogin from './EmployeeLogin';
import Bookings from './Bookings';
import Register from './Register';
import PersonalInfo from './PersonalInfo';
import EmployeeInfo from './EmployeeInfo';
import Staging from './Staging';

export default class MainContent extends Component {
    componentDidMount() {
        const url = window.location.href;
        if (url.includes('services')) {
            document.getElementById('services-link').className += ' active';
        }
    }

    render() {
        const url = window.location.href.split(window.location.host)[1];
        var content = <Home />;

        if (url === '/services') {
            content = <Services />;
        } else if (url.includes('/calendar')) {
            const calendarID = new URL(window.location.href).searchParams.get('s');
            content = <Calendar id={calendarID} />;
        } else if (url === '/checkout') {
            content = <Checkout />;
        } else if (url === '/login') {
            content = <Login />;
        } else if (url === '/account') {
            content = <Account />;
        } else if (url === '/reception') {
            content = <Reception />;
        } else if (url === '/event-manager') {
            content = <EventManager />;
        } else if (url === '/memberships') {
            content = <Memberships />;
        } else if (url === '/employees') {
            content = <EmployeeLogin />;
        } else if (url === '/bookings') {
            content = <Bookings />;
        } else if (url === '/register') {
            content = <Register />;
        } else if (url === '/personal-info') {
            content = <PersonalInfo />;
        } else if (url === '/employee-info') {
            content = <EmployeeInfo />;
        } else if (url === '/staging') {
            content = <Staging />;
        }

        return (
            <div id="main">
                {content}
            </div>
        );
    }
}

