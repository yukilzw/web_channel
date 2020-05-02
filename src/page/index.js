import '../global';
import React from 'react';
import ReactDom from 'react-dom';
import axios from 'axios';
import App from '../reducer';
import Page from '../compile';

window.ENV = 'page';

axios({
    method: 'post',
    url: '/loadPage',
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
        >
            <Page />
        </App>
        , document.getElementById('app')
    );
});