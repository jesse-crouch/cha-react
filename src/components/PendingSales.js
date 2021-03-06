import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import server from '../fetchServer'
import { togglePopup, setPopupContent } from './popupMethods';
import $ from 'jquery';
import Cookies from 'js-cookie';
import { uuid } from 'uuidv4';
import { date } from '../stringDate';

export default class PendingSales extends Component {
    componentDidMount() {
        $.post(server + '/api/getPendingSales', { token: Cookies.get('token') }, result => {
            if (result.error) {
                setPopupContent('Error', result.error);
                togglePopup(true);
            } else {
                var sales = [];
                for (var i in result.sales) {
                    sales.push(this.newRow(result.sales[i]));
                }
                ReactDOM.render(sales, document.getElementById('saleTable'));
                
                var downloadBtn = document.getElementById('downloadBtn');
                downloadBtn.addEventListener('click', () => {
                    var element = document.createElement('a');
                    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(document.getElementById('pendingSales').outerHTML));
                    element.setAttribute('download', 'Pending Sales - ' + date(new Date()) + '.xls');
                    element.style.display = 'none';
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                });
            }
        });
    }

    newRow(sale) {
        var total = sale.price.toFixed(2);
        var subtotal = (total / 1.13).toFixed(2);
        var tax = (subtotal * 0.13).toFixed(2);
        //var saleDate = new Date(sale.epoch_date*1000);

        return <tr id={'r-' + sale.id} key={uuid()}>
            <td>{sale.first_name + ' ' + sale.last_name}</td>
            <td>{sale.email}</td>
            <td>{sale.phone}</td>
            <td>{sale.service_name}</td>
            <td>{subtotal}</td>
            <td>{tax}</td>
            <td>{total}</td>
        </tr>;
    }

    render() {
        return (
            <div className="text-center">
                <h3 style={{margin: "1em"}}>Pending Sales</h3>
                <button className="btn btn-primary ml-1" id="downloadBtn">Download</button>
                <table id="pendingSales" className="table table-striped w-75" style={{margin: "1em auto"}}>
                    <thead className="thead thead-dark">
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Service</th>
                            <th>Subtotal</th>
                            <th>Tax</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody id="saleTable"></tbody>
                </table>
            </div>
        )
    }
}
