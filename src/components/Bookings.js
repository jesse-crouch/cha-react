import React, { Component } from 'react';
import $ from 'jquery';
import server from '../fetchServer';
import {time, date} from '../stringDate';
import Cookies from 'js-cookie';
import { uuid } from 'uuidv4';

export default class Bookings extends Component {
    constructor() {
        super();

        this.state = {
            bookings: null
        };
        this.getBookings = this.getBookings.bind(this);
    }

    handleBack() {
        window.location.replace('/account');
    }

    getBookings() {
        document.getElementById('empty-text').innerHTML = 'Loading...';
        document.getElementById("empty-text").style.display = '';
        document.getElementById('main-table').style.display = 'none';
        setTimeout(() => {
            var date = new Date();
            var period = document.getElementById('periodSelect').selectedIndex;
            if (period === 0) {
                // Last week
                date = new Date().getTime() - (1000*60*60*24*7);
            } else if (period === 1) {
                // Future
                date = 0;
            } else if (period === 2) {
                // Last month
                date = new Date().getTime() - (1000*60*60*24*30);
            } else if (period === 3) {
                // Last 6 months
                date = new Date().getTime() - (1000*60*60*24*30*6);
            } else if (period === 4) {
                // Last year
                date = new Date().getTime() - (1000*60*60*24*365);
            } else {
                // All
                date = 1;
            }
            $.post(server + '/api/getUserBookings', { date: date, token: Cookies.get('token') }, result => {
                if (result.bookings.length > 0) {
                    var bookings = [];
                    document.getElementById("empty-text").style.display = 'none';
                    document.getElementById('main-table').style.display = '';
                    for (var i in result.bookings) {
                        bookings.push(this.bookingToRow(result.bookings[i]));
                    }
                    this.setState({
                        bookings: bookings
                    });
                } else {
                    document.getElementById('empty-text').innerHTML = 'No bookings in this time period';
                }
            });
        }, 1000);
    }

    bookingToRow(booking) {
        var start = new Date(booking.epoch_date*1000);
        var end = new Date(booking.epoch_date*1000);
        end.setUTCMinutes(end.getUTCMinutes() + (60*booking.duration));
        console.log(booking);
        return <tr key={uuid()}>
            <td>{booking.fullServiceName}</td>
            <td>{date(start)}</td>
            <td>{time(start) + ' - ' + time(end)}</td>
            <td>{booking.amount_due}</td>
        </tr>;
    }

    componentDidMount() {
        // Fetch booking results
        this.getBookings();
    }

    render() {
        return (
            <div style={{textAlign: 'center'}}>
                <h3 style={{margin: '1%'}}>Your Bookings</h3>
                <select id="periodSelect" onChange={this.getBookings}>
                    <option>Last Week</option>
                    <option>Future</option>
                    <option>Last Month</option>
                    <option>Last 6 Months</option>
                    <option>Last Year</option>
                    <option>All Bookings</option>
                </select>
                <h5 id="empty-text" style={{margin: '1% 0'}}>No bookings in this time period</h5>
                <table id="main-table" className="table table-striped" style={{margin: '1% auto', width: '80%', display: 'none'}}>
                    <thead className="thead thead-dark">
                        <tr>
                            <th>Service</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody id="booking-table">
                        {this.state.bookings}
                    </tbody>
                </table>
                <button onClick={this.handleBack} className="btn btn-secondary">Back to account</button>
            </div>
        )
    }
}
