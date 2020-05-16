/**
 * @description 图片组件
 */
import React from 'react';
import './index.less';

export default class Image extends React.PureComponent {
    openLink() {
        const { link, blank, env } = this.props;

        if (env === 'edit') {
            return;
        }
        window.open(link, blank ? '_blank' : '_self');
    }

    render() {
        const { src } = this.props;

        return <img className="wp-img" src={src} onClick={this.openLink.bind(this)} />;
    }
}