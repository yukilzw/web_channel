/**
 * @description 文本组件
 */
import React from 'react';

export default class Text extends React.Component {
    render() {
        const { text, color, fontSize, lineHeight, textAlign } = this.props;

        return <p className="wp-text" style={{
            color,
            fontSize,
            lineHeight,
            textAlign
        }}>{text}</p>;
    }
}