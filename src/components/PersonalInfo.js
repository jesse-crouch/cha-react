import React, { Component } from 'react'
import server from '../fetchServer'
import Cookies from 'js-cookie';
import $ from 'jquery';
import { setPopupContent, togglePopup, setHTMLContent } from './popupMethods';
import { date } from '../stringDate';

var defaultFName = '', defaultLName = '', defaultEmail = '', defaultPhone = '';
var children = [];

export default class PersonalInfo extends Component {
    constructor() {
        super();

        this.toggleChangePass = this.toggleChangePass.bind(this);
    }

    changeInfo() {
        $.post(server + '/api/changeInfo', {
            token: Cookies.get('token'),
            first_name: document.getElementById('firstNameInput').value,
            last_name: document.getElementById('lastNameInput').value,
            email: document.getElementById('emailInput').value,
            phone: document.getElementById('phoneInput').value
        }, result => {
            if (result.error) {
                setPopupContent('Error', 'There was a problem changing your inforation. Please try again.');
                togglePopup(true);
            } else {
                // Re-establish the token cookie to reflect the new payload
                $.post(server + '/api/refreshToken', { token: Cookies.get('token') }, refresh => {
                    Cookies.set('token', refresh.token);
                    setPopupContent('Success', 'Your changes have been applied.');
                    togglePopup(true);
                    document.getElementById('changeBtn').style.display = 'none';
                });
            }
        });
    }

    changePassword() {
        var oldPass = document.getElementById('passInput').value;
        var newPass = document.getElementById('newPassInput').value;
        if (oldPass.length === 0 || newPass.length === 0) {
            togglePopup(false);
            setTimeout(() => {
                setPopupContent('Error', 'Password fields cannot be empty');
                togglePopup(true);
            }, 500);
        } else {
            $.post(server + '/api/changePassword', {
                token: Cookies.get('token'),
                oldPass: oldPass,
                newPass: newPass
            }, result => {
                if (result.error) {
                    togglePopup(false);
                    setTimeout(() => {
                        setPopupContent('Error', result.error);
                        togglePopup(true);
                    }, 500);
                } else {
                    togglePopup(false);
                    setTimeout(() => {
                        setPopupContent('Success', 'Your password has been changed.');
                        togglePopup(true);
                    }, 500);
                }
            });
        }
    }

    toggleChangePass() {
        var passwordContent = <div>
            <div className="form-group">
                <label>Current Password</label>
                <input className="form-control" id="passInput" />
            </div>
            <div className="form-group">
                <label>New Password</label>
                <input className="form-control" id="newPassInput" />
            </div>
            <div className="form-group text-center">
                <button id="changePassBtn" className="btn btn-primary" onClick={this.changePassword}>Set Password</button>
            </div>
        </div>;
        setHTMLContent('Change Password', passwordContent);
        togglePopup(true);
    }

    fieldChanged(field) {
        var value = '';
        if (field === 'f_name') {
            value = document.getElementById('firstNameInput').value;
            document.getElementById('changeBtn').style.display = value !== defaultFName ? '' : 'none';
        } else if (field === 'l_name') {
            value = document.getElementById('lastNameInput').value;
            document.getElementById('changeBtn').style.display = value !== defaultLName ? '' : 'none';
        } else if (field === 'email') {
            value = document.getElementById('emailInput').value;
            document.getElementById('changeBtn').style.display = value !== defaultEmail ? '' : 'none';
        } else {
            value = document.getElementById('phoneInput').value;
            document.getElementById('changeBtn').style.display = value !== defaultPhone ? '' : 'none';
        }
    }

    formatName(name) {
        return name.substr(0,1).toUpperCase() + name.substr(1);
    }

    handleAddRemoveMember(event, user_id, member) {
        if (event.target.innerHTML === '+') {
            // Add member
            if (member.first_name.length > 0) {
                if (member.last_name.length > 0) {
                    $.post(server + '/api/addSubUser', { id: user_id, member: JSON.stringify(member) }, result => {
                        if (result.error) {
                            setPopupContent('Error', result.error);
                            togglePopup(true);
                        } else {
                            window.location.reload();
                        }
                    });
                } else {
                    event.target.parentNode.parentNode.children[1].firstChild.style.border = '1px solid red';
                }
            } else {
                event.target.parentNode.parentNode.children[0].firstChild.style.border = '1px solid red';
            }
        } else {
            if (window.confirm('Are you sure?')) {
                var member = {
                    id: parseInt(event.target.getAttribute('member_id')),
                    first_name: event.target.getAttribute('member_name'),
                    membership: parseInt(event.target.getAttribute('member_membership'))
                };
                if (!isNaN(member.membership)) {
                    if (window.confirm('This will cancel the membership associated with ' + this.formatName(member.first_name) + '.')) {
                        $.post(server + '/api/removeSubUser', { id: member.id }, result => {
                            if (result.error) {
                                setPopupContent('Error', result.error);
                                togglePopup(true);
                            } else {
                                window.location.reload();
                            }
                        });
                    }
                } else {
                    $.post(server + '/api/removeSubUser', { id: member.id }, result => {
                        if (result.error) {
                            setPopupContent('Error', result.error);
                            togglePopup(true);
                        } else {
                            window.location.reload();
                        }
                    });
                }
            }
        }
    }

