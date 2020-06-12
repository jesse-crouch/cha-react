import {time} from"../stringDate";
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import { toggleCart } from "./cartMethods";
import monthNames from "../months";
import server from "../fetchServer";
import Cookies from 'js-cookie';

function removeContent() {
    var popup = document.getElementById('popup');
    ReactDOM.unmountComponentAtNode(popup.children[1]);

    // Remove any extra buttons from the footer
    var footer = document.getElementById('popup-footer');
    while(footer.childElementCount > 1) {
        footer.removeChild(footer.children[0]);
    }
}

export function togglePopup(enable) {
    if (!enable) {
        var footer = document.getElementById('popup-footer');
        var addBtn = document.getElementById('addBtn');
        var addEventBtn = document.getElementById('addEventBtn');
        var addEmployeeBtn = document.getElementById('employeeBtn');
        var deleteBtn = document.getElementById('deleteEventBtn');
        if (addBtn) { footer.removeChild(addBtn); }
        if (addEmployeeBtn) { footer.removeChild(addEmployeeBtn); }
        if (addEventBtn) { footer.removeChild(addEventBtn); }
        if (deleteBtn) { footer.removeChild(deleteBtn); }
    } else {
        if (document.getElementById('cart-container').style.visibility === 'visible') {
            toggleCart();
        }
    }

    var popup = document.getElementById('popup');
    if (!enable) { popup.style.width = ''; }
    var topValue = enable ? -50 : -(popup.clientHeight + 150);
    if (enable) {
        document.getElementById('popup').style.visibility = 'visible';
        document.documentElement.scrollTo(0,0);
    }
    $('#popup').animate({top: topValue + 'px'}, 0, '', () => {
        if (!enable) {
            document.getElementById('popup').style.visibility = 'hidden';
            if (Cookies.get('reload')) {
                Cookies.remove('reload');
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
        }
    });
}

export function setPopupContent(title, content) {
    var popup = document.getElementById('popup');
    popup.children[0].innerHTML = title;
    removeContent();
    var text = <p>{content}</p>;
    ReactDOM.render(text, popup.children[1]);
}

export function setDOMContent(title, content) {
    var popup = document.getElementById('popup');
    popup.children[0].innerHTML = title;
    removeContent();

    var popupContent = document.getElementById('popup-content');
    popupContent.appendChild(content);
}

export function setReactContent(title, content, width = '') {
    var popup = document.getElementById('popup');
    popup.children[0].innerHTML = title;
    removeContent();

    var popupContent = document.getElementById('popup-content');
    ReactDOM.render(content, popupContent);
    popup.style.width = width;
}

export function setHTMLContent(title, content, width = '', cartButton = false, employeeButton = false) {
    var popup = document.getElementById('popup');
    popup.children[0].innerHTML = title;
    removeContent();
    ReactDOM.render(content, popup.children[1]);
    document.getElementById('popup').style.width = width;
    
    if (cartButton) {
        // Add an add to cart button to the popup
        var addBtn = document.createElement('button');
        addBtn.id = 'addEventBtn';
        addBtn.onclick = () => {
            // Get all of the entered values
            var nameField = document.getElementById('newEventName');
            var spotsField = document.getElementById('newEventSpots');
            var name = nameField.value;
            var spots = spotsField.value;

            var serviceSelect = document.getElementById('newEventService');
            var instructorSelect = document.getElementById('newEventInstructor');
            var monthSelect = document.getElementById('newEventMonth');
            var daySelect = document.getElementById('newEventDay');
            var yearSelect = document.getElementById('newEventYear');
            var startSelect = document.getElementById('newEventStart');
            var durationSelect = document.getElementById('newEventDuration');

            var service = serviceSelect.options[serviceSelect.selectedIndex].getAttribute('id');
            var instructor = instructorSelect.options[instructorSelect.selectedIndex].getAttribute('id');
            var duration = durationSelect.options[durationSelect.selectedIndex].value;
            var start = startSelect.options[startSelect.selectedIndex].getAttribute('timeInfo');

            var month = monthNames.indexOf(monthSelect.options[monthSelect.selectedIndex].value);
            var day = daySelect.options[daySelect.selectedIndex].value;
            var year = yearSelect.options[yearSelect.selectedIndex].value;

            // Check all of the information
            var validData = true;
            if (name.length === 0) {
                validData = false;
                nameField.style.border = '2px solid red';
            }
            if (!service) {
                validData = false;
                serviceSelect.style.border = '2px solid red';
            }
            if (!instructor) {
                validData = false;
                instructorSelect.style.border = '2px solid red';
            }
            if (month === -1) {
                validData = false;
                monthSelect.style.border = '2px solid red';
            }
            if (isNaN(day)) {
                validData = false;
                daySelect.style.border = '2px solid red';
            }
            if (isNaN(year)) {
                validData = false;
                yearSelect.style.border = '2px solid red';
            }
            if (!start) {
                validData = false;
                startSelect.style.border = '2px solid red';
            }
            if (duration.includes('Choose')) {
                validData = false;
                durationSelect.style.border = '2px solid red';
            }
            if (isNaN(parseInt(spots))) {
                validData = false;
                spotsField.style.border = '2px solid red';
            }
            if (validData) {
                //document.getElementById('popup-footer').removeChild(addBtn);
                var timeInfo = start.split(',');
                var durationNum = duration.split(' ')[0];
                if (duration.split(' ')[1].includes('Hour')) {
                    durationNum *= 60;
                } else {
                    durationNum = 30;
                }
                var date = new Date(Date.UTC(year, month, day, timeInfo[0], timeInfo[1],0,0));

                // Check for recurrence
                var days = [];
                if (document.getElementById('recurCheck').checked) {
                    // Get a list of all days checked
                    if (document.getElementById('sundayCheck').checked) days.push(0);
                    if (document.getElementById('mondayCheck').checked) days.push(1);
                    if (document.getElementById('tuesdayCheck').checked) days.push(2);
                    if (document.getElementById('wednesdayCheck').checked) days.push(3);
                    if (document.getElementById('thursdayCheck').checked) days.push(4);
                    if (document.getElementById('fridayCheck').checked) days.push(5);
                    if (document.getElementById('saturdayCheck').checked) days.push(6);
                }

                // Send information to server
                $.post(server + '/api/addEvent', {
                    name: name,
                    instructor: instructor,
                    service: service,
                    spots: spots,
                    date: date.getTime()/1000,
                    duration: durationNum,
                    days: JSON.stringify(days)
                }, result => {
                    if (result.error) {
                        togglePopup(false);
                        setPopupContent('Error', result.error);
                        togglePopup(true);
                    } else {
                        // Event added
                        togglePopup(false);
                        setPopupContent('Event Added', 'The event was successfully added. Refreshing page shortly...');
                        togglePopup(true);
                        setTimeout(() => {
                            window.location.reload();
                        }, 200);
                    }
                });
            }
        };
        addBtn.className = 'btn btn-primary';
        addBtn.style.float = 'left';
        addBtn.innerHTML = 'Add Event';
        var closeBtn = document.getElementById('popupCloseBtn');
        document.getElementById('popup-footer').insertBefore(addBtn, closeBtn);
    }

    if (employeeButton) {
        // Add an add to cart button to the popup
        var employeeBtn = document.createElement('button');
        employeeBtn.id = 'addEmployeeBtn';
        employeeBtn.onclick = () => {
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
        };
        employeeBtn.className = 'btn btn-primary';
        employeeBtn.style.float = 'left';
        employeeBtn.innerHTML = 'Add Employee';
        var closeButton = document.getElementById('popupCloseBtn');
        document.getElementById('popup-footer').insertBefore(employeeBtn, closeButton);
    }
}

export function setEventContent(event, popupButtons) {
    console.log(event);
    var popup = document.getElementById('popup');
    popup.children[0].innerHTML = event.name;
    removeContent();
    var start = new Date(event.epoch_date*1000);
    var end = new Date(start.getTime());
    end.setHours(end.getHours(), end.getMinutes() + (event.duration*60));    
    var openSpots = (event.open_spots > 1) ? event.open_spots + ' Spots Remaining' : event.open_spots + ' Spot Remaining';
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
    
    for (var i in popupButtons) {
        addButton(popupButtons[i]);
    }

    ReactDOM.render(content, popup.children[1]);
}

function addButton(button) {
    var closeBtn = document.getElementById('popupCloseBtn');
    document.getElementById('popup-footer').insertBefore(button, closeBtn);
}