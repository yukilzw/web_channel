/**
 * @description 编辑器打包总入口
 */
import { Headers, DOMIN } from '../global';
import React from 'react';
import ReactDom from 'react-dom';
import Board from './board';
import App from '../reducer';
import 'antd/dist/antd.less';
import './style/antd.less';

window.ENV = 'edit';

// 拉取当前页面的JSON配置后再渲染编辑器
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
            tree={res.data}
        >
            <Board />
        </App>
        , document.getElementById('edit')
    );
});