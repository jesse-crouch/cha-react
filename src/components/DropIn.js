import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import server from '../fetchServer';
import $ from 'jquery';
import { setPopupContent, togglePopup } from './popupMethods';
import Day from './ScheduleDay';
import {uuid} from 'uuidv4';
import { addToCart } from './cartMethods';

export default class DropIn extends Component {
    componentDidMount() {
        $.get(server + '/api/getTodayClasses', result => {
            if (result.error) {
                setPopupContent('Error', result.error);
                togglePopup(true);
            } else {
                var date = new Date();
                date.setHours(6,0,0,0);
                ReactDOM.render(<Day key={uuid()} events={result.events} date={date.getTime()} eventHandler={this.eventHandler} managed={false} />, document.getElementById('day-container'));
            }
        });
    }

    eventHandler(event) {
        event.epoch_date = event.epoch_date/1000;
        addToCart(event, true);
    }

    render() {
        return (
            <div className="text-center">
                <h3 className="mt-5">Drop-In</h3>
                <p>Below is a list of classes for today. For any other type of service, or for classes on a different day,</p>
                <p>please find them on the services page and add them to the cart. When you go to the checkout, the drop-in process will continue.</p>
                <div id="day-container" className="mx-auto" style={{width: '35%'}}></div>
            </div>
        )
    }
}
