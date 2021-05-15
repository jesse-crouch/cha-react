import React, { Component } from 'react';
import server from '../fetchServer'
import { togglePopup, setPopupContent, setHTMLContent } from './popupMethods';
import $ from 'jquery';
import Cookies from 'js-cookie';
import { uuid } from 'uuidv4';
import { date, time } from '../stringDate';

export default class Resources extends Component {
    constructor() {
        super();

        this.state = {
            resources: []
        };
    }

    componentDidMount() {
        $.post(server + '/api/getAllResources', { token: Cookies.get('token') }, result => {
            if (result.error) {
                setPopupContent('Error', result.error);
                togglePopup(true);
            } else {
                this.setState({
                    resources: result.resources.map(resource => { return this.newRow(resource) })
                }, () => {
                    console.log(this.state.resources);
                });
            }
        });
    }

    deleteResource(button) {
        $.post(server + '/api/deleteResource', { token: Cookies.get('token'), id: button.target.getAttribute('resource') }, result => {
            if (result.error) {
                setPopupContent('Error', result.error);
                togglePopup(true);
            } else {
                if (window.confirm('Are you sure?')) {
                    togglePopup(false);
                    window.location.reload();
                }
            }
        });
    }

    updateResource(button) {
        var start = button.target.parentElement.children[1].value;
        var end = button.target.parentElement.children[2].value;

        if (start.includes('PM')) {
            var hour = parseInt(start.split(' ')[0].split(':')[0]);
            start = (hour+12) + ':' + start.split(' ')[0].split(':')[1];
        } else {
            start = start.split(' ')[0];
        }
        if (end.includes('PM')) {
            var hour = parseInt(end.split(' ')[0].split(':')[0]);
            end = (hour+12) + ':' + end.split(' ')[0].split(':')[1];
        } else {
            end = end.split(' ')[0];
        }

        console.log(start + ',' + end);

        /*$.post(server + '/api/updateResource', {
            token: Cookies.get('token'),
            id: button.target.getAttribute('resource'),
            start: start,
            end: end
        }, result => {
            if (result.error) {
                setPopupContent('Error', result.error);
                togglePopup(true);
            } else {
                togglePopup(false);
                window.location.reload();
            }
        });*/
    }

    newRow(resource) {
        return <tr id={'r-' + resource.id} key={uuid()}>
            <td>{resource.name}</td>
            <td><button className="btn btn-outline-danger" resource={resource.id} onClick={(e) => this.deleteResource(e)}>X</button></td>
        </tr>;
    }

    addResourcePopup() {
        var content = <div>
            <div className="form-row">
                <div className="form-group col-md-12">
                    <label>Resource Name</label>
                    <input className="form-control" id="nameField" />
                </div>
            </div>
        </div>;

        setHTMLContent('New Resource', content, '', false, [() => {
            // Add Resource
            $.post(server + '/api/addResource', { token: Cookies.get('token'), name: document.getElementById('nameField').value }, result => {
                if (result.error) {
                    setPopupContent('Error', result.error);
                    togglePopup(true);
                } else {
                    togglePopup(false);
                    window.location.reload();
                }
            })
        }, 'Add Resource']);
        togglePopup(true);
    }

    render() {
        /*var rows = [];
        for (var i in this.state.resourceData) {
            rows.push(this.newRow(this.state.resourceData[i]));
        }
        console.log(rows);*/

        return (
            <div className="text-center">
                <h3 style={{margin: "1em"}}>Resource Information</h3>
                <div className="form-group">
                    <button className="btn btn-primary" onClick={this.addResourcePopup}>Add Resource</button>
                </div>
                <table className="table table-striped w-75" style={{margin: "0 auto 4em auto"}}>
                    <thead className="thead thead-dark">
                        <tr>
                            <th>Resource Name</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody id="resourceTable">{ this.state.resources }</tbody>
                </table>
            </div>
        )
    }
}
