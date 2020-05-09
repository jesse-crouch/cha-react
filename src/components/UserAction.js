import React from 'react'

export default function UserAction(props) {
    return (
        <div className="user-action card" onClick={() => {
            window.location.replace('/' + props.link);
        }}>
            {props.icon}
            <div className="user-action-info">
                <h2>{props.title}</h2>
                <p>{props.description}</p>
            </div>
        </div>
    )
}
