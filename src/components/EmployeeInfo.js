import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import server from '../fetchServer';
import $ from 'jquery';
import Cookies from 'js-cookie';
import { uuid } from 'uuidv4';
import { setPopupContent, togglePopup, setHTMLContent } from './popupMethods';
import { FaArrowUp } from 'react-icons/fa';

export default class EmployeeInfo extends Component {
    componentDidMount() {
        $.post(server + '/api/getEmployees', { token: Cookies.get('token') }, result => {
            var employees = [], instructors = [];
            for (var i in result.employees) {
                employees.push(this.newRow(result.employees[i]));
            }
            for (var j in result.instructors) {
                instructors.push(this.newInstructorRow(result.instructors[j]));
            }
            ReactDOM.render(employees, document.getElementById('employeeTable'));
            ReactDOM.render(instructors, document.getElementById('instructorTable'));
        });
    }

    newRow(employee) {
        var display = employee.instructor ? 'none' : '';
        return <tr id={'r-' + employee.id} key={uuid()}>
            <td>{employee.first_name}</td>
            <td>{employee.last_name}</td>
            <td>{employee.email}</td>
            <td>{employee.phone}</td>
            <td>{employee.pay + (employee.hourly ? '/Hour' : '')}</td>
            <td>{employee.hours}</td>
            <td>{employee.card_id > 0 ? employee.card_id : ''}</td>
            <td><button style={{display: display}} className="btn btn-outline-primary" employee={employee.id} onClick={(e) => this.addInstructor(e)}><FaArrowUp /></button></td>
            <td><button className="btn btn-outline-danger" employee={employee.id} onClick={(e) => this.deleteEmployee(e)}>X</button></td>
        </tr>;
    }

    newInstructorRow(instructor) {
        return <tr id={'ri-' + instructor.id} key={uuid()}>
            <td>{instructor.first_name}</td>
            <td>{instructor.last_name}</td>
            <td><button className="btn btn-outline-danger" instructor={instructor.id} onClick={(e) => this.deleteInstructor(e)}>X</button></td>
        </tr>;
    }

    deleteInstructor(event) {
        var decision = true;//window.confirm('Are you sure?');
        if (decision) {
            var id = parseInt(event.target.getAttribute('instructor'));
            $.post(server + '/api/deleteInstructor', { token: Cookies.get('token'), id: id }, result => {
                if (result.error) {
                    setPopupContent('Error', result.error);
                    togglePopup(true);
                } else {
                    setPopupContent('Deleted', 'Instructor successfully deleted.');
                    togglePopup(true);
                    document.getElementById('ri-' + id).style.display = 'none';
                }
            });
        }
    }

    deleteEmployee(event) {
        var decision = window.confirm('Are you sure?');
        if (decision) {
            var id = parseInt(event.target.getAttribute('employee'));
            $.post(server + '/api/deleteEmployee', { token: Cookies.get('token'), id: id }, result => {
                if (result.error) {
                    setPopupContent('Error', result.error);
                    togglePopup(true);
                } else {
                    setPopupContent('Deleted', 'Employee successfully deleted.');
                    togglePopup(true);
                    document.getElementById('r-' + id).style.display = 'none';
                }
            });
        }
    }

    addInstructor(event) {
        var id = parseInt(event.target.getAttribute('employee'));
        var row = document.getElementById('r-' + id);
        $.post(server + '/api/addInstructor', {
            token: Cookies.get('token'),
            id: id,
            first_name: row.children[0].innerHTML,
            last_name: row.children[1].innerHTML
        }, result => {
            if (result.error) {
                setPopupContent('Error', result.error);
                togglePopup(true);
            } else {
                setPopupContent('Added', 'Employee made into an instructor, refreshing shortly...');
                togglePopup(true);
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        });
    }

    addEmployeePopup() {
        var content = <div>
            <div className="form-row">
                <div className="form-group col-md-6">
                    <label>First Name</label>
                    <input className="form-control" id="firstNameField" />
                </div>
                <div className="form-group col-md-6">
                    <label>Last Name</label>
                    <input className="form-control" id="lastNameField" />
                </div>
            </div>
            <div className="form-row">
                <div className="form-group col-md-6">
                    <label>Email</label>
                    <input className="form-control" id="emailField" />
                </div>
                <div className="form-group col-md-6">
                    <label>Phone</label>
                    <input className="form-control" id="phoneField" />
                </div>
            </div>
            <div className="form-row">
                <div className="form-group col-md-6">
                    <label>Pay</label>
                    <input className="form-control" id="payField" />
                </div>
                <div className="form-group col-md-6">
                    <label>Pay Type</label>
                    <select className="form-control" id="payTypeSelect">
                        <option>Hourly</option>
                        <option>Salaried</option>
                    </select>
                </div>
            </div>
            <div className="form-row">
                <div className="form-group col-md-6">
                    <label>Instructor?</label>
                    <input className="form-control" type="checkbox" id="instructorCheck" />
                </div>
                <div className="form-group col-md-6">
                    <label>Card ID</label>
                    <input className="form-control" id="cardIDField" placeholder="Leave blank for no card" />
                </div>
            </div>
        </div>;

        setHTMLContent('New Employee', content, '', false, [() => {
            var cardID = document.getElementById('cardIDField').value;
            cardID = cardID === '' ? 0 : parseInt(cardID);

            $.post(server + '/api/newEmployee', {
                first_name: document.getElementById('firstNameField').value,
                last_name: document.getElementById('lastNameField').value,
                email: document.getElementById('emailField').value,
                phone: document.getElementById('phoneField').value,
                pay: parseInt(document.getElementById('payField').value),
                cardID: cardID,
                hourly: document.getElementById('payTypeSelect').selectedIndex === 0,
                instructor: document.getElementById('instructorCheck').checked,
                token: Cookies.get('token')
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
                        setPopupContent('Success', 'New employee added, refreshing shortly...');
                        togglePopup(true);
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    }, 500);
                }
            });
        }, 'Add Employee']);
        togglePopup(true);
    }

    render() {
        return (
            <div className="text-center">
                <h3 style={{margin: "1em"}}>Employee Information</h3>
                <div className="form-group">
                    <button className="btn btn-primary" onClick={this.addEmployeePopup}>Add Employee</button>
                </div>
                <table className="table table-striped w-75" style={{margin: "0 auto"}}>
                    <thead className="thead thead-dark">
                        <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Pay</th>
                            <th>Hours To Date</th>
                            <th>Card ID</th>
                            <th>Make Instructor</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody id="employeeTable"></tbody>
                </table>
                <h3 style={{margin: "1em"}}>Instructors</h3>
                <table className="table table-striped w-75" style={{margin: "0 auto 4em auto"}}>
                    <thead className="thead thead-dark">
                        <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody id="instructorTable"></tbody>
                </table>
            </div>
        )
    }
}
