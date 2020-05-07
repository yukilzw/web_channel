/**
 * @description 页面渲染组件
 * 根据JSON配置树编译为React组件树
 */
import React, { useContext, useState, useEffect, useCallback } from 'react';
import storeContext from '../context';
import { loadAsync } from '../global';
import styleBd from './style/changeBox.less';

const changeTabList = ['LT', 'MT', 'RT', 'LM', 'MM', 'RM', 'LB', 'MB', 'RB'];

const Page = ({
    handleEventCallBack,
    handleHoverCallBack
}) => {
    const { state, dispatch } = useContext(storeContext);
    const { tree, choose } = state;
    const [pageDom, setPage] = useState(null);

    // 当state更新时，只有在深比较当前tree与next tree不同时，或者选中的choose不同时，才重新触发编译，提高性能
    useEffect(() => {
        checkChildren(tree).then((page) => {
            setPage(page);
        });
    }, [JSON.stringify(tree), choose]);

    // 检查当前层级子节点
    const checkChildren = async (children) => {
        if (!Array.isArray(children)) {
            return null;
        }
        const res = [];

        // 遍历每个子节点
        for (let i = 0; i < children.length; i++) {
            const comp = await compileJson2Comp(children[i]);

            res.push(comp);
        }

        return res;
    };

    // 将每一个JSON节点编译为React组件节点
    const compileJson2Comp = async ({ el, name, hook, style, props, children }) => {
        // 首先获取当前组件的构造函数
        let Comp = await loadAsync(name, hook);

        const editEvent = {
            onDragOver(e) {handleEventCallBack('in', el, e);},
            onDragLeave(e) {handleEventCallBack('out', el, e);},
            onDrop(e) {handleEventCallBack('drop', el, e);},
            onClick(e) {handleEventCallBack('click', el, e);},
            onMouseOver(e) {handleHoverCallBack('hover', el, e);},
            onMouseLeave(e) {handleHoverCallBack('leave', el, e);}
        };

        let fillter = { cursor: 'default' };

        // 过滤处理一些属性
        if (style.backgroundImage) {
            Object.assign(fillter, { backgroundImage: `url(${style.backgroundImage})` });
        }

        // 对渲染组件包裹一层div元素，用来处理编辑器内事件，以及将编辑器配置的样式渲染到视图
        return <div
            key={el}
            id={el}
            className={styleBd.container}
            style={Object.assign({}, style, fillter)}
            {...editEvent}
        >
            <Comp {...props} env={window.ENV} >
                {/* 递归检查当前节点的子节点配置 */}
                {await checkChildren(children)}
            </Comp>
            {renderEditSizeTab(el, style)}
        </div>;
    };

    // 为每一个具有定位属性的组件添加九宫格操作蒙版区域，用来拖动改变组件尺寸、组件位置
    const renderEditSizeTab = (el, { position }) => {
        if (['relative', 'fiexd', 'absolute'].indexOf(position) === -1) {
            return;
        }
        if (!choose || choose.el !== el) {
            return;
        }
        return <div className={styleBd.changeSizeMask}>
            {
                changeTabList.map((key) => <div key={el + key} className={styleBd[key]}
                    onMouseDown={(e) => changeTab(e, key, el)}
                ></div>)
            }
        </div>;
    };

    // 记录鼠标按下组件蒙版的各项数据，用于鼠标移动时计算更新组件样式
    const changeTab = useCallback(({ type, clientX, clientY }, key, el) => {
        if (type === 'mousedown') {
            const elStyles = window.getComputedStyle(document.querySelector(`#${el}`), null);

            dispatch({
                type: 'EDIT_COMP_BOX',
                payload: {
                    el,
                    key,
                    clientX,
                    clientY,
                    current: {
                        width: parseFloat(elStyles.width),
                        height: parseFloat(elStyles.height),
                        position: {
                            left: parseFloat(elStyles.left),
                            top: parseFloat(elStyles.top)
                        }
                    }
                }
            });
        }
    });

    return pageDom;
};

export default Page;
