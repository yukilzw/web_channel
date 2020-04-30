import React from 'react';
import ReactDom from 'react-dom';
import axios from 'axios';

class Main extends React.Component {
    state = {
        LazyComponent: null
    }
    componentDidMount() {
        const script = document.createElement('script');

        script.type = '/javascript';
        script.onload = () => {
            window.modules.Guess = window.Guess;
            delete window.Guess;
            this.setState({
                LazyComponent: window.modules.Guess.default
            });
        };
        script.src = 'http://localhost:1235/dist/Guess.js';
        document.getElementsByTagName('head')[0].appendChild(script);
    }
    render() {
        const { LazyComponent } = this.state;

        // return LazyComponent ? <LazyComponent /> : null;

        return React.createElement('div', {
            style: { 'width': '100%', 'height': '300px', 'backgroundColor': 'red' }
        });
    }
}

axios({
    method: 'post',
    url: '/loadPage',
    data: {
        id: 100
    }
}).then((response) => {
    console.log(response);

    ReactDom.render(<Main />, document.getElementById('react-app'));
});