    handleAddRemoveChild(event, user) {
        console.log(event.target.innerHTML);
        if (event.target.innerHTML === '+') {
            // Check for valid input, and add child to account
            var input = event.target.parentNode.parentNode.children[0];
            if (input.value.length === 0) {
                input.style.border = '1px solid red';
            } else if (!input.value.includes(' ')) {
                input.style.border = '1px solid red';
                input.value = '';
                input.placeholder = 'Please include a last name';
                input.style.color = 'red';
                setTimeout(() => { input.style.color = 'black'; }, 1000);
            } else {
                $.post(server + '/api/addChild', {
                    id: user.id,
                    child: input.value
                }, result => {
                    if (result.error) {
                        setPopupContent('Error', result.error);
                        togglePopup(true);
                    } else {
                        // Replace the current token with a new payload
                        Cookies.set('token', result.token, { expires: 0.5 });
                        window.location.reload();
                    }
                });
            }
        } else {
            // Remove this child from the account, including any memberships tied to it
            var decision = window.confirm('Are you sure?');
            if (decision) {
                var child = user.children[event.target.parentNode.parentNode.children[1].getAttribute('i')];
                if (child[1] !== null) {
                    var decision2 = window.confirm('This will cancel the membership associated with ' + this.getChildName(child[0])[0]);
                    if (decision2) {
                        $.post(server + '/api/removeChild', {
                            id: user.id,
                            child: child[0],
                            child_membership: child[1],
                            child_expiry: child[2]
                        }, result => {
                            if (result.error) {
                                setPopupContent('Error', result.error);
                                togglePopup(true);
                            } else {
                                // Replace the current token with a new payload
                                Cookies.set('token', result.token, { expires: 0.5 });
                                window.location.reload();
                            }
                        });
                    }
                }
            }            
        }
    }
    
