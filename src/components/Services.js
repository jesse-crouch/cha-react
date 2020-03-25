import React, { Component } from 'react'
import $ from 'jquery';
import { uuid } from 'uuidv4';
import server from '../fetchServer';
import Service from './Service';
import { addToCart } from './cartMethods';

export default class Services extends Component {
    constructor() {
        super();

        this.state = {
            services: []
        };

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(service) {
        document.getElementById('services-page').style.opacity = 0;
        setTimeout(() => {
            if (service.cart) {
                // Add this event straight to the cart
                $.post(server + '/api/getEvent', { id: service.id }, result => {
                    addToCart(result.event, true);
                });
            } else {
                $.post(server + '/api/getServices', { id: service.id }, result => {
                    if (result.services.length > 0) {
                        // Populate the next chain of services
                        this.setState({
                            services: result.services.map(service => {
                                return <Service key={uuid()} handleClick={this.handleClick} service={service} />;
                            })
                        }, () => {
                            document.getElementById('services-page').style.opacity = 1;
                        });
                    } else {
                        // Direct to calendar
                        window.location.replace('/calendar?s=' + service.id);
                    }
                });
            }
        }, 500);
    }

    componentDidMount() {
        $.post(server + '/api/getServices', (result) => {
            if (result) {
                console.log(result);
                this.setState({
                    services: result.services.map(service => {
                        return <Service key={uuid()} handleClick={this.handleClick} service={service} />
                    })
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
            <div id="services-page" style={{transition: 'all 0.5s'}}>
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
