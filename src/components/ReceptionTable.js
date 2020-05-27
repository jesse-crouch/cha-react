import React, { Component } from 'react'
import { time } from '../stringDate';
import server from '../fetchServer';
import { setPopupContent, togglePopup } from './popupMethods';
import $ from 'jquery';

export default class ReceptionTable extends Component {
    constructor(props) {
        super();

        this.state = {
            bookings: props.bookings
        };
    }

    handleDelete(id) {
        if (window.confirm('Are you sure?')) {
            $.post(server + '/api/deleteBooking', { id: id }, result => {
                if (!result.error) {
                    togglePopup(false);
                    setPopupContent('Success', 'Booking deleted, refreshing shortly...');
                    togglePopup(true);
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    togglePopup(false);
                    setPopupContent('Error', result.error);
                    togglePopup(true);
                }
            });
        }
    }

    handlePaid(event, id) {
        event.target.parentElement.parentElement.children[8].innerHTML = '0';
        $.post(server + '/api/updatePaidBooking', { id: id });
    }

    bookingToRow(booking) {
        var start = new Date(booking.epoch_date*1000);
        var end = new Date(booking.epoch_date*1000);
        end.setUTCMinutes(end.getUTCMinutes() + (60*booking.duration));

        return <tr>
            <td>{booking.first_name}</td>
            <td>{booking.last_name}</td>
            <td>{booking.email}</td>
            <td>{booking.phone}</td>
            <td>{booking.child_first_name}</td>
            <td>{booking.child_last_name}</td>
            <td>{booking.name}</td>
            <td>{start.toLocaleDateString() + ' at ' + time(start) + ' - ' + time(end)}</td>
            <td>{booking.amount_due}</td>
            <td><button className="btn btn-primary" onClick={(e) => this.handlePaid(e, booking.id)}>Is Paid?</button></td>
            <td><button className="btn btn-danger" onClick={() => this.handleDelete(booking.id)}>Delete</button></td>
        </tr>;
    }

    render() {
        var bookingRows = this.state.bookings.map(booking => {
            return this.bookingToRow(booking);
        });

        return (
            <table className="table table-striped">
                <thead className="thead thead-dark">
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Child First Name</th>
                        <th>Child Last Name</th>
                        <th>Service</th>
                        <th>Time</th>
                        <th>Amount Due</th>
                        <th>Is Paid?</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody id="reception-body">{bookingRows}</tbody>
            </table>
        )
    }
}
