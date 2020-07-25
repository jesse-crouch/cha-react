import React, { Component } from 'react'
import server from '../fetchServer';
import { setPopupContent, togglePopup } from './popupMethods';
import { date, time } from '../stringDate';
import $ from 'jquery';

var start = null, end = null;

export default class ScheduleInfo extends Component {
    downloadTable() {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(document.getElementById('mainTable').outerHTML));
        element.setAttribute('download', 'Events - ' + date(start) + ' to ' + date(end) + '.xls');
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    handleClick() {
        var startDateInput = document.getElementById('startDateField').value.split('-');
        var endDateInput = document.getElementById('endDateField').value.split('-');

        var startDate = new Date(startDateInput[0], startDateInput[1], startDateInput[2], 5,0,0,0);
        var endDate = new Date(endDateInput[0], endDateInput[1], endDateInput[2], 5,0,0,0);

        $.post(server + '/api/getEventsAdmin', {
            startDate: startDate.getTime()/1000,
            endDate: endDate.getTime()/1000
        }, result => {
            if (result.error) {
                setPopupContent('Error', result.error);
                togglePopup(true);
            } else {
                if (result.events.length > 0) {
                    // Add each event as a row on the table
                    for (var i in result.events) {
                        var eventDate = new Date(result.events[i].epoch_date*1000);
                        
                        var newRow = document.createElement('tr');
                        var eventDateData = document.createElement('td');
                        var eventTimeData = document.createElement('td');
                        var eventNameData = document.createElement('td');
                        eventDateData.innerHTML = date(eventDate);
                        eventTimeData.innerHTML = time(eventDate);
                        eventNameData.innerHTML = result.events[i].name;
                        newRow.appendChild(eventDateData);
                        newRow.appendChild(eventTimeData);
                        newRow.appendChild(eventNameData);
                        document.getElementById('tableBody').appendChild(newRow);
                    }
                    // Make the table and the download button visible
                    document.getElementById('downloadBtn').style.display = '';
                    document.getElementById('mainTable').style.display = '';

                    // Set the start and end vars for setting the filename when downloading the table
                    start = startDate;
                    end = endDate;
                } else {
                    setPopupContent('Error', 'No scheduled events have been found within the given timeframe.');
                    togglePopup(true);
                }
            }
        });
    }

    render() {
        return (
            <div className="text-center">
                <h3 style={{margin: "1em"}}>Scheduled Classes</h3>
                <p>View all scheduled classes between a certain timeframe.</p>
                <div id="schedule-info-input">
                    <p>From:</p>
                    <input type="date" id="startDateField" />
                    <p>to</p>
                    <input type="date" id="endDateField" />
                </div>
                <button className="btn btn-primary" style={{width: '10%'}} onClick={this.handleClick}>View</button>
                <button id="downloadBtn" className="btn btn-success" style={{width: '10%', margin: '1em', display: 'none'}} onClick={this.downloadTable}>Download</button>
                <table className="table table-striped" style={{width: '80%', display: 'none', margin: '1em auto'}} id="mainTable">
                    <thead className="thead thead-dark">
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Class</th>
                        </tr>
                    </thead>
                    <tbody id="tableBody"></tbody>
                </table>
            </div>
        )
    }
}
