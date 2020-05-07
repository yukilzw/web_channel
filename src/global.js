/**
 * @description 全局配置依赖,公共方法
 */
import React from 'react';
import ReactDom from 'react-dom';
import { CONFIG } from '../config';

window.__react__ = React;
window.__reactDOM__ = ReactDom;

export const DOMIN = `${CONFIG.HOST}:${CONFIG.PORT}`;

export const Headers = {
    json: {
        'content-type': 'application/json'
    }
};

// 编译时按需加载组件js文件
export const loadAsync = (name, hook) => new Promise((resolve) => {
    // 如果当前window.comp下有缓存对应的组件函数，就直接返回复用
    if (name in window.comp) {
        resolve(window.comp[name].default);
        return;
    }
    // 否则就实时下载对应组件的js文件，并返回组件函数
    const script = document.createElement('script');

    script.type = 'text/javascript';
    script.onload = () => {
        // 由于在webpack.config.comp.js中打包的每个组件都挂载到window下
        // 组件js加载执行完毕后，可以从window中取出构造函数存入window.comp
        window.comp[name] = window[name];
        delete window[name];
        resolve(window.comp[name].default);
    };
    script.src = hook;
    document.getElementsByTagName('head')[0].appendChild(script);
});