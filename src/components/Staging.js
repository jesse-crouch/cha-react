import React, { Component } from 'react'
import { setReactContent, togglePopup, setPopupContent } from './popupMethods'
import server from '../fetchServer';
import $ from 'jquery';

var waiver = false;

export default class Staging extends Component {
    constructor() {
        super();

        this.openWaiver = this.openWaiver.bind(this);
    }

    openWaiver() {
        setReactContent('Waiver', <div>
            <h3>Cosgrove Hockey Academy Waiver and Release of Liability Form</h3>
            <div className="waiver-body">
                <p>I HEREBY ASSUME ALL OF THE RISKS OF PARTICIPATING IN ANY/ALL ACTIVITIES ASSOCIATED WITH THIS EVENT, including by way of example and not limitation, any risks that may arise from negligence or carelessness on the part of the persons or entities being released, from dangerous or defective equipment or property owned, maintained, or controlled by them, or because of their possible liability without fault.</p>
                <p>I certify that I am physically fit, have sufficiently prepared or trained for participation in these activities, and have not been advised to not participate by a qualified medical professional. I certify that there are no health-related reasons or problems which preclude my participation in these activities.</p>
                <p>I acknowledge that this Accident Waiver and Release of Liability Form will be used by the event holders, sponsors, and organizers of these activities in which I may participate, and that it will govern my actions and responsibilities at said activities.</p>
                <p>In consideration of my application and permitting me to participate in these activites, I hereby take action for myself, my executors, administrators, heirs, next of kin, successors, and assigns as follows:</p>
                <p>(A) I WAIVE, RELEASE, AND DISCHARGE from any and all liability, including but not limited to, liability arising from the negligence or fault of the entities or persons released, for my death, disability, personal injury, property damage, property theft, or actions of any kind which may hereafter occur to me including my traveling to and from these activities, THE FOLLOWING ENTITIES OR PERSONS: Cosgrove Hockey Academy, and/or their directors, officers, employees, volunteers, representatives, and agents, and the activity holders, sponsors, and volunteers;</p>
                <p>(B) INDEMNIFY, HOLD HARMLESS, AND PROMISE NOT TO SUE the entities or persons mentioned in this paragraph from any and all liabilities or claims made as a result of participation in these activities, whether caused by the negligence of release or otherwise.</p>
                <p>I acknowledge that Cosgrove Hockey Academy and their directors, officers, volunteers, representatives, and agents are NOT responsible for the errors, omissions, acts, or failures to act of any party or entity conducting a specific activity on their behalf.</p>
                <p>I acknowledge that these activities may involve a test of a person's physical and mental limits and carries with it the potential for death, serious injury, and property loss. The risks include, but are not limited to, those caused by terrain, facilities, temperature, weather, condition of participants, equipment, vehicular traffic, lack of hydration, and actions of other people including, but not limited to, participants, volunteers, monitors, and/or producers of the activity. These risks are not only inherent to participants, but are also present for volunteers.</p>
                <p>I hereby consent to receive medical treatment which may be deemed advisable in the event of injury, accident, and/or illness during these activities.</p>
                <p>I understand while participating in these activities, I may be photographed. I agree to allow my photo, video, or film likeness to be used for any legitimate purpose by the activity holders, producers, sponsors, organizers, and assigns.</p>
                <p>The Accident Waiver and Release of Liability Form shall be construed broadly to provide a release and waiver to the maximum extent permissible under applicable law.</p>
            </div>
            <div className="form-group">
                <label>I CERTIFY THAT I HAVE READ THIS DOCUMENT AND I FULLY UNDERSTAND ITS CONTENT. I AM AWARE THAT THIS IS A RELEASE OF LIABILITY AND A CONTRACT AND I SIGN IT OF MY OWN FREE WILL.</label>
                <input onChange={this.checkWaiver} id="waiverCheck" type="checkbox" />
            </div>
            <div className="waiver-footer">
                <button id="acceptBtn" className="btn btn-primary" disabled={true}>Accept</button>
            </div>
        </div>);
        togglePopup(true);

        document.getElementById('acceptBtn').addEventListener('click', this.acceptWaiver);
    }

    acceptWaiver() {
        togglePopup(false);
        waiver = true;
        window.scrollTo(0,0);
	document.getElementById('bookBtn').style.visibility = 'visible';
    }

    checkWaiver() {
        document.getElementById('acceptBtn').disabled = document.getElementById('waiverCheck').checked ? false : true;
    }

    bookDropIn() {
        if (waiver) {
            $.get(server + '/api/updateStaging', result => {
                if (result.error) {
                    setPopupContent('Error', result.error);
                    togglePopup(true);
                } else {
                    console.log(result);
                    $.post(server + '/api/sale', {
                        user_id: 'null',
                        child_first_name: 'null',
                        child_last_name: 'null',
                        phone: 'null',
                        first_name: document.getElementById('firstNameField').value,
                        last_name: document.getElementById('firstNameField').value,
                        email: document.getElementById('emailField').value,
                        cart: result.cart,
			free: 'null'
                    }, saleResult => {
                        // Send sale IDs back to server for staging storage
                        $.post(server + '/api/storeTotal', { total: saleResult.total }, storeResult => {
                            setPopupContent('Success', 'Your booking has been registered.');
                            togglePopup(true);
                            setTimeout(() => {
                                window.location.reload();
                            }, 2000); 
                        });
                    });
                }
            });
        } else {
            setPopupContent('Error', 'You have to accept the waiver to continue.');
            togglePopup(true);
        }
    }

    componentDidMount() {
        document.documentElement.style.background = 'url(\'./images/reception_show.png\')';
        document.getElementById('main').style.background = 'url(\'./images/reception_show.png\')';
        document.getElementById('page').style.background = 'url(\'./images/reception_show.png\')';
    }

    render() {
        return (
            <div style={{color: 'white', textAlign: 'center', margin: '1em auto', width: '55%'}}>
                <h3>Drop-In</h3>
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
                        <label>Waiver</label>
                        <input type="submit" className="btn btn-secondary w-100" onClick={this.openWaiver} value="View Waiver" />
                    </div>
                </div>
                <button className="btn btn-primary" style={{visibility: 'hidden'}} id="bookBtn" onClick={this.bookDropIn}>Book</button>
            </div>
        );
    }
}
