import React, { useContext, useEffect, useRef, useCallback, useMemo, useLayoutEffect } from 'react';
import storeContext from '../context';
import { Header } from '../global';
import Page from '../compile';
import Menu from './menu';
import Option, { initStylesItemArr } from './option';
import { searchInitStatus, Enum } from './searchStatus';
import { creatCustomEvent } from './event';

const root = 'root';

let targetCmpDom;

let dragCmpConfig;

const Edit = () => {
    const { state, dispatch } = useContext(storeContext);
    const stateRef = useRef();

    useEffect(() => {
        stateRef.current = state;
    });

    useLayoutEffect(() => {
        state.menu && bindEditDomEvent();
    }, [state.menu]);

    const dragEvent = useMemo(() => ({
        onDragOver: state.event.handleDragOver.bind(this, root),
        onDragLeave: state.event.handleDragleave.bind(this, root),
        onDrop: state.event.handleDrop.bind(this, root)
    }));

    const optionBoxPropagation = useCallback((e) => {
        e.nativeEvent.stopImmediatePropagation();
    }, []);

    const bindEditDomEvent = () => {
        document.addEventListener(`CUSTOM_handleDragOver`, (e) => handleEventCallBack('in', e), false);
        document.addEventListener(`CUSTOM_handleDragleave`, (e) => handleEventCallBack('out', e), false);
        document.addEventListener(`CUSTOM_handleDrop`, (e) => handleEventCallBack('drop', e), false);
        document.addEventListener(`CUSTOM_handleClick`, (e) => handleEventCallBack('click', e), false);
        document.addEventListener('click', clearChooseCmp, false);
        document.addEventListener(`keydown`, deleteCmp, false);
    };

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

    const deleteCmp = async (e) => {
        if (e.keyCode === 46) {
            const { choose, init } = stateRef.current;

            if (!choose) {
                return;
            }
            const newInit = await searchInitStatus(init, choose.el, Enum.delete);

            dispatch({
                type: 'EDIT_CHOOSE_CMP',
                payload: { choose: null }
            });
            dispatch({
                type: 'UPDATE_INIT',
                payload: newInit
            });
        }
    };

    const handleEventCallBack = (type, e) => {
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
    };

    const chooseCurrentCmpOption = async () => {
        const { init, menu } = stateRef.current;

        const config = await searchInitStatus(init, targetCmpDom.id, Enum.choose);

        const optionArr = [];
        const propsArr = [];

        menu[config.name].staticProps.forEach(item => {
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
    };

    const putCmpIntoArea = async () => {
        const { init } = stateRef.current;

        const compJson = {
            hook: window.HOST + `/dist/${dragCmpConfig.compName}.js`,
            name: dragCmpConfig.compName,
            style: dragCmpConfig.defaultStyles,
            props: dragCmpConfig.defaultProps
        };

        let newInit = init;

        let el;

        if (targetCmpDom.id === root) {
            if (init.length === 0) {
                el = 'bc1';
                init.push(
                    Object.assign(compJson, { el })
                );
            } else {
                const { el: lastEl } = init[init.length - 1];

                el = `bc${Number(lastEl.slice(2)) + 1}`;
                init.push(
                    Object.assign(compJson, { el })
                );
            }
        } else {
            let promiseArr = await searchInitStatus(init, targetCmpDom.id, compJson);

            newInit = promiseArr[0];
            el = promiseArr[1];
        }

        dispatch({
            type: 'UPDATE_INIT',
            payload: newInit
        });
        setTimeout(() => creatCustomEvent(`CUSTOM_handleClick`, el), 100);
    };

    const chooseDragComp = (compName, config) => {
        clearChooseCmp();
        dragCmpConfig = Object.assign(config, { compName });
    };

    const publishPage = useCallback(() => {
        const { init } = stateRef.current;

        fetch(window.HOST + '/savepage', {
            method: 'POST',
            headers: Headers.json,
            body: JSON.stringify(init)
        }).then(response => response.json()).then(res => {
            const confirmChoose = confirm(res.msg + '，是否立即预览？');

            if (confirmChoose) {
                console.log(1);
            }
        });
    }, []);

    return <>
        <nav>
            <a className="navBtn" onClick={publishPage}>保存</a>
        </nav>
        <div className="content">
            <ul className="cmpList">
                <Menu chooseDragComp={chooseDragComp}/>
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
        </div>
    </>;
};

export default Edit;