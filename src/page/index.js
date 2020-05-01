import React from 'react';
import ReactDom from 'react-dom';
import axios from 'axios';
import Main from './compile';

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
    ReactDom.render(<Main init={res.data} />, document.getElementById('app'));
}).catch((err) => {
    console.warn(err);
});