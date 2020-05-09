import React from 'react'
import { uuid } from 'uuidv4';

export default function Membership(props) {
    var priceData = props.membership.price.split('/');
    var subtitle = props.membership.description[0];
    var bullets = props.membership.description.slice(1);

    var buttonClass = 'btn btn-secondary';
    var buttonText = 'Login';
    if (props.userMembership > 0) {
        if (props.userMembership === props.id) {
            // User already has this membership
            buttonClass = 'btn btn-danger';
            buttonText = 'Cancel';
        } else if (props.userMembership > props.id) {
            // This membership is a downgrade for the user
            buttonClass = 'btn btn-secondary';
            buttonText = 'Downgrade';
        } else {
            // This membership is an upgrade for the user
            buttonClass = 'btn btn-primary';
            buttonText = 'Upgrade';
        }
    }
    props.membership.buttonText = buttonText;
    var serviceHighlight = null;
    var serviceBorder = '1px solid black';
    if (props.membership.tag) {
        serviceHighlight = <div className="service-highlight" >{props.membership.tag}</div>;
        serviceBorder = '6px solid rgb(0,0,139)';

    }

    return (
        <div className="service" style={{border: serviceBorder, paddingBottom: '5%'}}>
            {(serviceHighlight) ? serviceHighlight : <></>}
            <div className="service-header">
                <h2>{props.membership.name}</h2>
            </div>
            <div className="service-text">
                <div className="service-price-text">
                    <p className="service-dollar">$</p>
                    <p className="service-price">{priceData[0]}</p>
                    <p className="service-price-per">/{priceData[1]}</p>
                    <div className="service-subprice">{priceData[2]}</div>
                </div>
                <h4>{subtitle}</h4>
                <h4>Benefits Include:</h4>
                {bullets.map(bullet => {
                    return <p key={uuid()}>
                        &bull;{bullet}
                    </p>
                })}
            </div>
            <div className="service-footer">
                <button className={buttonClass} onClick={() => props.handleClick(props.membership)} >{buttonText}</button>
            </div>
        </div>
    )
}
