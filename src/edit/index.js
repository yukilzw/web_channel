import '../global';
import React from 'react';
import ReactDom from 'react-dom';
import axios from 'axios';
import Edit from './edit';
import App from '../reducer';
import * as event from './event';
import './style/index.less';

window.ENV = 'edit';

axios({
    method: 'post',
    url: 'http://localhost:1235/loadPage',
    data: {
        id: 100
    }
}).then(({ data: res }) => {
    if (res.error !== 0) {
        console.warn(res.msg);
        return;
    }
    ReactDom.render(
        <App
            init={res.data}
            event={event}
        >
            <Edit />
        </App>
        , document.getElementById('edit')
    );
});