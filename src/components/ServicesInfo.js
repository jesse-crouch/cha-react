import React, { Component } from 'react';
import server from '../fetchServer'
import { togglePopup, setPopupContent, setHTMLContent } from './popupMethods';
import $ from 'jquery';
import Cookies from 'js-cookie';
import { uuid } from 'uuidv4';
import { date, time } from '../stringDate';
import EditableService from './EditableService';

var deleting = false;

export default class ServicesInfo extends Component {
    constructor() {
        super();

        this.editServicePopup = this.editServicePopup.bind(this);
        this.deleteService = this.deleteService.bind(this);
        this.filterServices = this.filterServices.bind(this);
        this.addServicePopup = this.addServicePopup.bind(this);

        this.state = {
            services: []
        };
    }

    componentDidMount() {
        $.post(server + '/api/getAllServicesInfo', { token: Cookies.get('token') }, result => {
            if (result.error) {
                setPopupContent('Error', result.error);
                togglePopup(true);
            } else {
                var services = [];
                for (var i in result.services) {
                    services.push(<EditableService service={ result.services[i] } editServicePopup={this.editServicePopup} deleteService={this.deleteService} />);
                }

                this.setState({
                    services: services,
                    filteredServices: services,
                    resources: result.resources
                });
            }
        });
    }

    deleteService(serviceID) {
        deleting  = true;
        if (window.confirm('Are you sure? This will delete all child services as well.')) {
            $.post(server + '/api/deleteService', { token: Cookies.get('token'), id: serviceID }, result => {
                if (result.error) {
                    togglePopup(false);
                    setPopupContent('Error', result.error);
                    togglePopup(true);
                } else {
                    window.location.reload();
                }
            });
        }
    }

