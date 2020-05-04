/**
 * @description 编辑器组件
 * 包含三个模块（组件菜单、页面可视区、属性配置面板）
 * 此外层组件定义了大部分编辑器内事件的函数
 */
import React, { useContext, useEffect, useRef, useCallback, useMemo, useLayoutEffect } from 'react';
import storeContext from '../context';
import { Headers, DOMIN } from '../global';
import Page from '../compile';
import Menu from './menu';
import Option, { initStylesItemArr } from './option';
import { searchInitStatus, Enum } from './searchStatus';
import { creatCustomEvent } from './event';

const root = 'root';

let targetCmpDom;   // 暂存当前编辑事件的目标元素（拖拽释放、点击等）

let dragCmpConfig;  // 选取拖拽菜单内组件时，暂存该组件的默认配置

const Board = () => {
    const { state, dispatch } = useContext(storeContext);
    const stateRef = useRef();

    // 由于hooks自带闭包机制，事件回调函数的异步触发只能最初拿到绑定事件时注入的state
    // 每次状态有改变，就将state存到静态变量stateRef，在事件触发时取改变量代替state
    useEffect(() => {
        stateRef.current = state;
    });

    // 进入编辑器后，等组件菜单接口返回，更新menu状态时，再对全局事件进行绑定注册
    useLayoutEffect(() => {
        state.menu && bindEditDomEvent();
    }, [state.menu]);

    // 防止操作页面属性面板时，点击事件冒泡到document导致当前choose的组件被清空
    const optionBoxPropagation = useCallback((e) => {
        e.nativeEvent.stopImmediatePropagation();
    }, []);

    // 绑定编辑器事件
    const bindEditDomEvent = () => {
        // 拖拽进入后，高亮目标容器选框
        document.addEventListener(`CUSTOM_handleDragOver`, (e) => handleEventCallBack('in', e), false);
        // 拖拽移出目标容器，取消高亮选框
        document.addEventListener(`CUSTOM_handleDragleave`, (e) => handleEventCallBack('out', e), false);
        // 拖拽到目标容器，松开鼠标，将新的组件添加到页面配置中
        document.addEventListener(`CUSTOM_handleDrop`, (e) => handleEventCallBack('drop', e), false);
        // 选中可视区域内的任意组件
        document.addEventListener(`CUSTOM_handleClick`, (e) => handleEventCallBack('click', e), false);
        // 点击屏幕其他位置取消选中组件
        document.addEventListener('click', clearChooseCmp, false);
        // 键盘快捷键自定义
        document.addEventListener(`keydown`, handlekeyDown, false);
    };

    // 清空当前选中的编辑组件
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

    // 键盘事件
    const handlekeyDown = async (e) => {
        // `DEL`键删除选中的可视区组件
        if (e.keyCode === 46) {
            const { choose, tree } = stateRef.current;

            if (!choose) {
                return;
            }
            const nextTree = await searchInitStatus(tree, choose.el, Enum.delete);

            dispatch({
                type: 'EDIT_CHOOSE_CMP',
                payload: { choose: null }
            });
            dispatch({
                type: 'UPDATE_TREE',
                payload: nextTree
            });
        }
    };

    // 自定义事件回调
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

    // 选择组件后，展示编辑面板区内容
    const chooseCurrentCmpOption = async () => {
        const { tree, menu } = stateRef.current;

        const config = await searchInitStatus(tree, targetCmpDom.id, Enum.choose);

        const optionArr = [];   // 固有样式面板style
        const propsArr = [];    // 自定义属性面板props

        // 通过菜单里对应组件类型的JSON配置，来渲染出属性面板
        // 渲染时比对当前组件配置中的props，如果有值就把这个值赋给当前编辑项的默认值，没值就设为空字符串
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

        // 样式面板同理
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
                tabIndex: 0,        // 每次重新选中组件，将操作面板tab切到第一栏
                choose: config,     // 将当前选中的组件配置缓存，方便其他操作直接读取
                optionArr,
                propsArr
            }
        });
    };

    // 释放拖拽，将新组建加入页面配置
    const putCmpIntoArea = async () => {
        const { tree } = stateRef.current;

        // 生成新组件的配置
        const compJson = {
            hook: DOMIN + `/dist/${dragCmpConfig.compName}.js`,
            name: dragCmpConfig.compName,
            style: dragCmpConfig.defaultStyles,
            props: dragCmpConfig.defaultProps
        };

        let nextTree = tree;    // 定义新组建加入后的tree

        // 新组件的id，后面会根据层级结构动态生成
        // 例如 #bc2-1-3，即该组件处于根目录下 -> 第二个元素 -> 第一个子元素 -> 第三个子元素
        let el;

        // 如果拖入的目标区域是根目录
        if (targetCmpDom.id === root) {
            if (tree.length === 0) {
                el = 'bc1';
                tree.push(
                    Object.assign(compJson, { el })
                );
            } else {
                const { el: lastEl } = tree[tree.length - 1];

                el = `bc${Number(lastEl.slice(2)) + 1}`;
                tree.push(
                    Object.assign(compJson, { el })
                );
            }
        // 如果拖入的目标区域的某个组件嵌套
        } else {
            let promiseArr = await searchInitStatus(tree, targetCmpDom.id, Enum.add, compJson);

            nextTree = promiseArr[0];
            el = promiseArr[1];
        }

        dispatch({
            type: 'UPDATE_TREE',
            payload: nextTree
        });
        // 拖入成功后，等待页面DOM渲染，然后自动选中新组建编辑
        // 这里无法得到新组件DOM生成的通知，目前使用定时器，此方法不稳定，待优化
        setTimeout(() => creatCustomEvent(`CUSTOM_handleClick`, el), 100);
    };

    // 选中菜单中的组件开始拖拽时
    const chooseDragComp = (compName, config) => {
        clearChooseCmp();
        // 暂存当前拖拽的组件配置，方便释放的时候直接引用
        dragCmpConfig = Object.assign(config, { compName });
    };

    // 保存页面配置
    const publishPage = useCallback(() => {
        const { tree } = stateRef.current;

        fetch(DOMIN + '/savepage', {
            method: 'POST',
            headers: Headers.json,
            body: JSON.stringify(tree)
        }).then(response => response.json()).then(res => {
            if (res.error !== 0) {
                console.warn(res.msg);
                return;
            }
            if (window.location.search.match('debug=1')) {
                alert('保存成功');
            } else {
                const confirmChoose = confirm('保存成功，是否立即预览？');

                if (confirmChoose) {
                    window.open(`${DOMIN}/page`, '_blank');
                }
            }
        });
    }, []);

    // 除了可视区内每个嵌套组件进行拖入事件绑定（compile.js内）
    // 还要绑定外层board面板的拖入事件，来处理组件拖入页面根节点
    const dragEvent = useMemo(() => ({
        onDragOver: state.event.handleDragOver.bind(this, root),
        onDragLeave: state.event.handleDragleave.bind(this, root),
        onDrop: state.event.handleDrop.bind(this, root)
    }));

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

export default Board;