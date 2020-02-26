import React, { Component } from 'react'
import server from '../fetchServer';
import $ from 'jquery';

export default class Calendar extends Component {
    constructor(props) {
        super();

        this.state = {
            service: props.id
        };
    }

    componentDidMount() {
        $.post(server + '/api/getCalendarInfo', {
            service_id: this.state.service
        }, (result) => {
            console.log(result);
        });
    }

    render() {
        return (
            <div>
                Calendar {this.service}
            </div>
        )
    }
}
