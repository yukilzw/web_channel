import { Headers } from '../global';
import React from 'react';
import ReactDom from 'react-dom';
import App from '../reducer';
import Page from '../compile';

window.ENV = 'page';

fetch(window.HOST + '/loadPage', {
    method: 'POST',
    headers: Headers.json
}).then(response => response.json()).then(res => {
    if (res.error !== 0) {
        console.warn(res.msg);
        return;
    }
    ReactDom.render(
        <App
            init={res.data}
        >
            <Page />
        </App>
        , document.getElementById('app')
    );
});