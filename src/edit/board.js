/**
 * @description 编辑器面板
 * 包含四个模块（组件菜单、组件结构树图、搭建可视区、属性配置面板）
 * 此根组件定义了大部分编辑器内通用事件与函数
 */
import React, { useContext, useEffect, useRef, useCallback, useState } from 'react';
import storeContext, { EditFuncContext } from '../context';
import { Headers, DOMIN } from '../global';
import Page from './compile';
import CompMenu from './menu';
import Option from './option';
import PageTree from './tree';
import { searchTree, rangeKey, creatPart, EnumEdit } from './searchTree';
import { record } from './record';
import { Layout, Button, Slider, message } from 'antd';
import style from './style/index.less';
import styleBd from './style/changeBox.less';

const EnumId = { root: 'root' };    // 画布id
const PaintBoxMargin = 30;  // 画布边距
const SliderMarks = {   // 缩放拖动条坐标轴
    0: '0%',
    25: '26%',
    50: '50%',
    75: '75%',
    100: '100%'
};

const Board = () => {
    const { state, dispatch, forceUpdate } = useContext(storeContext);
    const stateRef = useRef();          // 暂存实时reducer
    const paintScaleRef = useRef();
    const dragCmpConfig = useRef();     // 选取拖拽菜单内组件时，暂存该组件的默认配置
    const targetCmpDom = useRef();      // 暂存当前编辑事件的目标元素（拖拽释放、点击等）
    const paintingWrap = useRef();       // 画布所在的区域DOM元素
    const paintingWrapWidthPre = useRef();     // 上次改变画布大小时的画布所在DOM的宽度，用于鉴别容器是否变宽
    const nextStylesbYChangeMask = useRef();    // 拖动组件蒙层改变的属性记录，用于mouseup时同步更新到页面tree
    const copyCompEl = useRef();          // 剪切板el存储
    const dispatchCallBack = useRef();      // 重新渲染完成后触发回调
    const spaceDown = useRef();            // 空格键是否按下
    const mouseWheelTimmer = useRef();          // 鼠标滚轮缩放画布函数节流定时器
    const paintMaskMove = useRef();          // 按住蒙层后方可移动画布坐标
    const [paintOffset, setPaintOffset] = useState({ width: 0, height: 0 });    // 包裹真实画布的一层实际可视区域容器，用来触发paintingWrap滚动
    const [paintScale, setPaintScale] = useState(0);     // 画布缩放比例
    const [paintMinHeight, setPaintMinHeight] = useState(0);     // 画布实际最小高度

    // 子组件渲染需要使用的实时常量，在父组件dispatch前设置好，便于子组件重新渲染时直接读取
    const optionInputHasFocus = useRef(false);      // 编辑区输入框聚焦开关（避免键盘事件与输入框默认快捷键冲突）
    const checkedKeysList = useRef(new Set());             // 侧边栏树组件选中集合
    const expandedKeys = useRef(new Set());         // 侧边栏树组件展开的集合

    useEffect(() => {
        // 由于hooks自带闭包机制，浏览器全局事件回调函数的异步触发只能最初拿到绑定事件时注入的state
        // 每次状态有改变，就将state存到静态变量stateRef，在事件触发时取改变量代替state
        stateRef.current = state;
        paintScaleRef.current = paintScale;
    });

    useEffect(() => {
        bindEditDomEvent();
    }, []);

    // 渲染外层容器后再计算出最合适的比例
    useEffect(() => {
        repainting();
    }, [paintingWrap.current]);

    useEffect(() => {
        const rootDom = document.querySelector(`#${EnumId.root}`);

        if (rootDom) {
            const nextPaintOffset = {
                width: rootDom.getBoundingClientRect().width,
                height: rootDom.getBoundingClientRect().height
            };

            setPaintOffset(nextPaintOffset);
        }
        if (dispatchCallBack.current instanceof Function) {
            dispatchCallBack.current();
            dispatchCallBack.current = null;
        }
    }, [paintScale, state.tree]);

    // 绑定编辑器事件
    let bindEditDomEvent = useCallback(() => {
        // 键盘快捷键自定义
        document.addEventListener(`keydown`, handlekeyDown, false);
        document.addEventListener(`keyup`, handlekeyUp, false);
        // 鼠标滚轮
        document.addEventListener(`wheel`, handlewheel, false);
        // 浏览器窗口改变
        window.addEventListener('resize', repainting, false);
        // 鼠标抬起置空拖动编辑组件对象
        document.addEventListener(`mouseup`, handleMouseUp, false);
    }, []);

    // 重新计算画布尺寸
    const repainting = useCallback((forceScale) => {
        const paintingWrapDom = paintingWrap.current;
        const shouldFoceUpdate = typeof forceScale === 'number';

        // 画布所在区域宽度变化,或者拖动滑块强制缩放，就重新计算画布缩放比例
        if (
            paintingWrapDom.offsetWidth !== paintingWrapWidthPre.current ||
            shouldFoceUpdate
        ) {
            const nextPaintScale = shouldFoceUpdate ? forceScale : (paintingWrapDom.offsetWidth - PaintBoxMargin * 2) / 1920;
            const nextPaintMinHeight = ((paintingWrapDom.offsetHeight - PaintBoxMargin) + 300) / nextPaintScale;

            paintingWrapWidthPre.current = paintingWrapDom.offsetWidth;

            setPaintScale(nextPaintScale);
            setPaintMinHeight(nextPaintMinHeight);
        }
    }, []);

    // 清空当前选中的编辑组件
    const clearChooseCmp = useCallback(() => {
        if (targetCmpDom.current) {
            targetCmpDom.current.classList.remove(style.chooseIn);
            targetCmpDom.current = null;
        }

        dispatch({
            type: 'EDIT_CHOOSE_CMP',
            payload: null
        });
    }, []);

    // 空格+滚轮缩放画布
    const handlewheel = useCallback((e) => {
        if (spaceDown.current) {
            e.preventDefault();
            if (mouseWheelTimmer.current) {
                return;
            }
            mouseWheelTimmer.current = setTimeout(() => {
                clearTimeout(mouseWheelTimmer.current);
                mouseWheelTimmer.current = null;
            }, 20);

            const scale = Math.min(1, Math.max(0.1, paintScaleRef.current - e.deltaY / 1000));

            repainting(scale);
        }
    }, []);

    // 键盘事件
    const handlekeyDown = useCallback((e) => {
        const { choose } = stateRef.current;

        // `空格`键
        if (e.keyCode === 32 && !optionInputHasFocus.current) {
            e.preventDefault();
            spaceDown.current = true;
            forceUpdate();
        // `DEL`键删除选中的可视区组件
        } else if (e.keyCode === 46) {
            e.preventDefault();
            deleteNode();
        // `↑`向上箭头
        } else if (e.keyCode === 38) {
            if (choose) {
                e.preventDefault();
                changePosNode(-1);
            }
        // `↓`向下箭头
        } else if (e.keyCode === 40) {
            if (choose) {
                e.preventDefault();
                changePosNode(1);
            }
        } else if (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey) {
            // `CTRL + S`保存
            if (e.keyCode === 83) {
                e.preventDefault();
                savePage();
            // `CTRL + C`复制节点
            } else if (e.keyCode === 67 && !optionInputHasFocus.current) {
                e.preventDefault();
                copeNode();
            // `CTRL + X`剪切节点
            } else if (e.keyCode === 88 && !optionInputHasFocus.current) {
                e.preventDefault();
                cutNode();
            // `CTRL + V`粘贴节点
            } else if (e.keyCode === 86 && !optionInputHasFocus.current) {
                e.preventDefault();
                pasteNode();
            // `CTRL + Z`撤销
            } else if (e.keyCode === 90 && !optionInputHasFocus.current) {
                e.preventDefault();
                returnEdit();
            // `CTRL + Y`恢复
            } else if (e.keyCode === 89 && !optionInputHasFocus.current) {
                e.preventDefault();
                resumeEdit();
            }
        }
    }, []);

    const handlekeyUp = useCallback((e) => {
        // `空格`键
        if (e.keyCode === 32) {
            e.preventDefault();
            spaceDown.current = false;
            forceUpdate();
        }
    }, []);

    // 删除节点方法
    const deleteNode = useCallback(() => {
        const { choose, tree } = stateRef.current;

        if (!choose) {
            return;
        }
        // 如果删除的节点是复制剪切板的则情况剪切板
        if (copyCompEl.current === choose) {
            copyCompEl.current = null;
        }
        const [nextTree] = searchTree(tree, choose, EnumEdit.delete);

        dispatch({
            type: 'EDIT_CHOOSE_CMP',
            payload: null
        });
        dispatch({
            type: 'UPDATE_TREE',
            payload: nextTree
        });
    }, []);

    // 拷贝节点方法
    const copeNode = useCallback(() => {
        const { choose } = stateRef.current;

        if (!choose) {
            message.warn('请先选中再复制');
        } else {
            copyCompEl.current = choose;
            message.success('复制成功');
        }
    }, []);

    // 剪切节点方法
    const cutNode = useCallback(() => {
        const { choose, tree } = stateRef.current;

        if (!choose) {
            message.warn('请先选中再剪切');
        } else {
            // 先拷贝剪切的对象再删除
            copyCompEl.current = JSON.parse(JSON.stringify(
                searchTree(tree, choose, EnumEdit.choose)
            ));

            deleteNode();
            message.success('剪切成功');
        }
    }, []);

    // 粘贴节点方法
    const pasteNode = useCallback(() => {
        const { choose, tree, menu } = stateRef.current;

        if (!copyCompEl.current) {
            message.warn('请先复制/剪切再粘贴');
            return;
        }
        let copyObj = copyCompEl.current;

        if (typeof copyCompEl.current === 'string') {
            copyObj = JSON.parse(JSON.stringify(
                searchTree(tree, copyCompEl.current, EnumEdit.choose)
            ));
        } else {
            copyCompEl.current = null;
        }
        const chooseObj = searchTree(tree, choose, EnumEdit.choose);

        let nextTree = tree;

        if (!choose) {   // 插入的是根节点
            rangeKey(copyObj);
            nextTree.push(copyObj);
        } else if (!menu[chooseObj.name].hasChild) {  // 不允许插入的位置
            message.warn('目标位置不能有子组件');
            return;
        }  else {       // 插入内部节点
            nextTree = searchTree(tree, choose, EnumEdit.add, copyObj)[0];
        }
        dispatch({
            type: 'UPDATE_TREE',
            payload: nextTree
        });
        message.success('粘贴成功');
    }, []);

    // 撤销方法
    const returnEdit = useCallback(() => {
        const lastPageTree = record.roll();

        if (lastPageTree === false) {
            return;
        }
        checkCurChooseExist(lastPageTree);
        dispatch({
            type: 'UPDATE_TREE',
            payload: lastPageTree,
            isPoint: true          // 标记此条页面配置为指针移动而不是新建数据
        });
    }, []);

    // 恢复方法
    const resumeEdit = useCallback(() => {
        const lastPageTree = record.recover();

        if (lastPageTree === false) {
            return;
        }
        checkCurChooseExist(lastPageTree);
        dispatch({
            type: 'UPDATE_TREE',
            payload: lastPageTree,
            isPoint: true
        });
    }, []);

    // 上下交换节点位置
    const changePosNode = useCallback((type) => {
        const { choose, tree } = stateRef.current;

        if (!choose) {
            return;
        }
        const nextTree = searchTree(tree, choose, EnumEdit.move, type);

        dispatch({
            type: 'UPDATE_TREE',
            payload: nextTree
        });
    }, []);

    // 指针切换历史记录时，校验当前选中组件是否还存在，不存在就把选中框去掉
    const checkCurChooseExist = useCallback((tree) => {
        const { choose } = stateRef.current;

        if (choose) {
            const config = searchTree(tree, choose, EnumEdit.choose);

            if (config === null) {
                clearChooseCmp();
            }
        }
    }, []);

    // 拖拽事件回调
    const handleEventCallBack = useCallback((type, el, name, e) => {
        const { menu } = stateRef.current;
        const targetCanDragIn = (el === EnumId.root) || menu[name].hasChild;

        let dragClassName = style.dragIn;

        if (!targetCanDragIn) {     // 如果目标组件不能有子组件，标红提示
            dragClassName = style.dragInUnable;
        }
        targetCmpDom.current = document.querySelector(`#${el}`);

        if (type === 'dragover') {
            e && e.stopPropagation();
            e && e.preventDefault();
            targetCmpDom.current.classList.add(dragClassName);
        } else if (type === 'dragout') {
            e && e.stopPropagation();
            targetCmpDom.current.classList.remove(dragClassName);
        } else if (type === 'drop') {
            e && e.stopPropagation();
            targetCmpDom.current.classList.remove(dragClassName);
            if (!targetCanDragIn) {
                message.warn('目标位置不允许有子节点');
                return;
            }
            putCmpIntoArea();
        }
    }, []);

    // 移入事件回调
    const handleHoverCallBack = useCallback((type, el) => {
        const hoverCmpDom = document.querySelector(`#${el}`);

        if (type === 'mouseover') {
            hoverCmpDom.classList.add(style.hoverIn);
        } else if (type === 'mouseleave') {
            hoverCmpDom.classList.remove(style.hoverIn);
        }
    }, []);

    // 点击事件回调
    const handleClick = useCallback((el, e, expanded) => {
        e && e.stopPropagation();
        const currentChoose = document.querySelector(`.${style.chooseIn}`);

        currentChoose && currentChoose.classList.remove(style.chooseIn);

        // 如果组件被隐藏就不显示选中框
        targetCmpDom.current = document.querySelector(`#${el}`);
        targetCmpDom.current && targetCmpDom.current.classList.add(style.chooseIn);

        // 需要展开侧边栏树
        if (expanded) {
            expandedParentsNode(targetCmpDom.current).forEach(ExpEl => expandedKeys.current.add(ExpEl));
        }

        dispatch({
            type: 'EDIT_CHOOSE_CMP',
            payload: el     // 将当前选中的组件配置el记录，需要的时候直接通过el搜索对应的配置对象
        });
    }, []);

    // 递归向上查询该节点的所有祖先节点数组
    const expandedParentsNode = useCallback((dom) => {
        if (dom.parentNode.id === EnumId.root) {
            return [];
        }
        if (
            typeof dom.parentNode.id === 'string' &&
            /^wc.+/g.test(dom.parentNode.id) &&
            Array.from(dom.parentNode.classList).indexOf(style.container)
        ) {
            return [dom.parentNode.id].concat(expandedParentsNode(dom.parentNode));
        } else {
            return expandedParentsNode(dom.parentNode);
        }
    }, []);

    // 释放拖拽，将新组建加入页面配置
    const putCmpIntoArea = useCallback(() => {
        const { tree, menu } = stateRef.current;
        // 生成新组件的配置
        const compObj = creatPart(dragCmpConfig.current, menu);

        let nextTree = tree;

        let el;

        if (targetCmpDom.current.id === EnumId.root) {   // 插入的是根节点
            rangeKey(compObj);
            nextTree.push(compObj);
            el = compObj.el;
        } else {       // 插入内部节点
            const res = searchTree(tree, targetCmpDom.current.id, EnumEdit.add, compObj);

            nextTree = res[0];
            el = res[1];
        }
        dispatch({
            type: 'UPDATE_TREE',
            payload: nextTree
        });
        dispatchCallBack.current = () => handleClick(el, null, true);
    }, []);

    // 选中菜单中的组件开始拖拽时
    const chooseDragComp = useCallback((config) => {
        clearChooseCmp();
        dragCmpConfig.current = config;
    }, []);

    // 保存页面配置
    const savePage = useCallback(() => new Promise((resolve) => {
        const { tree } = stateRef.current;

        fetch(DOMIN + '/savepage', {
            method: 'POST',
            headers: Headers.json,
            body: JSON.stringify(tree)
        }).then(response => response.json()).then(res => {
            if (res.error !== 0) {
                message.error(res.msg);
                return;
            }
            message.success('保存成功');
            resolve();
        });
    }), []);

    // 在新窗口预览页面
    const showPage = useCallback(async () => {
        const pageWindow = window.open('about:blank', '_blank');

        await savePage();
        pageWindow.location.href = `${DOMIN}/page`;
    }, []);

    // 拖动顶部滑块强制改变画布尺寸
    const changeSlider = useCallback((num) => {
        repainting(num / 100);
    }, []);

    // 响应compile.js中changeTab事件，实现拖动蒙版编辑组件尺寸、定位
    const changeBoxByMask = useCallback((e) => {
        const { changeCompBox } = stateRef.current;

        if (!changeCompBox) {
            return;
        }
        const { key, el, clientY, clientX, current } = changeCompBox;
        const container = document.querySelector(`#${el}`);
        const changeX = (e.clientX - clientX) / paintScale;
        const changeY = (e.clientY - clientY) / paintScale;
        const nextStyles = {};

        switch (key) {
            case 'LT':
                Object.assign(nextStyles, {
                    width: (current.width - changeX).toFixed(0) + 'px',
                    height: (current.height - changeY).toFixed(0) + 'px',
                    left: (current.position.left + changeX).toFixed(0) + 'px',
                    top: (current.position.top + changeY).toFixed(0) + 'px'
                });
                break;
            case 'MT':
                Object.assign(nextStyles, {
                    height: (current.height - changeY).toFixed(0) + 'px',
                    top: (current.position.top + changeY).toFixed(0) + 'px'
                });
                break;
            case 'RT':
                Object.assign(nextStyles, {
                    width: (current.width + changeX).toFixed(0) + 'px',
                    height: (current.height - changeY).toFixed(0) + 'px',
                    top: (current.position.top + changeY).toFixed(0) + 'px'
                });
                break;
            case 'LM':
                Object.assign(nextStyles, {
                    width: (current.width - changeX).toFixed(0) + 'px',
                    left: (current.position.left + changeX).toFixed(0) + 'px'
                });
                break;
            case 'MM':
                Object.assign(nextStyles, {
                    left: (current.position.left + changeX).toFixed(0) + 'px',
                    top: (current.position.top + changeY).toFixed(0) + 'px'
                });
                break;
            case 'RM':
                Object.assign(nextStyles, {
                    width: (current.width + changeX).toFixed(0) + 'px'
                });
                break;
            case 'LB':
                Object.assign(nextStyles, {
                    width: (current.width - changeX).toFixed(0) + 'px',
                    height: (current.height + changeY).toFixed(0) + 'px',
                    left: (current.position.left + changeX).toFixed(0) + 'px'
                });
                break;
            case 'MB':
                Object.assign(nextStyles, {
                    height: (current.height + changeY).toFixed(0) + 'px'
                });
                break;
            case 'RB':
                Object.assign(nextStyles, {
                    width: (current.width + changeX).toFixed(0) + 'px',
                    height: (current.height + changeY).toFixed(0) + 'px'
                });
                break;
            default: break;
        }
        Object.assign(container.style, nextStyles);
        nextStylesbYChangeMask.current = nextStyles;
        const computedStyle = window.getComputedStyle(container);

        document.querySelector(`.${styleBd.topLeftTip}`).innerHTML = `${parseInt(computedStyle.left)},${parseInt(computedStyle.top)}`;
        document.querySelector(`.${styleBd.topTip}`).innerHTML = parseInt(computedStyle.width);
        document.querySelector(`.${styleBd.rightTip}`).innerHTML = parseInt(computedStyle.height);

    }, [state.changeCompBox]);

    // 画布内编辑释放鼠标
    const handleMouseUp = useCallback((e) => {
        e.preventDefault();
        const { tree, changeCompBox } = stateRef.current;
        const nsbcMask = nextStylesbYChangeMask.current;

        if (nsbcMask && changeCompBox) {
            const nextStyleItems = [];

            for (let key in nsbcMask) {
                nextStyleItems.push({
                    key,
                    value: nsbcMask[key]
                });
            }
            const nextTree = searchTree(tree, changeCompBox.el, EnumEdit.change, {
                tabIndex: 0,
                items: nextStyleItems
            });

            dispatch({
                type: 'UPDATE_TREE',
                payload: nextTree
            });
        }
        dispatch({
            type: 'EDIT_COMP_BOX',
            payload: null
        });
        nextStylesbYChangeMask.current = null;
        paintMaskMove.current = false;
    }, [state.changeCompBox]);

    // 拖动画布
    const dragPaintMaskDown = useCallback((e) => {
        const { clientX, clientY } = e;

        paintMaskMove.current = {
            clientX, clientY
        };
    }, []);

    const dragPaintMaskMove = useCallback((e) => {
        e.preventDefault();
        if (paintMaskMove.current) {
            const { clientX, clientY } = paintMaskMove.current;
            const changeX = e.clientX - clientX;
            const changeY = e.clientY - clientY;
            const paintingWrapDom =  document.querySelector(`.${style.paintingWrap}`);
            const nextScrollTop =  paintingWrapDom.scrollTop - changeY;
            const nextScrollLeft =  paintingWrapDom.scrollLeft - changeX;

            paintingWrapDom.scrollTop = nextScrollTop;
            paintingWrapDom.scrollLeft = nextScrollLeft;
            paintMaskMove.current = {
                clientX: e.clientX,
                clientY: e.clientY
            };
        }
    }, []);

    return <Layout className={style.main}>
        <Layout.Sider theme="light" >
            <div className={[style.mainSider, style.menu].join(' ')} onClick={clearChooseCmp}>
                <CompMenu chooseDragComp={chooseDragComp}/>
            </div>
            <div className={style.mainSider} onMouseUp={clearChooseCmp}>
                <PageTree
                    handleClick={handleClick}
                    checkedKeysList={checkedKeysList}
                    expandedKeys={expandedKeys}
                />
            </div>
        </Layout.Sider>
        <Layout>
            <Layout.Header className={style.header}>
                <div className={style.headerLeft}>
                    <Slider
                        marks={SliderMarks}
                        className={style.headerSlider}
                        tipFormatter={num => `${num}%`}
                        value={paintScale * 100}
                        onChange={changeSlider}
                    />
                </div>
                <Button type="primary" className={style.headerBtn} onClick={showPage}>预览</Button>
            </Layout.Header>
            <Layout className={style.paintingLayout}>
                <Layout className={style.flex1}>
                    <div className={style.paintingWrap} ref={paintingWrap} onClick={clearChooseCmp}>
                        <div className={style.paintingBox} style={{
                            height: `${paintOffset.height}px`,
                            width: `${paintOffset.width}px`
                        }}>
                            {!!spaceDown.current && <div className={style.moveMask}
                                onMouseDown={dragPaintMaskDown}
                                onMouseMove={dragPaintMaskMove}
                            ></div>}
                            <div
                                style={{
                                    transform: `scale(${paintScale})`,
                                    minHeight: `${paintMinHeight}px`
                                }}
                                id={EnumId.root}
                                className={style.root}
                                onDragOver={(e) => handleEventCallBack('dragover', EnumId.root, null, e)}
                                onDragLeave={(e) => handleEventCallBack('dragout', EnumId.root, null, e)}
                                onDrop={(e) => handleEventCallBack('drop', EnumId.root, null, e)}
                                onMouseMove={changeBoxByMask}
                            >
                                <Page
                                    handleEventCallBack={handleEventCallBack}
                                    handleClick={handleClick}
                                    handleHoverCallBack={handleHoverCallBack}
                                    optionInputHasFocus={optionInputHasFocus}
                                />
                            </div>
                        </div>
                    </div>
                </Layout>
                <Layout.Sider width={350} theme="light" className={style.option}>
                    <EditFuncContext.Provider value={{ savePage, deleteNode, copeNode, pasteNode, cutNode, returnEdit, resumeEdit, changePosNode }}>
                        <Option optionInputHasFocus={optionInputHasFocus} />
                    </EditFuncContext.Provider>
                </Layout.Sider>
            </Layout>
        </Layout>
    </Layout>;
};

export default Board;