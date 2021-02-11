/**
 * @description 文本组件
 */
import React from 'react';

export default ({
    text, color, fontSize, lineHeight, textAlign, fontWeight
}) => <p className="wp-text" style={{
    color,
    fontSize,
    lineHeight,
    textAlign,
    fontWeight
}}>{text}</p>;