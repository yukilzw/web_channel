import React from 'react';

export default class Image extends React.Component {
    openLink() {
        const { link } = this.props;

        window.open(link, '_blank');
    }

    render() {
        const { src } = this.props;

        return <img className="img" src={src} onClick={this.openLink.bind(this)} />;
    }
}