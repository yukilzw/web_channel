import React, { useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import storeContext from '../context';
import Page from '../compile';
import Option, { initStylesItemArr } from './option';
import { searchInitStatus, Enum } from './searchStatus';

let targetCmpDom;

let dragCmpConfig;

const Edit = () => {
    const { state, dispatch } = useContext(storeContext);
    const root = 'root';

    useEffect(() => {
        getCompMenu();
    }, []);

    useEffect(() => {
        state.menu && bindEditDomEvent();
    }, [state.menu]);

    const bindEditDomEvent = useCallback(() => {
        document.addEventListener(`CUSTOM_handleDragOver`, (e) => handleEventCallBack('in', e), false);
        document.addEventListener(`CUSTOM_handleDragleave`, (e) => handleEventCallBack('out', e), false);
        document.addEventListener(`CUSTOM_handleDrop`, (e) => handleEventCallBack('drop', e), false);
        document.addEventListener(`CUSTOM_handleClick`, (e) => handleEventCallBack('click', e), false);
        document.addEventListener('click', clearChooseCmp, false);
    });

    const getCompMenu = useCallback(() => {
        axios({
            method: 'post',
            url: 'http://localhost:1235/getCompMenu'
        }).then(({ data: res }) => {
            if (res.error !== 0) {
                console.warn(res.msg);
                return;
            }
            dispatch({
                type: 'EDIT_MENU',
                payload: res.data
            });
        });
    });

    const clearChooseCmp = () => {
        if (targetCmpDom) {
            targetCmpDom.classList.remove('chooseIn');
            targetCmpDom = null;
        }
        dispatch({
            type: 'EDIT_CHOOSE_CMP',
            payload: { choose: null }
        });
    };

    const handleEventCallBack = useCallback((type, e) => {
        const el = e.detail;

        targetCmpDom = document.querySelector(`#${el}`);

        if (type === 'in') {
            targetCmpDom.classList.add('dragIn');
        } else if (type === 'out') {
            targetCmpDom.classList.remove('dragIn');
        } else if (type === 'drop') {
            targetCmpDom.classList.remove('dragIn');
            putCmpIntoArea();
        } else if (type === 'click') {
            const currentChoose = document.querySelector('.chooseIn');

            currentChoose && currentChoose.classList.remove('chooseIn');
            targetCmpDom.classList.add('chooseIn');

            chooseCurrentCmpOption(el);
        }
    });

    const chooseCurrentCmpOption = useCallback(async () => {
        const { init } = state;

        const config = await searchInitStatus(init, targetCmpDom.id, Enum.choose);

        const optionArr = [];
        const propsArr = [];

        state.menu[config.name].staticProps.forEach(item => {
            if (config.props[item.prop]) {
                propsArr.push({
                    ...item,
                    value: config.props[item.prop]
                });
            } else {
                propsArr.push({
                    ...item,
                    value: ''
                });
            }
        });

        initStylesItemArr.forEach(item => {
            if (config.style[item.styleName]) {
                optionArr.push({
                    ...item,
                    value: config.style[item.styleName]
                });
            } else {
                optionArr.push({
                    ...item,
                    value: ''
                });
            }
        });

        dispatch({
            type: 'EDIT_CHOOSE_CMP',
            payload: {
                tabIndex: 0,
                choose: config,
                optionArr,
                propsArr
            }
        });
    });

    const putCmpIntoArea = useCallback(async () => {
        const { init } = state;

        const compJson = {
            hook: `http://localhost:1235/dist/${dragCmpConfig.compName}.js`,
            name: dragCmpConfig.compName,
            style: dragCmpConfig.defaultStyles,
            props: {}
        };

        let newInit = init;

        if (targetCmpDom.id === root) {
            if (init.length === 0) {
                init.push(
                    Object.assign(compJson, { el: 'bc1' })
                );
            } else {
                const { el: lastEl } = init[init.length - 1];

                init.push(
                    Object.assign(compJson, { el: `bc${Number(lastEl.slice(2)) + 1}` })
                );
            }
        } else {
            newInit = await searchInitStatus(init, targetCmpDom.id, compJson);
        }

        dispatch({
            type: 'UPDATE_INIT',
            payload: newInit
        });
    });

    const chooseDragComp = useCallback((compName, config) => {
        clearChooseCmp();
        dragCmpConfig = Object.assign(config, { compName });
    });

    const dragEvent = {
        onDragOver: state.event.handleDragOver.bind(this, root),
        onDragLeave: state.event.handleDragleave.bind(this, root),
        onDrop: state.event.handleDrop.bind(this, root)
    };

    const optionBoxPropagation = (e) => {
        e.nativeEvent.stopImmediatePropagation();
    };

    return <>
        <ul className="cmpList">
            {
                state.menu && Object.entries(state.menu).map(([compName, config]) => <li
                    key={compName}
                    className="item"
                    draggable="true"
                    onDragStart={() => chooseDragComp(compName, config)}
                >{config.name}</li>)
            }
        </ul>
        <div
            id={root}
            className="board"
            {...dragEvent}
        >
            <Page />
        </div>
        <div className="option"
            onClick={optionBoxPropagation}
        >
            <Option />
        </div>
    </>;
};

export default Edit;