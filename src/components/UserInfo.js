import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import server from '../fetchServer'
import { togglePopup, setPopupContent } from './popupMethods';
import $ from 'jquery';
import Cookies from 'js-cookie';
import { uuid } from 'uuidv4';
import { date } from '../stringDate';

export default class UserInfo extends Component {
    componentDidMount() {
        $.post(server + '/api/getAllUsers', { token: Cookies.get('token') }, result => {
            if (result.error) {
                setPopupContent('Error', result.error);
                togglePopup(true);
            } else {
                var users = [];
                for (var i in result.users) {
                    users.push(this.newRow(result.users[i]));
                }
                ReactDOM.render(users, document.getElementById('userTable'));
            }
        });
    }

    newRow(user) {
        var membership = '';
        if (user.membership === 1) {
            membership = 'Monthly';
        } else if (user.membership === 2) {
            membership = '6 Months';
        } else if (user.membership === 3) {
            membership = 'Annual';
        } else {
            membership = '';
        }

        var expiry = user.membership_expiry != null ?
            date(new Date(user.membership_expiry)) :
            '';
        var join_date = user.join_date != null ?
            date(new Date(user.join_date)) :
            '';

        return <tr id={'r-' + user.id} key={uuid()}>
            <td>{user.first_name}</td>
            <td>{user.last_name}</td>
            <td>{user.email}</td>
            <td>{user.phone}</td>
            <td>{membership}</td>
            <td>{expiry}</td>
            <td>{join_date}</td>
            <td>{user.service}</td>
        </tr>;
    }

    render() {
        return (
            <div className="text-center">
                <h3 style={{margin: "1em"}}>Users Information</h3>
                <table className="table table-striped w-75" style={{margin: "0 auto"}}>
                    <thead className="thead thead-dark">
                        <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Membership</th>
                            <th>Membership Expires</th>
                            <th>Registered On</th>
                            <th>Most Bought Service</th>
                        </tr>
                    </thead>
                    <tbody id="userTable"></tbody>
                </table>
            </div>
        )
    }
}
