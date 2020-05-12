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
/**
 * window.comp[name]可能为三种状态：
 * 尚未请求组件js：undefined
 * 正在请求组件js：Prmise
 * 已经缓存组件js：component Object
 */
export const loadAsync = (name, hook) => {
    if (!window.comp[name]) {
        window.comp[name] = new Promise((resolve) => {
            const script = document.createElement('script');

            script.type = 'text/javascript';
            script.onload = () => {
                window.comp[name] = window[name];
                delete window[name];
                resolve(window.comp[name]);
            };
            script.src = hook;
            document.getElementsByTagName('head')[0].appendChild(script);
        });
    }
    // 这里既有可能返回请求Promise，也有可能返回已缓存组件对象，调用loadAsync时使用await不需要区分，自动包裹成Proimse
    return window.comp[name];
};