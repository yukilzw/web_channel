import React from 'react';
import ReactDom from 'react-dom';

window.__react__ = React;
window.__reactDOM__ = ReactDom;
window.HOST = 'http://localhost:1235';

export const Headers = {
    json: {
        'content-type': 'application/json'
    }
};