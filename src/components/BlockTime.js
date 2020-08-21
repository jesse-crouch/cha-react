import React, { Component } from 'react'
import { time } from '../stringDate';
import { togglePopup, setPopupContent } from './popupMethods';
import $ from 'jquery';
import server from '../fetchServer';

export default class BlockTime extends Component {
    componentDidMount() {
        // Date
        var dateInput = document.getElementById('dateInput');
        
        // Fill start and end selects
        var startSelect = document.getElementById('startSelect');
        var trackDate = new Date(Date.UTC(2020,1,1,7,30,0,0));
        for (var i=0; i<30; i++) {
            // eslint-disable-next-line
            var newOption = document.createElement('option');
            trackDate.setUTCMinutes(trackDate.getUTCMinutes() + 30);
            newOption.innerHTML = time(trackDate);
            newOption.setAttribute('timeInfo', trackDate.getUTCHours() + ',' + trackDate.getUTCMinutes());
            startSelect.appendChild(newOption);
        }
        // Populate duration select
        var durationSelect = document.getElementById('durationSelect');
        // eslint-disable-next-line
        for (var i=0; i<10; i++) {
            // eslint-disable-next-line
            var newOption = document.createElement('option');
            var length = i;
            newOption.innerHTML = length + (length > 1 ? ' Hours' : ' Hour');
            if (i === 0) {
                length = '30';
                newOption.innerHTML = length + ' Minutes';
            }
            durationSelect.appendChild(newOption);
        }

        var dayCheck = document.getElementById('dayCheck');
        dayCheck.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.getElementById('timeDiv').style.display = 'none';
            } else {
                document.getElementById('timeDiv').style.display = '';
            }
        });

        dateInput.addEventListener('change', (e) => {
            if (dateInput.value !== '') {
                document.getElementById('addBlockBtn').style.display = '';
            }
        });

        document.getElementById('addBlockBtn').addEventListener('click', () => {
            var dateInfo = dateInput.value.split('-');
            var startInfo = startSelect.options[startSelect.selectedIndex].getAttribute('timeInfo').split(',');
            var date = new Date(parseInt(dateInfo[0]), parseInt(dateInfo[1])-1, parseInt(dateInfo[2]), parseInt(startInfo[0]), parseInt(startInfo[1]));
            if (dayCheck.checked) {
                // Block the day
                $.post(server + '/api/blockTime', { date: date.getTime()/1000, duration: 100 }, result => {
                    if (result.error) {
                        togglePopup(false);
                        setPopupContent('Error', result.error);
                        togglePopup(true);
                    } else {
                        // Block added
                        togglePopup(false);
                        setPopupContent('Block Added', 'The block was successfully added. Refreshing page shortly...');
                        togglePopup(true);
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    }
                });
            }  else {
                // Block a time
                var durationInput = document.getElementById('durationSelect').options[document.getElementById('durationSelect').selectedIndex].value;
                var duration = 0;
                if (durationInput.split(' ')[1] === 'Minutes') {
                    duration = 0.5;
                } else {
                    duration = parseInt(durationInput.split(' ')[0]);
                }
                $.post(server + '/api/blockTime', { date: date.getTime()/1000, duration: duration }, result => {
                    if (result.error) {
                        togglePopup(false);
                        setPopupContent('Error', result.error);
                        togglePopup(true);
                    } else {
                        // Block added
                        togglePopup(false);
                        setPopupContent('Block Added', 'The block was successfully added. Refreshing page shortly...');
                        togglePopup(true);
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    }
                });
            }
        });
    }

    render() {
        return (
            <div>
                <div className="form-row">
                    <div className="form-group col-md-6">
                        <label>Date</label>
                        <input className="form-control" type="date" id="dateInput" />
                    </div>
                    <div className="form-group col-md-6">
                        <label>Whole Day?</label>
                        <input className="form-control" id="dayCheck" type="checkbox" />
                    </div>
                </div>
                <div className="form-row" id="timeDiv">
                    <div className="form-group col-md-6">
                        <label>Start</label>
                        <select className="form-control" id="startSelect"></select>
                    </div>
                    <div className="form-group col-md-6">
                        <label>Duration</label>
                        <select className="form-control" id="durationSelect"></select>
                    </div>
                </div>
                <button className="btn btn-primary" id="addBlockBtn" style={{display: 'none'}}>Add</button>
            </div>
        )
    }
}
