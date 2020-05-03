import { Headers, DOMIN } from '../global';
import React from 'react';
import ReactDom from 'react-dom';
import Board from './board';
import App from '../reducer';
import * as event from './event';
import './style/index.less';

window.ENV = 'edit';

fetch(DOMIN + '/loadPage', {
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
            event={event}
        >
            <Board />
        </App>
        , document.getElementById('edit')
    );
});