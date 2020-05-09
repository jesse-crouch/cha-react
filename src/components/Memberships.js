import React, { Component } from 'react'
import server from '../fetchServer';
import { uuid } from 'uuidv4';
import Membership from './Membership';
import $ from 'jquery';
import Cookies from 'js-cookie';
import { addNonEventToCart } from './cartMethods';

export default class Memberships extends Component {
    constructor() {
        super();

        this.state = {
            memberships: []
        };
    }

    componentDidMount() {
        // Fetch the memberships
        $.get(server + '/api/getMemberships', result => {
            if (Cookies.get('token')) {
                // Client is logged in, fetch payload information
                $.post(server + '/api/getPayload', { token: Cookies.get('token') }, payloadResult => {
                    // Check for existing membership
                    if (payloadResult.payload.membership > 0) {
                        this.setupMemberships(result.memberships, payloadResult.payload.membership);
                    } else {
                        this.setupMemberships(result.memberships);
                    }
                });
            } else {
                // Client is not logged in, establish default memberships
                this.setupMemberships(result.memberships);
            }
        });
    }

    setupMemberships(memberships, userMembership = 0) {
        this.setState({
            memberships: memberships.map(membership => {
                return <Membership id={membership.id} key={uuid()} membership={membership} userMembership={userMembership} handleClick={this.handleClick} />;
            })
        });
    }

    handleClick(membership) {
        // Add membership to cart
        if (membership.buttonText === 'Login') {
            window.location.replace('/login');
        } else if (membership.buttonText === 'Upgrade') {
            addNonEventToCart(membership, true);
        } else if (membership.buttonText === 'Downgrade') {
            addNonEventToCart(membership, true);
        } else if (membership.buttonText === 'Cancel') {
            membership.cancel = true;
            addNonEventToCart(membership, true);
        } else {
            addNonEventToCart(membership, true);
        }
    }

    render() {
        return (
            <div id="services-page">
                <h1>Choose Your Membership</h1>
                <div id="services">
                    { this.state.memberships }
                </div>
            </div>
        )
    }
}
