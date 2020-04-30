import React from 'react';

export default class View extends React.Component {
    render() {
        const { children } = this.props;

        return <div className="view">{children}</div>;
    }
}