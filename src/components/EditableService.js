import React, { Component } from 'react'
import { FaEdit, FaTimes, FaTimesCircle, FaTrashAlt } from 'react-icons/fa';
import { uuid } from 'uuidv4';

export default class EditableService extends Component {
    render() {
        const imgLoc = "./images/" + this.props.service.img;
        const subtitle = this.props.service.description[0];
        const bullets = this.props.service.description.slice(1);

        const priceData = this.props.service.price.split('/');
        const nameData = this.props.service.name.split(' - ');

    	const headerColour = nameData[nameData.length - 1].includes('Girls') ? '#f784a8' : 'black';

        return (
            <div style={{opacity: this.props.service.disabled ? '40%' : '100%'}} id={"service-" + this.props.service.id} className="service" onClick={() => {this.props.editServicePopup(this.props.service)}}>
                <button className="btn btn-danger service-delete-btn" onClick={() => {this.props.deleteService(this.props.service.id)}}><FaTimes /></button>
                <div className="service-header">
                    <h2 style={{background: headerColour}}>{nameData[nameData.length - 1]}</h2>
                    <img src={imgLoc} alt="img" />
                </div>
                <div className="service-text">
                    <p className="service-low">As low as</p>
                    <div className="service-price-text">
                        <p className="service-dollar">$</p>
                        <p className="service-price">{priceData[0]}</p>
                        <p className="service-price-per">/{priceData[1]}</p>
                    </div>

                    <h4>{subtitle}</h4>
                    {bullets.map(bullet => {
                        return <p key={uuid()}>
                            &bull;{bullet}
                        </p>
                    })}
                    {}
                </div>
            </div>
        )
    }
}
