import React, { Component } from 'react'
import { date } from '../stringDate';

export default class MembershipInfo extends Component {
    constructor(props) {
        super();
    }

    render() {
        var membershipInfo = [];
        for (var i in this.props.user.memberships) {
            var membership = this.props.user.memberships[i];
            membershipInfo.push({
                membershipName: membership === 1 ? 'Monthly' : membership === 2 ? '6 Months' : 'Yearly',
                expiry: date(new Date(parseInt(this.props.user.membership_expirations[i]*1000))),
                child: this.props.user.children[i]
            });
        }

        return (
            <div>
                <table className="table table-striped">
                    <thead className="thead thead-dark">
                        <tr>
                            <th>Membership</th>
                            <th>Linked To</th>
                            <th>Expires On</th>
                        </tr>
                    </thead>
                    <tbody>{membershipInfo.map(membership => {
                        return <tr>
                            <td>{membership.membershipName}</td>
                            <td>{membership.child}</td>
                            <td>{membership.expiry}</td>
                        </tr>;
                    })}</tbody>
                </table>
            </div>
        )
    }
}
