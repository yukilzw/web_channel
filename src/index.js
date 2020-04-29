import React from 'react';
import ReactDom from 'react-dom';

class Main extends React.Component {
    state = {
        LazyComponent: null
    }
    componentDidMount() {
        /* const script = document.createElement("script");
        script.type = "text/javascript";
        script.onload = () => {
                callback();
        }
        script.src = 'http://localhost:1236/static/dist/Guess_5ec47.js';
        document.getElementsByTagName("head")[0].appendChild(script); */
        import(/* webpackChunkName: 'Guess' */'./Guess').then(({ default: LazyComponent }) => {
            this.setState({ LazyComponent });
        });
    }
    render() {
        const { LazyComponent } = this.state;

        return LazyComponent ? <LazyComponent /> : null;
    }
}

ReactDom.render(<Main />, document.getElementById('react-app'));