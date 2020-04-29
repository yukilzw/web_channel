import React from 'react';

export default class Guess extends React.Component {
    state = {
        text: 'YUKI'
    }
    render() {
        const { text } = this.state;

        return <div className="name1">
            <a className="name2">{text}</a>
        </div>;
    }
}