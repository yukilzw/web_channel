/**
 * @description 全局配置依赖
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