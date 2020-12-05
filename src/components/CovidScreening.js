import React, { Component } from 'react';
import $ from 'jquery';
import server from '../fetchServer';
import { setPopupContent, togglePopup } from './popupMethods';

export default class CovidScreening extends Component {
    constructor(props) {
        super(props);
        this.state = { sale_id: props.id };

        this.handleContinue = this.handleContinue.bind(this);
    }

    handleContinue() {
        $.post(server + '/api/updateCovid', { id: this.props.id }, result => {
            if (result.error) {
                togglePopup(false);
                setPopupContent('Error', result.error);
                togglePopup(true);
            } else {
                togglePopup(false);
            }
        });
    }

    componentDidMount() {
        var symptomNo = document.getElementById('symptomNo');
        var canadaNo = document.getElementById('canadaNo');
        var contactNo = document.getElementById('contactNo');

        symptomNo.addEventListener('change', () => {
            if (symptomNo.checked && canadaNo.checked && contactNo.checked) {
                document.getElementById('continueBtn').style.display = '';
            } else {
                document.getElementById('continueBtn').style.display = 'none';
            }

            if (symptomNo.checked) {
                symptomYes.checked = false;
            }
        });

        canadaNo.addEventListener('change', () => {
            if (symptomNo.checked && canadaNo.checked && contactNo.checked) {
                document.getElementById('continueBtn').style.display = '';
            } else {
                document.getElementById('continueBtn').style.display = 'none';
            }

            if (canadaNo.checked) {
                canadaYes.checked = false;
            }
        });

        contactNo.addEventListener('change', () => {
            if (symptomNo.checked && canadaNo.checked && contactNo.checked) {
                document.getElementById('continueBtn').style.display = '';
            } else {
                document.getElementById('continueBtn').style.display = 'none';
            }

            if (contactNo.checked) {
                contactYes.checked = false;
            }
        });

        var symptomYes = document.getElementById('symptomYes');
        var canadaYes = document.getElementById('canadaYes');
        var contactYes = document.getElementById('contactYes');

        symptomYes.addEventListener('change', () => {
            if (symptomYes.checked) {
                symptomNo.checked = false;
            }

            if (symptomNo.checked && canadaNo.checked && contactNo.checked) {
                document.getElementById('continueBtn').style.display = '';
            } else {
                document.getElementById('continueBtn').style.display = 'none';
            }
        });
        canadaYes.addEventListener('change', () => {
            if (canadaYes.checked) {
                canadaNo.checked = false;
            }

            if (symptomNo.checked && canadaNo.checked && contactNo.checked) {
                document.getElementById('continueBtn').style.display = '';
            } else {
                document.getElementById('continueBtn').style.display = 'none';
            }
        });
        contactYes.addEventListener('change', () => {
            if (contactYes.checked) {
                contactNo.checked = false;
            }

            if (symptomNo.checked && canadaNo.checked && contactNo.checked) {
                document.getElementById('continueBtn').style.display = '';
            } else {
                document.getElementById('continueBtn').style.display = 'none';
            }
        });
    }

    render() {
        return (
            <div className="container" style={{marginTop: "2em"}}>
                <div className="w-75" style={{margin: "0 auto"}}>
                    <div className="form-group">
                        <label for="inputEmail4">Do they have any symptoms?</label>
                    </div>
                    <div className="form-row">
                        <div className="form-group col-md-6">
                            <input className="form-control" id="symptomYes" type="radio" />
                            <label for="symptomYes">Yes</label>
                        </div>
                        <div className="form-group col-md-6">
                            <input className="form-control" id="symptomNo" type="radio" />
                            <label for="symptomNo">No</label>
                        </div>
                    </div>
                    <div className="form-group">
                        <label for="inputEmail4">Have they travelled outside Canada in the last 14 days?</label>
                    </div>
                    <div className="form-row">
                        <div className="form-group col-md-6">
                            <input className="form-control" id="canadaYes" type="radio" />
                            <label for="symptomYes">Yes</label>
                        </div>
                        <div className="form-group col-md-6">
                            <input className="form-control" id="canadaNo" type="radio" />
                            <label for="symptomNo">No</label>
                        </div>
                    </div>
                    <div className="form-group">
                        <label for="inputEmail4">Have they been in close contact with a confirmed or probable case?</label>
                    </div>
                    <div className="form-row">
                        <div className="form-group col-md-6">
                            <input className="form-control" id="contactYes" type="radio" />
                            <label for="symptomYes">Yes</label>
                        </div>
                        <div className="form-group col-md-6">
                            <input className="form-control" id="contactNo" type="radio" />
                            <label for="symptomNo">No</label>
                        </div>
                    </div>
                    <div className="text-center">
                        <button className="btn btn-primary" style={{display: 'none'}} id="continueBtn" onClick={this.handleContinue}>Continue</button>
                    </div>
                </div>
            </div>
        )
    }
}
