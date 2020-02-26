import React, { Component } from 'react'
import $ from 'jquery';
import server from '../fetchServer';
import Service from './Service';

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
        if (this.state.primary) {
            $.post(server + '/api/getSecondaryServices', {
                service_id: service.id
            }, (result) => {
                this.setState({
                    services: result.services.map(service => {
                        return <Service key={service.id} service={service} handleClick={this.handleClick} />
                    }),
                    primary: false
                })
            });
        } else {
            this.props.setCalendarID(service.id);
            window.location.replace('/calendar');
        }
    }

    componentDidMount() {
        $.get(server + '/api/getServices', (result) => {
            if (result) {
                this.setState(prevState => {
                    return {
                        services: result.services.map(service => {
                            return <Service handleClick={this.handleClick} key={service.id} service={service} />
                        }),
                        primary: prevState.primary
                    };
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
