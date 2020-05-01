import React from 'react';
import ReactDom from 'react-dom';
import './index.less';
import axios from 'axios';
import Main from '../page/compile';

window.ENV = 'edit';

class Edit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            menu: [],
            init: props.init
        };
        this.dragEndDom;
        this.dragCmp;
    }

    componentDidMount() {
        document.addEventListener(`dragIntoCmp`, this.dragCmp.bind(this, 'in'), false);
        document.addEventListener(`dragLeaveCmp`, this.dragCmp.bind(this, 'out'), false);
        document.addEventListener(`dragDrop`, this.dragCmp.bind(this, 'drop'), false);
        this.getCurrentComp();
    }

    dragCmp = (type, e) => {
        this.dragEndDom = document.querySelector(`#${e.detail}`);

        if (type === 'in') {
            this.dragEndDom.classList.add('dragIn');
        } else if (type === 'out') {
            this.dragEndDom.classList.remove('dragIn');
        }
    };

    putCmpIntoArea() {
        const { init } = this.state;

        const compJson = {
            hook: `http://localhost:1235/dist/${this.dragCmp.compName}.js`,
            name: this.dragCmp.compName,
            style: this.dragCmp.defaultStyles,
            props: {}
        };

        this.updateInitStatus(init, this.dragEndDom.id, compJson);
        this.setState({ init });
    }

    chooseDragComp(config) {
        this.dragCmp = config;
    }

    updateInitStatus(arr, el, compJson) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].el === el) {
                if (Array.isArray(arr[i].children)) {
                    const { el: lastEl } = arr[i].children[arr[i].children.length - 1];
                    const lastElArr = lastEl.split('-');

                    lastElArr.splice(lastElArr.length - 1, 1, Number(lastElArr[lastElArr.length - 1]) + 1);
                    const nextEl = lastElArr.join('-');

                    arr[i].children.push(
                        Object.assign(compJson, { el: nextEl })
                    );
                } else {
                    const { el: parentEl } = arr[i];

                    arr[i].children = [
                        Object.assign(compJson, { el: `${parentEl}-1` })
                    ];
                }
                return;
            }
            if (Array.isArray(arr[i].children)) {
                this.updateInitStatus(arr[i].children, el, compJson);
            }
        }
    }

    getCurrentComp() {
        axios({
            method: 'post',
            url: 'http://localhost:1235/getCurrentComp'
        }).then(({ data: res }) => {
            if (res.error !== 0) {
                console.warn(res.msg);
                return;
            }
            this.setState({
                menu: res.data
            });
        }).catch((err) => {
            console.warn(err);
        });
    }

    render() {
        const { init, menu } = this.state;

        return <>
            <ul className="cmpList">
                {
                    menu.map((config) => <li
                        key={config.compName}
                        className="item"
                        draggable="true"
                        onDragStart={this.chooseDragComp.bind(this, config)}
                        onDragEnd={this.putCmpIntoArea.bind(this)}
                    >{config.name}</li>)
                }
            </ul>
            <div className="board">
                <Main init={init}></Main>
            </div>
            <div className="config"></div>
        </>;
    }
}

axios({
    method: 'post',
    url: 'http://localhost:1235/loadPage',
    data: {
        id: 100
    }
}).then(({ data: res }) => {
    if (res.error !== 0) {
        console.warn(res.msg);
        return;
    }
    ReactDom.render(<Edit init={res.data} />, document.getElementById('edit'));
}).catch((err) => {
    console.warn(err);
});