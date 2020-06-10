import React, { Component } from 'react'
import server from '../fetchServer';
import { setPopupContent, togglePopup } from './popupMethods';
import $ from 'jquery';
import Cookies from 'js-cookie';

export default class Clocking extends Component {
    componentDidMount() {
        var input = document.getElementById('cardInput');
        var button = document.getElementById('mainBtn');
        input.focus();
        input.addEventListener('change', () => {
            button.innerHTML = 'Checking...';
            button.className = 'btn btn-warning mt-5 mx-auto';
            setTimeout(() => {
                $.post(server + '/api/clockEmployee', { token: Cookies.get('token'), card: input.value }, result => {
			console.log(result);
                    if (result.error) {
                        setPopupContent('Error', result.error);
                        togglePopup(true);
                    } else {
                        if (result.status === 0) {
                            button.innerHTML = 'No Employee Found';
                            button.className = 'btn btn-dark mt-5 mx-auto';
                            setTimeout(() => {
                                window.location.reload();
                            }, 2000);
                        } else {
                            button.innerHTML = 'Clocking ' + result.status + ' - ' + result.fullName;
                            button.className = 'btn btn-success mt-5 mx-auto';
                            setTimeout(() => {
                                window.location.reload();
                            }, 2000);
                        }
                    }
                });
            }, 1500);
        });
    }

    render() {
        return (
            <div className="text-center">
                <button id="mainBtn" className="btn btn-secondary mt-5 mx-auto" style={{display: 'block', fontSize: '1.5em', minWidth: '25%'}}>Scan Card</button>
                <input id="cardInput" style={{opacity: '0'}} />
            </div>
        )
    }
}
