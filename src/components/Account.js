import React, { Component } from 'react'
import server from '../fetchServer';
import Cookies from 'js-cookie';
import $ from 'jquery';
import { FaUserCircle, FaCalendarAlt, FaInfoCircle, FaBriefcase, FaUser, FaDollarSign } from 'react-icons/fa';
import UserAction from './UserAction';
import {uuid} from 'uuidv4';

export default class Account extends Component {
    constructor() {
        super();

        this.state = {
            payload: null,
            fullName: null,
            actions: null
        };
    }

    componentDidMount() {
        if (Cookies.get('token') !== null) {
            // Define user actions
            var actions = [
                <UserAction
                    key={uuid()}
                    title="View Bookings"
                    description="View your current and past bookings"
                    icon={<FaCalendarAlt />}
                    link="bookings"
                />,
                <UserAction
                    key={uuid()}
                    title="Personal Information"
                    description="Edit or view the information stored by Cosgrove Hockey Academy"
                    icon={<FaInfoCircle />}
                    link="personal-info"
                />
            ];
            var adminActions = [
                <UserAction
                    key={uuid()}
                    title="Event Manager"
                    description="View or edit your current class schedules and events"
                    icon={<FaCalendarAlt />}
                    link="event-manager"
                />,
                <UserAction
                    key={uuid()}
                    title="Employee Information"
                    description="View information about employees or add/remove them"
                    icon={<FaBriefcase />}
                    link="employee-info"
                />,
                <UserAction
                    key={uuid()}
                    title="View Users"
                    description="View all of your current registered and unregistered users"
                    icon={<FaUser />}
                    link="all-users"
                />,
                <UserAction
                    key={uuid()}
                    title="View Sales Data"
                    description="View your to-date sales and tax data"
                    icon={<FaDollarSign />}
                    link="sales"
                />
            ];
            
            $.post(server + '/api/getPayload', { token: Cookies.get('token') }, result => {
                var firstName = result.payload.first_name.charAt(0).toUpperCase() + result.payload.first_name.substr(1);
                var lastName = result.payload.last_name.charAt(0).toUpperCase() + result.payload.last_name.substr(1);
                this.setState({
                    payload: result.payload,
                    fullName: firstName + ' ' + lastName,
                    actions: result.payload.admin ? adminActions : actions
                }, () => {
                    document.getElementById('loading-text').style.display = 'none';
                    document.getElementById('account-content').style.display = '';
                });
            });
        } else {
            window.location.replace('/');
        }
    }

    render() {
        return (
            <div>
                <h3 id="loading-text">Loading...</h3>
                <div id="account-content" style={{display: "none", textAlign: "center"}}>
                    <FaUserCircle style={{fontSize: "6em", margin: "1%"}} />
                    <h3>Welcome, {this.state.fullName}</h3>
                    <p>Here you can view and make changes to your account with Cosgrove Hockey Academy</p>
                    <div id="user-actions" className="user-actions card-deck">
                        {this.state.actions}
                    </div>
                </div>
            </div>
        )
    }
}
