import React from 'react';
import ReactDom from 'react-dom';
import './index.less';
// import axios from 'axios';

class Edit extends React.Component {
    render() {
        return <>
            <div className="cmpList"></div>
            <div className="board"></div>
            <div className="config"></div>
        </>;
    }
}

ReactDom.render(<Edit />, document.getElementById('edit'));