    addServicePopup() {
        // Gather options for parent and resource select
        var options = [<option service={null}>No parent</option>], parentIndex = 0;
        var resourceOptions = [], resourceIndex = 0;
        for (var i in this.state.services) {
            options.push(<option service={this.state.services[i].props.service.id}>{this.state.services[i].props.service.name}</option>);
        }
        for (var i in this.state.resources) {
            resourceOptions.push(<option resource={this.state.resources[i].id}>{this.state.resources[i].name}</option>);
        }

        var content = <div id="edit-service-popup">
            <div className="form-row">
                <div className="form-group col-md-12">
                    <label>Name</label>
                    <input className="form-control" id="nameField" />
                </div>
            </div>
            <div className="form-row">
                <div className="form-group col-md-12">
                    <label>Price</label>
                    <input className="form-control col-md-4" id="priceDollarField" />
                    /
                    <input className="form-control col-md-4" id="pricePerField" />
                </div>
            </div>
            <div className="form-row">
                <div className="form-group col-md-12">
                    <label>Subtitle</label>
                    <input className="form-control" id="subtitleField" />
                </div>
            </div>
            <div className="form-row">
                <div className="form-group col-md-12">
                    <label>Point 1</label>
                    <input className="form-control" id="point1Field" />
                </div>
            </div>
            <div className="form-row">
                <div className="form-group col-md-12">
                    <label>Point 2</label>
                    <input className="form-control" id="point2Field" />
                </div>
            </div>
            <div className="form-row">
                <div className="form-group col-md-12">
                    <label>Point 3</label>
                    <input className="form-control" id="point3Field" />
                </div>
            </div>
            <div className="form-row">
                <div className="form-group col-md-12">
                    <label>Set Parent</label>
                    <select className="form-control" id="parentSelect">
                        { options }
                    </select>
                </div>
            </div>
            <div className="form-row">
                <div className="form-group col-md-12">
                    <label>Resource</label>
                    <select className="form-control" id="resourceSelect">
                        { resourceOptions }
                    </select>
                </div>
            </div>
            <div className="form-row">
                <div className="form-group col-md-12">
                    <label>Type</label>
                    <select className="form-control" id="typeSelect">
                        <option>Class</option>
                        <option>Open</option>
                    </select>
                </div>
            </div>
            <div className="form-row">
                <div className="form-group col-md-12">
                    <label>Membership</label>
                    <input id="memberCheck" className="form-control" type="checkbox" />
                </div>
            </div>
            <div className="form-row">
                <div className="form-group col-md-12">
                    <label>Duration</label>
                    <select className="form-control" id="durationSelect">
                        <option>1/2 Hour</option>
                        <option>1 Hour</option>
                        <option>2 Hours</option>
                        <option>3 Hours</option>
                        <option>4 Hours</option>
                        <option>5 Hours</option>
                        <option>6 Hours</option>
                        <option>7 Hours</option>
                        <option>8 Hours</option>
                    </select>
                </div>
            </div>
            <div className="form-row">
                <div className="form-group col-md-12">
                    <label>Disabled?</label>
                    <input id="disableCheck" className="form-control" type="checkbox" />
                </div>
            </div>
        </div>;

        togglePopup(false);
        setHTMLContent('Add Service', content, '', false, [() => {
            // Get all fields
            var parentSelect = document.getElementById('parentSelect');
            var resourceSelect = document.getElementById('resourceSelect');
            var disabled = document.getElementById('disableCheck').checked;
            var parent = parentSelect.options[parentSelect.selectedIndex].getAttribute('service');
            resourceSelect.selectedIndex = resourceIndex;
            var description = JSON.stringify([
                document.getElementById('subtitleField').value,
                document.getElementById('point1Field').value,
                document.getElementById('point2Field').value,
                document.getElementById('point3Field').value
            ]);
            description = description.substr(1, description.length);
            description = description.substr(0, description.length - 1);
            var typeSelect = document.getElementById('typeSelect');
            var durationSelect = document.getElementById('durationSelect');
            var duration = durationSelect.options[durationSelect.selectedIndex].innerHTML.split(' ')[0];
            duration = duration === '1/2' ? 0.5 : parseInt(duration);

            var postData = {
                token: Cookies.get('token'),
                name: document.getElementById('nameField').value,
                price: document.getElementById('priceDollarField').value + '/' + document.getElementById('pricePerField').value,
                description: description,
                parent: parent ? parent : 'null',
                resource: resourceSelect.options[resourceSelect.selectedIndex].getAttribute('resource'),
                disabled: disabled,
                membership: document.getElementById('memberCheck').checked,
                type: typeSelect.options[typeSelect.selectedIndex].innerHTML.toLowerCase(),
                duration: duration
            };
            $.post(server + '/api/addService', postData, result => {
                if (result.error) {
                    togglePopup(false);
                    setPopupContent('Error', result.error);
                    togglePopup(true);
                } else {
                    window.location.reload();
                }
            });
        }, 'Add']);
        togglePopup(true);
    }

