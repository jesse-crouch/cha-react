import React, { Component } from 'react'
import server from '../fetchServer';
import Cookies from 'js-cookie';
import $ from 'jquery';
import { FaUserCircle, FaCalendarAlt, FaInfoCircle, FaBriefcase, FaUser, FaDollarSign, FaIdCard, FaFileInvoiceDollar } from 'react-icons/fa';
import UserAction from './UserAction';
import {uuid} from 'uuidv4';

export default class Account extends Component {
    constructor() {
        super();

        this.state = {
            payload: null,
            fullName: null,
            actions: null,
            welcome: true
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
                    link="users-info"
                />,
                <UserAction
                    key={uuid()}
                    title="View Sales Data"
                    description="View your to-date sales and tax data"
                    icon={<FaDollarSign />}
                    link="sales-info"
                />,
                <UserAction
                    key={uuid()}
                    title="View Pending Sales"
                    description="View and update incoming sales for the day"
                    icon={<FaFileInvoiceDollar />}
                    link="pending-sales"
                />,
		        <UserAction
                    key={uuid()}
                    title="Reception"
                    description="View bookings, and facilitate payments"
                    icon={<FaCalendarAlt />}
                    link="reception"
                />,
                <UserAction
                    key={uuid()}
                    title="View Schedule Data"
                    description="View scheduled classes within a certain timeframe"
                    icon={<FaCalendarAlt />}
                    link="schedule-info"
                />
            ];
            var receptionActions = [
                <UserAction
                    key={uuid()}
                    title="Reception"
                    description="View bookings, and facilitate payments"
                    icon={<FaCalendarAlt />}
                    link="reception"
                />,
                <UserAction
                    key={uuid()}
                    title="Drop-In"
                    description="Book and facilitate payment for a customer who hasn't booked online"
                    icon={<FaDollarSign />}
                    link="drop-in"
                />,
                <UserAction
                    key={uuid()}
                    title="Clock In/Out"
                    description="Open the clock in/out page"
                    icon={<FaIdCard />}
                    link="clocking"
                />
            ];
            
            $.post(server + '/api/getPayload', { token: Cookies.get('token') }, result => {
                var firstName = result.payload.first_name.charAt(0).toUpperCase() + result.payload.first_name.substr(1);
                var lastName = result.payload.last_name.charAt(0).toUpperCase() + result.payload.last_name.substr(1);
                var activeActions = null, welcome = true;
                if (result.payload.id === 2) {
                    activeActions = receptionActions;
                    welcome = false;
                } else if (result.payload.admin) {
                    activeActions = adminActions;
                    welcome = false;
                } else {
                    activeActions = actions;
                }
                this.setState({
                    payload: result.payload,
                    fullName: firstName + ' ' + lastName,
                    actions: activeActions,
                    welcome: welcome
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
                <div id="account-content" style={{display: "none", textAlign: "center", marginBottom: "1%"}}>
                    <FaUserCircle style={{fontSize: "6em", margin: "1%"}} />
                    <h3>{this.state.welcome ? 'Welcome, ' + this.state.fullName : this.state.fullName}</h3>
                    <p>{this.state.welcome ? 'Here you can view and make changes to your account with Cosgrove Hockey Academy' : ''}</p>
                    <div id="user-actions" className="user-actions card-deck">
                        {this.state.actions}
                    </div>
                </div>
            </div>
        )
    }
}
