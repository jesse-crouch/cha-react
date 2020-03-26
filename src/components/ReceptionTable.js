import React, { Component } from 'react'
import { time } from '../stringDate';

export default class ReceptionTable extends Component {
    constructor(props) {
        super();

        this.state = {
            bookings: props.bookings
        };
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
            <td>{booking.fullServiceName}</td>
            <td>{time(start) + ' - ' + time(end)}</td>
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
                    </tr>
                </thead>
                <tbody id="reception-body">{bookingRows}</tbody>
            </table>
        )
    }
}
