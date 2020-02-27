import React, { Component } from 'react'
import $ from 'jquery';
import { uuid } from 'uuidv4';
import server from '../fetchServer';
import Service from './Service';

export default class Services extends Component {
    constructor() {
        super();

        this.state = {
            services: []
        };

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(service) {
        if (service.primary_service_id == null) {
            // Primary service
            $.post(server + '/api/getSecondaryServices', {
                service_id: service.id
            }, (result) => {
                document.getElementById('services').style.opacity = 0;
                setTimeout(() => {
                    this.setState({
                        services: result.services.map(newService => {
                            return <Service key={uuid()} service={newService} handleClick={this.handleClick} />
                        })
                    });

                    if (this.state.services[0].props.service.primary_service_id) {
                        document.getElementById('backBtn').style.display = 'inline-block';
                    } else {
                        document.getElementById('backBtn').style.display = 'none';
                    }
                    document.getElementById('services').style.opacity = 1;
                }, 500);
            });
        } else {
            // Secondary service
            document.getElementById('services').style.opacity = 0;
            setTimeout(() => {
                window.location.replace('/calendar?s=' + service.id);
            }, 500);
        }
    }

    componentDidMount() {
        $.get(server + '/api/getServices', (result) => {
            if (result) {
                this.setState(prevState => {
                    return {
                        services: result.services.map(service => {
                            return <Service key={uuid()} service={service} handleClick={this.handleClick} />
                        }),
                        primary: prevState.primary
                    };
                });
            } else {
                alert('Something went wrong fetching services');
            }

            document.getElementById('backBtn').style.display = 'none';
        });
    }

    handleBackBtn() {
        document.getElementById('services').style.opacity = 0;
            setTimeout(() => {
                window.location.reload();
            }, 500);
    }

    render() {
        return (
            <div id="services-page">
                <h1>Our Services</h1>
                <h5>Scroll through the services offered at Cosgrove Hockey Academy!</h5>
                <h5>Click on any service for more information and to see available spots.</h5>
                <button id="backBtn" className="btn btn-secondary" onClick={this.handleBackBtn}>Go Back</button>
                <div id="services">
                    {this.state.services}
                </div>
            </div>
        )
    }
}
