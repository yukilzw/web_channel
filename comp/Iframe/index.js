/**
 * @description iframe组件
 */
import React from 'react';
import './index.less';

export default class Iframe extends React.PureComponent {
    render() {
        const { scrolling, src, env } = this.props;
        const inEdit = env === 'edit';

        return <iframe
            className={`wp-iframe ${inEdit ? 'edit' : ''}`}
            src={src}
            scrolling={scrolling ? 'auto' : 'no'}
            frameBorder="0"
            allowFullScreen></iframe>;
    }
}