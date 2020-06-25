import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import server from '../fetchServer'
import { togglePopup, setPopupContent, setReactContent } from './popupMethods';
import $ from 'jquery';
import Cookies from 'js-cookie';
import { uuid } from 'uuidv4';
import { date } from '../stringDate';
import { FaCog } from 'react-icons/fa';
import UserSettings from './UserSettings';
import MembershipInfo from './MembershipInfo';

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
        var join_date = user.join_date != null ?
            date(new Date(user.join_date)) :
            '';
        var display = user.membership === null ? 'none' : '';

        return <tr id={'r-' + user.id} key={uuid()}>
            <td>{user.first_name}</td>
            <td>{user.last_name}</td>
            <td>{user.email}</td>
            <td>{user.phone}</td>
            <td><button className="btn btn-secondary" style={{display: display}} onClick={() => {
                setReactContent('Membership Information', <MembershipInfo user={user} />);
                togglePopup(true);
            }}>Membership</button></td>
            <td>{join_date}</td>
            <td><button className='btn btn-outline-secondary' onClick={() => {
                setReactContent('User Settings', <UserSettings user={user} />);
                togglePopup(true);
                document.getElementById('popup').style.width = '65%';
            }}><FaCog /></button></td>
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
                            <th>Registered On</th>
                            <th>Settings</th>
                        </tr>
                    </thead>
                    <tbody id="userTable"></tbody>
                </table>
            </div>
        )
    }
}
