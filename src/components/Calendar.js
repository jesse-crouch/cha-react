import React, { Component } from 'react'
import server from '../fetchServer';
import $ from 'jquery';

export default class Calendar extends Component {
    constructor(props) {
        super();
        const urlParams = new URLSearchParams(new URL(window.location.href).search);
        this.state = {
            service: urlParams.get('s')
        };
    }

    componentDidMount() {
        // Get starting date
        const date = new Date();
        date.setHours(0,0,0,0);
        date.setDate(date.getDate() - date.getDay());

        $.post(server + '/api/getCalendarInfo', {
            service_id: this.state.service,
            start: date.getTime()
        }, (result) => {
            console.log(result);
        });
    }

    render() {
        return (
            <div>
                Calendar {this.state.service}
            </div>
        )
    }
}
