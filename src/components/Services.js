import React, { Component } from 'react'
import $ from 'jquery';
import { uuid } from 'uuidv4';
import server from '../fetchServer';
import Service from './Service';
import { addSpecialToCart } from './cartMethods';

export default class Services extends Component {
    constructor() {
        super();

        this.state = {
            level: 0,
            parent: null,
            services: []
        };

        this.handleClick = this.handleClick.bind(this);
        this.handleBackBtn = this.handleBackBtn.bind(this);
    }

    handleClick(service) {
        console.log(service.cart);
        if (!service.cart) document.getElementById('services-page').style.opacity = 0;
        setTimeout(() => {
            if (service.cart) {
                // Add this event straight to the cart
                addSpecialToCart(service.id);
            } else {
                // Check if this service has any children
                var hasChildren = false;
                for (var i in this.state.services) {
                    if (this.state.services[i].id_chain) {
                        if (this.state.services[i].id_chain.includes(service.id)) {
                            hasChildren = true;
                        }
                    }
                }

                if (hasChildren) {
                    this.setState(prevState => {
                        return {
                            level: prevState.level + 1,
                            parent: service.id,
                            services: prevState.services
                        }
                    });
                } else {
                    window.location.replace('/calendar?s=' + service.id);
                }
            }
        }, 500);
    }

    componentDidMount() {
        $.get(server + '/api/getAllServices', result => {
            if (!result.error) {
                this.setState(prevState => {
                    return {
                        level: 1,
                        parent: prevState.parent,
                        services: result.services
                    }
                });
            } else {
                alert('Something went wrong fetching services');
            }
        });
    }

    componentDidUpdate() {
        document.getElementById('services-page').style.opacity = 1;
    }

    handleBackBtn(serviceObj) {
        document.getElementById('services-page').style.opacity = 0;
        var service = serviceObj.props.service;
        setTimeout(() => {
            this.setState(prevState => {
                return {
                    level: prevState.level - 1,
                    parent: (service.id_chain.length < 2) ? null : service.id_chain[prevState.level - 3],
                    services: prevState.services
                }
            });
        }, 500);
    }

    render() {
        var btnDisplay = this.state.level > 1 ? "" : "none";

        // Determine the correct services to render based on the current state
        var services = [];
        if (this.state.services.length > 0) {
            for (var i in this.state.services) {
                const service = this.state.services[i];
                if (!this.state.parent) {
                    if (!service.id_chain) {
                        services.push(<Service key={uuid()} handleClick={this.handleClick} service={service} />);
                    }
                } else {
                    if (service.id_chain) {
                        if (service.id_chain.includes(this.state.parent) && service.id_chain.length === (this.state.level - 1)) {
                            services.push(<Service key={uuid()} handleClick={this.handleClick} service={service} />);
                        }
                    }
                }
            }
        }

        return (
            <div id="services-page" style={{transition: 'all 0.5s'}}>
                <h1>Our Services</h1>
                <h5>Scroll through the services offered at Cosgrove Hockey Academy!</h5>
                <h5>Click on any service for more information and to see available spots.</h5>
                <button id="backBtn" style={{display: btnDisplay}} className="btn btn-secondary" onClick={() => this.handleBackBtn(services[0])}>Go Back</button>
                <div id="services">
                    { services }
                </div>
            </div>
        )
    }
}
