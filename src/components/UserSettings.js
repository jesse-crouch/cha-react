import React, { Component } from 'react'
import { date } from '../stringDate';
import server from '../fetchServer';
import { togglePopup, setPopupContent } from './popupMethods';
import $ from 'jquery';

export default class UserSettings extends Component {
    constructor(props) {
        super();
    }

    componentDidMount() {
        var memberSelect = document.getElementById('membershipSelect');
        var memberExpiryField = document.getElementById('membershipExpiryField');
        var updateBtn = document.getElementById('updateBtn');
        var deleteBtn = document.getElementById('deleteBtn');
        
        if (this.props.user.membership === null) {
            memberExpiryField.value = '';
            this.props.user.membership = 0;
        } else {
            deleteBtn.style.display = '';
            memberExpiryField.value = date(new Date(this.props.user.membership_expiry));
        }
        memberSelect.selectedIndex = this.props.user.membership;

        memberSelect.addEventListener('change', () => {
            if (memberSelect.selectedIndex !== this.props.user.membership) {
                updateBtn.style.display = '';
            } else {
                updateBtn.style.display = 'none';
            }
        });
        memberExpiryField.addEventListener('input', () => {
            var dateString = date(new Date(this.props.user.membership_expiry)).toString();
            if (memberExpiryField.value !== dateString) {
                updateBtn.style.display = '';
            } else {
                updateBtn.style.display = 'none';
            }
        });
        updateBtn.addEventListener('click', () => {
            var membership = memberSelect.selectedIndex;
            if (memberExpiryField.value.length === 0) {
                memberExpiryField.style.border = '1px solid red';
            } else {
                var dateInfo = memberExpiryField.value.split('/');
                var expiry = new Date(parseInt(dateInfo[2]), parseInt(dateInfo[1]), parseInt(dateInfo[0]), new Date().getUTCHours(), new Date().getUTCMinutes());
                var monthsToAdd = 0;
                switch (membership) {
                    case 1:
                        monthsToAdd = 1;
                        break;
                    case 2:
                        monthsToAdd = 6;
                        break;
                    case 3:
                        monthsToAdd = 12;
                        break;
                    default:
                        monthsToAdd = 0;
                        break;
                };
                expiry.setMonth(expiry.getMonth() + (monthsToAdd-1));

                $.post(server + '/api/updateMembership', { id: this.props.user.id, membership: membership, expiry: expiry.getTime()/1000 }, result => {
                    if (result.error) {
                        togglePopup(false);
                        setPopupContent('Error', result.error);
                        togglePopup(true);
                    } else {
                        togglePopup(false);
                        setPopupContent('Success', 'Membership updated, refreshing...');
                        togglePopup(true);
                        setTimeout(() => {
                            window.location.reload();
                        }, 3000);
                    }
                });
            }
        });
        deleteBtn.addEventListener('click', () => {
            if (window.confirm('Are you sure?')) {
                $.post(server + '/api/removeMembership', { id: this.props.user.id }, result => {
                    if (result.error) {
                        togglePopup(false);
                        setPopupContent('Error', result.error);
                        togglePopup(true);
                    } else {
                        togglePopup(false);
                        setPopupContent('Success', 'Membership removed, refreshing...');
                        togglePopup(true);
                        setTimeout(() => {
                            window.location.reload();
                        }, 3000);
                    }
                })
            }
        })
    }

    render() {
        return (
            <div>
                <div className="form-row">
                    <div className="form-group col-md-6">
                        <label>Membership</label>
                        <select id="membershipSelect">
                            <option>Select a Membership</option>
                            <option>Monthly</option>
                            <option>6 Months</option>
                            <option>Yearly</option>
                        </select>
                    </div>
                    <div className="form-group col-md-6">
                        <label>Expires On (DD/MM/YYYY):</label>
                        <input id="membershipExpiryField"></input>
                    </div>
                </div>
                <button className="btn btn-primary" id="updateBtn" style={{display: 'none'}}>Update</button>
                <button className='btn btn-danger' id="deleteBtn" style={{display: 'none'}}>Remove Membership</button>
            </div>
        )
    }
}
