/**
 * @description iframe组件
 */
import React from 'react';
import './index.less';

export default class Iframe extends React.PureComponent {
    static defaultProps = {
        scrolling: 'auto'
    };

    render() {
        const { scrolling, src, env } = this.props;
        const inEdit = env === 'edit';

        return <iframe
            className={`wp-iframe ${inEdit ? 'edit' : ''}`}
            src={src}
            scrolling={inEdit ? 'no' : scrolling}
            frameBorder="0"
            allowFullScreen></iframe>;
    }
}