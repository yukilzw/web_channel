import React from 'react';
import './index.less';

export default class View extends React.Component {
    render() {
        const { children } = this.props;

        return <div className="wp-view">{children}</div>;
    }
}