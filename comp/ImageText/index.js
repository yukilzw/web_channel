/**
 * @description 图文复合组件
 * 这是一个演示案例，开发一个含有子组件的组件，在json配置中defaultChildren添加配置
 */
import React from 'react';

export default class ImageText extends React.PureComponent {
    render() {
        const { children } = this.props;

        return <div className="wp-imageText">{children}</div>;
    }
}