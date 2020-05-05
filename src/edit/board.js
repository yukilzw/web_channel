/**
 * @description 编辑器组件
 * 包含三个模块（组件菜单、页面可视区、属性配置面板）
 * 此外层组件定义了大部分编辑器内事件的函数
 */
import React, { useContext, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import storeContext from '../context';
import { Headers, DOMIN } from '../global';
import Page from '../compile';
import CompMenu from './menu';
import Option, { initStylesItemArr } from './option';
import { searchTree, EnumEdit } from './searchTree';
import { Layout, Button } from 'antd';
import style from './style/index.less';

const { Header, Sider } = Layout;
const EnumId = { root: 'root' };

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

    // 绑定编辑器事件
    const bindEditDomEvent = () => {
        // 键盘快捷键自定义
        document.addEventListener(`keydown`, handlekeyDown, false);
    };

    // 清空当前选中的编辑组件
    const clearChooseCmp = () => {
        if (targetCmpDom) {
            targetCmpDom.classList.remove(style.chooseIn);
            targetCmpDom = null;
        }
        dispatch({
            type: 'EDIT_CHOOSE_CMP',
            payload: { choose: null }
        });
    };

    // 键盘事件
    const handlekeyDown = (e) => {
        // `DEL`键删除选中的可视区组件
        if (e.keyCode === 46) {
            const { choose, tree } = stateRef.current;

            if (!choose) {
                return;
            }
            const nextTree = searchTree(tree, choose.el, EnumEdit.delete);

            dispatch({
                type: 'EDIT_CHOOSE_CMP',
                payload: { choose: null }
            });
            dispatch({
                type: 'UPDATE_TREE',
                payload: nextTree
            });
        } else if (e.keyCode === 83 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
            e.preventDefault();
            publishPage();
        }
    };

    // 事件回调
    const handleEventCallBack = (type, el, e) => {
        targetCmpDom = document.querySelector(`#${el}`);

        if (type === 'in') {
            e && e.stopPropagation();
            e && e.preventDefault();
            targetCmpDom.classList.add(style.dragIn);
        } else if (type === 'out') {
            e && e.stopPropagation();
            targetCmpDom.classList.remove(style.dragIn);
        } else if (type === 'drop') {
            e && e.stopPropagation();
            targetCmpDom.classList.remove(style.dragIn);
            putCmpIntoArea();
        } else if (type === 'click') {
            e && e.stopPropagation();
            const currentChoose = document.querySelector(`.${style.chooseIn}`);

            currentChoose && currentChoose.classList.remove(style.chooseIn);
            targetCmpDom.classList.add(style.chooseIn);

            chooseCurrentCmpOption(el);
        }
    };

    const handleHoverCallBack = (type, el) => {
        const hoverCmpDom = document.querySelector(`#${el}`);

        if (type === 'hover') {
            hoverCmpDom.classList.add(style.hoverIn);
        } else if (type === 'leave') {
            hoverCmpDom.classList.remove(style.hoverIn);
        }
    };

    // 选择组件后，展示编辑面板区内容
    const chooseCurrentCmpOption = () => {
        const { tree, menu } = stateRef.current;

        const config = searchTree(tree, targetCmpDom.id, EnumEdit.choose);

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
                choose: config,     // 将当前选中的组件配置缓存，方便其他操作直接读取
                optionArr,
                propsArr
            }
        });
    };

    // 释放拖拽，将新组建加入页面配置
    const putCmpIntoArea = () => {
        const { tree } = stateRef.current;

        // 生成新组件的配置
        const compJson = {
            hook: DOMIN + `/comp/${dragCmpConfig.compName}.js`,
            name: dragCmpConfig.compName,
            style: dragCmpConfig.defaultStyles,
            props: dragCmpConfig.defaultProps
        };

        let nextTree = tree;    // 定义新组建加入后的tree

        // 新组件的id，后面会根据层级结构动态生成
        // 例如 #bc2-1-3，即该组件处于根目录下 -> 第二个元素 -> 第一个子元素 -> 第三个子元素
        let el;

        // 如果拖入的目标区域是根目录
        if (targetCmpDom.id === EnumId.root) {
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
            let promiseArr = searchTree(tree, targetCmpDom.id, EnumEdit.add, compJson);

            nextTree = promiseArr[0];
            el = promiseArr[1];
        }

        dispatch({
            type: 'UPDATE_TREE',
            payload: nextTree
        });
        // 拖入成功后，等待页面DOM渲染，然后自动选中新组建编辑
        // 这里无法得到新组件DOM生成的通知，目前使用定时器，此方法不稳定，待优化
        setTimeout(() => handleEventCallBack('click', el, null), 50);
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

    return <Layout style={{ minWidth: 1100 }}>
        <Sider theme="light" style={{ overflow: 'auto' }} onClick={clearChooseCmp}>
            <CompMenu chooseDragComp={chooseDragComp}/>
        </Sider>
        <Layout>
            <Header className={style.header}>
                <Button type="primary" onClick={publishPage}>保存</Button>
            </Header>
            <Layout>
                <Layout>
                    <div
                        id={EnumId.root}
                        onClick={clearChooseCmp}
                        onDragOver={(e) => handleEventCallBack('in', EnumId.root, e)}
                        onDragLeave={(e) => handleEventCallBack('out', EnumId.root, e)}
                        onDrop={(e) => handleEventCallBack('drop', EnumId.root, e)}
                    >
                        <Page
                            handleEventCallBack={handleEventCallBack}
                            handleHoverCallBack={handleHoverCallBack}
                        />
                    </div>
                </Layout>
                <Sider width={300} theme="light" className={style.optionSlide}>
                    <Option />
                </Sider>
            </Layout>
        </Layout>
    </Layout>;
};

export default Board;