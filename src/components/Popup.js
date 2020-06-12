import React from 'react'
import { togglePopup } from './popupMethods';

export default function Popup() {
    return (
        <div className="popup" id="popup">
            <h5>title</h5>
            <div id="popup-content"></div>
            <div id="popup-footer">
                <button id="popupCloseBtn" className="btn btn-secondary" onClick={() => togglePopup(false)}>Close</button>
            </div>
        </div>
    )
}
