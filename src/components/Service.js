import React, { Component } from 'react'

export default class Service extends Component {
    constructor(props) {
        super();

        this.state = {
            service: props.service
        };
    }

    render() {
        const imgLoc = "./images/" + this.state.service.img;
        const subtitle = this.state.service.description[0].split('^')[0];
        const bullets = this.state.service.description[0].split('^')[1].split('~');

        const priceData = this.state.service.price.split('/');

        return (
            <div id={"service-" + this.state.service.id} className="service" onClick={() => {this.props.handleClick(this.state.service)}}>
                <div className="service-header">
                    <h2>{this.state.service.name}</h2>
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
                        return <p>
                            &bull;{bullet}
                        </p>
                    })}
                </div>
            </div>
        )
    }
}
