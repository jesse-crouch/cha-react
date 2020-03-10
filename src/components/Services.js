import React, { Component } from 'react'
import $ from 'jquery';
import server from '../fetchServer';
import Service from './Service';
import {uuid} from 'uuidv4';

export default class Services extends Component {
    constructor() {
        super();

        this.state = {
            services: [],
            primary: true
        };

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(service) {
        if (service.primary_service_id) {
            // Secondary service, send to calendar
            window.location.replace('/calendar?s=' + service.id);
        } else {
            // Primary service, get secondaries
            $.post(server + '/api/getSecondaryServices', {service_id: service.id}, (result) => {
                if (result) {
                    this.setState({
                        services: result.services.map(service => {
                            return <Service key={uuid()} handleClick={this.handleClick} service={service} />
                        })
                    });
                } else {
                    alert('Error while fetching secondary services');
                }
            });
        }
    }

    componentDidMount() {
        $.get(server + '/api/getServices', (result) => {
            if (result) {
                this.setState({
                    services: result.services.map(service => {
                        return <Service key={uuid()} handleClick={this.handleClick} service={service} />
                    })
                });
            } else {
                alert('Something went wrong fetching services');
            }
        });
    }

    render() {
        return (
            <div id="services-page">
                <h1>Our Services</h1>
                <h5>Scroll through the services offered at Cosgrove Hockey Academy!</h5>
                <h5>Click on any service for more information and to see available spots.</h5>
                <div id="services">
                    {this.state.services}
                </div>
            </div>
        )
    }
}
