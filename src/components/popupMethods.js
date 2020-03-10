import time from "../stringDate";
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

function removeContent() {
    var popup = document.getElementById('popup');
    ReactDOM.unmountComponentAtNode(popup.children[1]);
}

export function togglePopup(enable) {
    var popup = document.getElementById('popup');
    var topValue = enable ? -50 : -(popup.clientHeight + 150);
    $('#popup').animate({top: topValue + 'px'}, 0);
}

export function setPopupContent(title, content) {
    var popup = document.getElementById('popup');
    popup.children[0].innerHTML = title;
    removeContent();
    popup.chilren[1].innerHTML = content;
}

export function setEventContent(event) {
    var popup = document.getElementById('popup');
    popup.children[0].innerHTML = event.event_name;
    removeContent();
    var start = new Date(event.epoch_date*1000);
    var end = new Date(start.getTime());
    end.setHours(end.getHours(), end.getMinutes() + (event.duration*60));    
    var openSpots = (event.open_spots > 1) ? event.open_spots + ' Spots Remaining' : event.open_spots + ' Spot Remaining!';
    var totalSpots = (event.total_spots > 1) ? event.total_spots + ' Spots in Total' : event.total_spots + ' Spot in Total';

    var content = <>
        <div className="input-group">
            <div className="prepend"><p>Time</p></div>
            <div className="form-control">{time(start) + ' - ' + time(end)}</div>
        </div>
        <div className="input-group">
            <div className="prepend"><p>Instructor</p></div>
            <div className="form-control">{event.instructor_name}</div>
        </div>
        <div className="input-group">
            <div className="prepend"><p>Open Spots</p></div>
            <div className="form-control">{openSpots}</div>
        </div>
        <div className="input-group">
            <div className="prepend"><p>Total Spots</p></div>
            <div className="form-control">{totalSpots}</div>
        </div>
    </>
    
    ReactDOM.render(content, popup.children[1]);
}