/**
 * @description 页面打包总入口
 */
import { Headers, DOMIN } from '../global';
import React from 'react';
import ReactDom from 'react-dom';
import App from '../reducer';
import Page from './compile';
import './index.less';

window.ENV = 'page';

// 拉取当前页面的JSON配置后再渲染页面
fetch(DOMIN + '/loadPage', {
    method: 'POST',
    headers: Headers.json
}).then(response => response.json()).then(res => {
    if (res.error !== 0) {
        console.warn(res.msg);
        return;
    }
    // 这里直接通过compile渲染页面，无需加载编辑器edit内任何组件，减小打包体积
    ReactDom.render(
        <App
            tree={res.data}
        >
            <Page />
        </App>
        , document.getElementById('app')
    );
});