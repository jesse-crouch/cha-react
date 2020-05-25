import React, { Component } from 'react';
import server from '../fetchServer'
import { togglePopup, setPopupContent } from './popupMethods';
import $ from 'jquery';
import Cookies from 'js-cookie';
import { uuid } from 'uuidv4';
import { date } from '../stringDate';

export default class SalesInfo extends Component {
    constructor() {
        super();

        this.state = {
            salesData: [],
            activeSalesData: []
        };
        this.filterTable = this.filterTable.bind(this);
    }

    componentDidMount() {
        $.post(server + '/api/getAllSales', { token: Cookies.get('token') }, result => {
            if (result.error) {
                setPopupContent('Error', result.error);
                togglePopup(true);
            } else {
                var salesData = [], activeSalesData = [];
                for (var i in result.sales) {
                    salesData.push(result.sales[i]);
                    activeSalesData.push(result.sales[i]);
                }
                this.setState({
                    salesData: salesData,
                    activeSalesData: activeSalesData
                });
            }
        });
    }

    newRow(sale) {
        return <tr id={'r-' + sale.id} key={uuid()}>
            <td>{sale.name}</td>
            <td>{sale.email}</td>
            <td>{sale.child_name}</td>
            <td>{sale.service_name}</td>
            <td>{date(new Date(sale.date))}</td>
            <td>{sale.amount_due}</td>
            <td>{sale.base_price}</td>
            <td>{sale.tax}</td>
            <td>{sale.total}</td>
        </tr>;
    }

    filterTable() {
        var name = document.getElementById('nameInput').value;
        var service = document.getElementById('serviceInput').value;
        var month = document.getElementById('monthInput').value;
        var year = document.getElementById('yearInput').value;

        var data = this.state.salesData;
        if (name.length > 0) {
            data = data.filter(sale => { return sale.name.toLowerCase().includes(name) || sale.child_name.toLowerCase().includes(name) });
        }
        if (service.length > 0) {
            data = data.filter(sale => { return sale.serviceName.toLowerCase().includes(service) });
        }
        if (month.length > 0) {
            data = data.filter(sale => { return new Date(sale.date).getMonth() === parseInt(month)-1 });
        }
        if (year.length > 0) {
            data = data.filter(sale => { return new Date(sale.date).getFullYear() === parseInt(year) });
        }

        this.setState(prevState => {
            return {
                salesData: prevState.salesData,
                activeSalesData: data
            }
        });
    }

    render() {
        return (
            <div className="text-center">
                <h3 style={{margin: "1em"}}>Sales Information</h3>
                <p>Start typing in any field to instantly filter the table</p>
                <div id="salesFields">
                    <input placeholder="Name" id="nameInput" className="form-control sales-input" onChange={this.filterTable} />
                    <input placeholder="Service" id="serviceInput" className="form-control sales-input" onChange={this.filterTable} />
                    <input placeholder="Month" id="monthInput" className="form-control sales-input" onChange={this.filterTable} />
                    <input placeholder="Year" id="yearInput" className="form-control sales-input" onChange={this.filterTable} />
                </div>
                <div style={{height: '50vh', overflowY: 'scroll'}}>
                    <table className="table table-striped w-75" style={{margin: "0 auto"}}>
                        <thead className="thead thead-dark">
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Child Name</th>
                                <th>Service</th>
                                <th>Date</th>
                                <th>Amount Due</th>
                                <th>Base Price</th>
                                <th>Tax</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody id="salesTable">{this.state.activeSalesData.map(sale => {
                            return this.newRow(sale);
                        })}</tbody>
                    </table>
                </div>
            </div>
        )
    }
}
