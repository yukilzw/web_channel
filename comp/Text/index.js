import React from 'react';

export default class Text extends React.Component {
    static defaultProps = {
        text: '默认文本'
    };

    render() {
        const { text } = this.props;

        return <p className="text">{text}</p>;
    }
}