    editServicePopup(service) {
        // Gather options for parent and resource select
        var options = [<option service={null}>No parent</option>], parentIndex = 0;
        var resourceOptions = [], resourceIndex = 0;
        for (var i in this.state.services) {
            options.push(<option service={this.state.services[i].props.service.id}>{this.state.services[i].props.service.name}</option>);
            if (this.state.services[i].props.service.id === service.parent) {
                parentIndex = i+1;
            }
        }
        for (var i in this.state.resources) {
            resourceOptions.push(<option resource={this.state.resources[i].id}>{this.state.resources[i].name}</option>);
            if (this.state.resources[i].id === service.resource_id) {
                resourceIndex = i;
            }
        }

        var content = <div id="edit-service-popup">
            <div className="form-row">
                <div className="form-group col-md-12">
                    <label>Name</label>
                    <input className="form-control" id="nameField" />
                </div>
            </div>
            <div className="form-row">
                <div className="form-group col-md-12">
                    <label>Price</label>
                    <input className="form-control col-md-4" id="priceDollarField" />
                    /
                    <input className="form-control col-md-4" id="pricePerField" />
                </div>
            </div>
            <div className="form-row">
                <div className="form-group col-md-12">
                    <label>Subtitle</label>
                    <input className="form-control" id="subtitleField" />
                </div>
            </div>
            <div className="form-row">
                <div className="form-group col-md-12">
                    <label>Point 1</label>
                    <input className="form-control" id="point1Field" />
                </div>
            </div>
            <div className="form-row">
                <div className="form-group col-md-12">
                    <label>Point 2</label>
                    <input className="form-control" id="point2Field" />
                </div>
            </div>
            <div className="form-row">
                <div className="form-group col-md-12">
                    <label>Point 3</label>
                    <input className="form-control" id="point3Field" />
                </div>
            </div>
            <div className="form-row">
                <div className="form-group col-md-12">
                    <label>Set Parent</label>
                    <select className="form-control" id="parentSelect">
                        { options }
                    </select>
                </div>
            </div>
            <div className="form-row">
                <div className="form-group col-md-12">
                    <label>Resource</label>
                    <select className="form-control" id="resourceSelect">
                        { resourceOptions }
                    </select>
                </div>
            </div>
            <div className="form-row">
                <div className="form-group col-md-12">
                    <label>Disabled?</label>
                    <input id="disableCheck" className="form-control" type="checkbox" />
                </div>
            </div>
        </div>;

        togglePopup(false);
        setHTMLContent('Edit Service', content, '', false, [() => {
            // Get all fields
            var parentSelect = document.getElementById('parentSelect');
            var resourceSelect = document.getElementById('resourceSelect');
            var disabled = document.getElementById('disableCheck').checked;
            var parent = parentSelect.options[parentSelect.selectedIndex].getAttribute('service');
            resourceSelect.selectedIndex = resourceIndex;
            var description = JSON.stringify([
                document.getElementById('subtitleField').value,
                document.getElementById('point1Field').value,
                document.getElementById('point2Field').value,
                document.getElementById('point3Field').value
            ]);
            description = description.substr(1, description.length);
            description = description.substr(0, description.length - 1);

            var postData = {
                token: Cookies.get('token'),
                id: service.id,
                name: document.getElementById('nameField').value,
                price: document.getElementById('priceDollarField').value + '/' + document.getElementById('pricePerField').value,
                description: description,
                parent: parent ? parent : 'null',
                resource: resourceSelect.options[resourceSelect.selectedIndex].getAttribute('resource'),
                disabled: disabled
            };
            $.post(server + '/api/editService', postData, result => {
                if (result.error) {
                    togglePopup(false);
                    setPopupContent('Error', result.error);
                    togglePopup(true);
                } else {
                    window.location.reload();
                }
            });
        }, 'Edit']);
        togglePopup(true);

        document.getElementById('parentSelect').selectedIndex = parentIndex;

        document.getElementById('nameField').value = service.name;
        document.getElementById('priceDollarField').value = service.price.split('/')[0];
        document.getElementById('pricePerField').value = service.price.split('/')[1];
        document.getElementById('subtitleField').value = service.description[0];
        document.getElementById('point1Field').value = service.description[1];
        document.getElementById('point2Field').value = service.description[2];
        document.getElementById('point3Field').value = service.description[3];
        document.getElementById('disableCheck').checked = service.disabled;
    }

    filterServices() {
        var serviceName = document.getElementById('nameSearchField').value;
        var data = this.state.services;
        data = data.filter(service => { return service.props.service.name.toLowerCase().includes(serviceName.toLowerCase()) });
        this.setState(prevState => {
            return {
                services: prevState.services,
                filteredServices: data
            }
        })
    }

    render() {
        return (
            <div className="text-center">
                <h3 style={{margin: "1em"}}>Services Management</h3>
                <div className="form-group">
                    <input id="nameSearchField" className="form-control" onChange={this.filterServices} placeholder="Search" style={{width: "20%", margin: "0 auto"}} />
                </div>
                <div className="form-group">
                    <button className="btn btn-primary" onClick={this.addServicePopup}>Add Service</button>
                </div>
                <div id="service-container">
                    { this.state.filteredServices }
                </div>
            </div>
        )
    }
}
