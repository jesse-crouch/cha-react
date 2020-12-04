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
        var symptomCheck = document.getElementById('symptomCheck');
        var canadaCheck = document.getElementById('canadaCheck');
        var contactCheck = document.getElementById('contactCheck');

        symptomCheck.addEventListener('change', () => {
            if (symptomCheck.checked && canadaCheck.checked && contactCheck.checked) {
                document.getElementById('continueBtn').style.display = '';
            } else {
                document.getElementById('continueBtn').style.display = 'none';
            }
        });
        canadaCheck.addEventListener('change', () => {
            if (symptomCheck.checked && canadaCheck.checked && contactCheck.checked) {
                document.getElementById('continueBtn').style.display = '';
            } else {
                document.getElementById('continueBtn').style.display = 'none';
            }
        });
        contactCheck.addEventListener('change', () => {
            if (symptomCheck.checked && canadaCheck.checked && contactCheck.checked) {
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
                        <label for="inputEmail4">Do they have no symptoms?</label>
                        <input className="form-control" id="symptomCheck" type="checkbox" />
                    </div>
                    <div className="form-group">
                        <label for="inputAddress">Have they been within Canada for the last 14 days?</label>
                        <input className="form-control" id="canadaCheck" type="checkbox" />
                    </div>
                    <div className="form-group">
                        <label for="inputAddress">Have they had no close contact with someone with symptoms?</label>
                        <input className="form-control" id="contactCheck" type="checkbox" />

                    </div>
                    <div className="text-center">
                        <button className="btn btn-primary" style={{display: 'none'}} id="continueBtn" onClick={this.handleContinue}>Continue</button>
                    </div>
                </div>
            </div>
        )
    }
}
