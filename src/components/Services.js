import React, { Component } from 'react'
import $ from 'jquery';
import { uuid } from 'uuidv4';
import server from '../fetchServer';
import Service from './Service';
import { addSpecialToCart } from './cartMethods';
import { setReactContent, togglePopup } from './popupMethods';

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
        if (!service.special) document.getElementById('services-page').style.opacity = 0;
        console.log(service);
        setTimeout(() => {
            if (service.special) {
                // Add this event straight to the cart
                addSpecialToCart(service);
            } else {
                // Check if this service has any children
                var hasChildren = false;
                for (var i in this.state.services) {
                    if (this.state.services[i].parent === service.id) {
                        hasChildren = true;
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
                    // Special case for multi events
                    if (service.id === 63) {
                        window.location.replace('/calendar?s=62&m=5&n=done-' + service.id);
                    } else if (service.id === 64) {
                        var ageContent = <div>
                            <select id="ageSelect">
                                <option>Please select the appropriate age group</option>
                                <option>Tyke/Novice</option>
                                <option>Atom/Peewee</option>
                                <option>Bantam/Midget</option>
                            </select>
                        </div>;
                        setReactContent('Select an Age Category', ageContent);
                        togglePopup(true);

                        var ageSelect = document.getElementById('ageSelect');
                        ageSelect.addEventListener('change', () => {
                            var ageGroup = ageSelect.selectedIndex + 15;
                            window.location.replace('/calendar?s=19&m=1&n=' + ageGroup + '-' + service.id); 
                        });
                    } else {
                        window.location.replace('/calendar?s=' + service.id);
                    }
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
        console.log(this.state.services);
        if (this.state.services.length > 0) {
            for (var i in this.state.services) {
                const service = this.state.services[i];
                if (!this.state.parent) {
                    if (!service.parent && !service.disabled) {
                        services.push(<Service key={uuid()} handleClick={this.handleClick} service={service} />);
                    }
                } else {
                    if (service.parent === this.state.parent && !service.disabled) {
                        services.push(<Service key={uuid()} handleClick={this.handleClick} service={service} />);
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