    componentDidMount() {
        if (Cookies.get('token')) {
            // Get user info
            $.post(server + '/api/getPayload', { token: Cookies.get('token') }, result => {
                $.post(server + '/api/getMembers', { id: result.payload.id }, memberResult => {
                    var firstName = result.payload.first_name.charAt(0).toUpperCase() + result.payload.first_name.substr(1);
                    var lastName = result.payload.last_name.charAt(0).toUpperCase() + result.payload.last_name.substr(1);
                    document.getElementById('firstNameInput').value = firstName;
                    document.getElementById('lastNameInput').value = lastName;
                    document.getElementById('emailInput').value = result.payload.email;
                    document.getElementById('phoneInput').value = result.payload.phone;

                    defaultFName = firstName;
                    defaultLName = lastName;
                    defaultEmail = result.payload.email;
                    defaultPhone = result.payload.phone;

                    var membersContainer = document.getElementById('members');
                    for (var i=0; i<memberResult.members.length+1; i++) {
                        var member = memberResult.members[i];
                        var newRow = document.createElement('tr');

                        var firstNameData = document.createElement('td');
                        if (i < memberResult.members.length) {
                            firstNameData.innerHTML = this.formatName(member.first_name);
                        } else {
                            var newMemberInput = document.createElement('input');
                            newMemberInput.placeholder = 'Enter a new person';
                            newMemberInput.style.width = '80%';
                            firstNameData.appendChild(newMemberInput);
                        }

                        var lastNameData = document.createElement('td');
                        if (i < memberResult.members.length) {
                            lastNameData.innerHTML = this.formatName(member.last_name);
                        } else {
                            var newMemberInput = document.createElement('input');
                            newMemberInput.style.width = '80%';
                            lastNameData.appendChild(newMemberInput);
                        }

                        var membershipData = document.createElement('td');
                        if (i < memberResult.members.length) {
                            if (member.membership !== null) {
                                membershipData.innerHTML = member.membership_name;
                            }
                        }

                        var expiryData = document.createElement('td');
                        if (i < memberResult.members.length) {
                            if (member.membership !== null) {
                                expiryData.innerHTML = date(new Date(member.epoch_expiry*1000));
                            }
                        }

                        var actionData = document.createElement('td');
                        var actionBtn = document.createElement('button');
                        if (i < memberResult.members.length) {
                            actionBtn.className = 'btn btn-danger';
                            actionBtn.innerHTML = 'x';
                            actionBtn.setAttribute('member_id', member.id);
                            actionBtn.setAttribute('member_name', member.first_name);
                            actionBtn.setAttribute('member_membership', member.membership);
                            actionBtn.addEventListener('click', (e) => this.handleAddRemoveMember(e, result.payload.id));
                        } else {
                            actionBtn.className = 'btn btn-primary';
                            actionBtn.innerHTML = '+';
                            actionBtn.style.fontSize = '150%';
                            actionBtn.addEventListener('click', (e) => this.handleAddRemoveMember(e, result.payload.id, {
                                first_name: firstNameData.children[0].value,
                                last_name: lastNameData.children[0].value
                            }));
                        }
                        actionData.appendChild(actionBtn);

                        newRow.appendChild(firstNameData);
                        newRow.appendChild(lastNameData);
                        newRow.appendChild(membershipData);
                        newRow.appendChild(expiryData);
                        newRow.appendChild(actionData);
                        membersContainer.appendChild(newRow);

                        /*var newGroup = document.createElement('tr');

                        var newChild = document.createElement('td');
                        if (i < memberResult.members.length) {
                            //
                        } else {
                            newChild = document.createElement('input');
                            newChild.placeholder = 'Enter a new name';
                            newChild.style.width = '60%';
                        }

                        var newMember = document.createElement('td');
                        if (i < result.payload.children.length) {
                            if (result.payload.children[i][1] !== null) {
                                //newMember.innerHTML = memberResult.memberships[result.payload.children[i][1]].name;
                                //newMember.setAttribute('i', i);
                            }
                        }

                        var newDate = document.createElement('td');
                        if (i < result.payload.children.length) {
                            if (result.payload.children[i][2] !== null) {
                                //newDate.innerHTML = date(new Date(parseInt(result.payload.children[i][2]*1000)));
                            }
                        }

                        var append = document.createElement('td');
                        var removeBtn = document.createElement('button');
                        if (i < result.payload.children.length) {
                            removeBtn.innerHTML = 'x';
                            removeBtn.className = 'btn btn-danger';
                            removeBtn.addEventListener('click', (e) => this.handleAddRemoveChild(e, result.payload));
                        } else {
                            removeBtn.innerHTML = '+';
                            removeBtn.className = 'btn btn-primary';
                            removeBtn.addEventListener('click', (e) => this.handleAddRemoveChild(e, result.payload));
                        }

                        append.appendChild(removeBtn);
                        newGroup.appendChild(newChild);
                        newGroup.appendChild(newMember);
                        newGroup.appendChild(newDate);
                        newGroup.appendChild(append);
                        membersContainer.appendChild(newGroup);*/
                    }
                });
            });
        } else {
            window.location.replace('/login');
        }
    }

    render() {
        return (
            <div style={{width: "60%", margin: "1em auto"}}>
                <h4 style={{borderBottom: "1px solid #cccccc", marginBottom: "1em", textAlign: 'center'}}>Personal Info</h4>
                <div className="form-group">
                    <label>First Name</label>
                    <input className="form-control" id="firstNameInput" onChange={() => this.fieldChanged('f_name')} />
                </div>
                <div className="form-group">
                    <label>Last Name</label>
                    <input className="form-control" id="lastNameInput" onChange={() => this.fieldChanged('l_name')} />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input className="form-control" id="emailInput" onChange={() => this.fieldChanged('email')} />
                </div>
                <div className="form-group">
                    <label>Phone Number</label>
                    <input className="form-control" id="phoneInput" onChange={() => this.fieldChanged('phone')} />
                </div>
                <div className="form-group">
                    <label>Children</label>
                    <table className="table table-striped text-center">
                        <thead className="thead thead-dark">
                            <tr>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Membership</th>
                                <th>Expires On</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody id="members"></tbody>
                    </table>
                </div>
                <div className="text-center">
                    <button className="btn btn-secondary" style={{marginBottom: '2%'}} onClick={this.toggleChangePass}>Change Password</button>
                    <button id="changeBtn" style={{display: 'none', marginLeft: '1%'}} className="btn btn-primary" onClick={this.changeInfo}>Save Changes</button>
                </div>
            </div>
        )
    }
}
