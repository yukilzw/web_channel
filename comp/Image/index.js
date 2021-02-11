/**
 * @description 图片组件
 */
import React from 'react';
import './index.less';

export default ({ link, blank, env, src }) => {
    const openLink = () => {
        if (env === 'edit') {
            return;
        }
        window.open(link, blank ? '_blank' : '_self');
    };

    return <img className="wp-img" src={src} onClick={openLink} />;
};