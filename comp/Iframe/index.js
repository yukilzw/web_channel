/**
 * @description iframe组件
 */
import React from 'react';
import './index.less';

export default ({ scrolling, src, env }) => {
    const inEdit = env === 'edit';

    return <iframe
        className={`wp-iframe ${inEdit ? 'edit' : ''}`}
        src={src}
        scrolling={scrolling ? 'auto' : 'no'}
        frameBorder="0"
        allowFullScreen
    />;
};