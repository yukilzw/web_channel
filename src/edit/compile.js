/**
 * @description 编辑器渲染组件
 * 根据JSON配置树编译为React组件树
 */
import React, { useContext, useState, useEffect, useRef } from 'react';
import storeContext from '../context';
import { loadAsync } from '../global';
import { record } from './record';
import styleBd from './style/changeBox.less';

const changeTabList = ['LT', 'MT', 'RT', 'LM', 'MM', 'RM', 'LB', 'MB', 'RB'];   // 组件容器事件蒙层类名

let EventObj = {};

// 初次渲染每个站位容器，同时加载组件JS，并递归查找子组件重复此步骤
const CompBox = ({ hide, el, name, style, props, children }) => {
    const {
        handleClick,
        handleEventCallBack,
        handleHoverCallBack
    } = EventObj;
    const store = useContext(storeContext);
    const [compHasLoad, setCompHasLoad] = useState(false);
    const Comp = useRef();

    useEffect(() => {
        loadComp();
    }, []);

    const loadComp = async () => {
        const compModule = await loadAsync(name);

        Comp.current = compModule.default;
        setCompHasLoad(true);
    };

    const editEvent = {
        onDragOver(e) {handleEventCallBack('dragover', el, name, e);},
        onDragLeave(e) {handleEventCallBack('dragout', el, name, e);},
        onDrop(e) {handleEventCallBack('drop', el, name, e);},
        onClick(e) {handleClick(el, e, true);},
        onMouseOver(e) {handleHoverCallBack('mouseover', el, e);},
        onMouseLeave(e) {handleHoverCallBack('mouseleave', el, e);}
    };

    let fillter = { cursor: 'default' };

    // 过滤处理一些属性
    if (style.backgroundImage) {
        Object.assign(fillter, { backgroundImage: `url(${style.backgroundImage})` });
    }

    // 递归检查当前节点的子节点配置
    const childrenComp = checkChildren(children);

    if (hide) {
        return null;
    }

    // 对渲染组件包裹一层div元素，用来占位并绑定编辑器鼠标事件，以及将编辑器配置的样式渲染到视图
    return <div
        key={el}
        id={el}
        className={styleBd.container}
        style={Object.assign({}, style, fillter)}
        {...editEvent}
    >
        {
            // 下载完成后再加载组件
            !compHasLoad ? null :  <>
                <Comp.current {...props} env={window.ENV} >
                    {childrenComp}
                </Comp.current>
                {renderEditSizeTab(name, el, style, store)}
            </>
        }
    </div>;
};

// 为每一个具有定位属性的组件添加九宫格操作蒙版区域，用来拖动改变组件尺寸、组件位置
const renderEditSizeTab = (name, el, { position }, store) => {
    const { state: {
        menu, choose, changeCompBox
    } } = store;

    if (['relative', 'fiexd', 'absolute'].indexOf(position) === -1) {
        return;
    }
    if (choose !== el) {
        return;
    }
    if (!menu[name].canResizeByMouse) {
        return;
    }
    return <div className={styleBd.changeSizeMask}>
        {
            changeCompBox && <>
                <span className={styleBd.topLeftTip}></span>
                <span className={styleBd.topTip}></span>
                <span className={styleBd.rightTip}></span>
            </>
        }
        {
            changeTabList.map((key) => <div key={el + key} className={styleBd[key]}
                onMouseDown={(e) => changeTab(e, key, el, store)}
            ></div>)
        }
    </div>;
};

// 检查当前层级子节点
const checkChildren = (children) => {
    if (!Array.isArray(children)) {
        return null;
    }
    // 遍历每个子节点
    return children.map(config => <CompBox key={config.el} {...config} />);
};

// 记录鼠标按下组件蒙版的各项数据，用于鼠标移动时计算更新组件样式
const changeTab = ({ type, clientX, clientY }, key, el, { dispatch }) => {
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
};

const Page = ({
    optionInputHasFocus,
    handleEventCallBack,
    handleHoverCallBack,
    handleClick
}) => {
    const { state: { tree } } = useContext(storeContext);

    useEffect(() => {
        EventObj = {
            handleClick,
            handleEventCallBack,
            handleHoverCallBack
        };
    }, []);

    // 记录编辑历史的钩子
    useEffect(() => {
        // 读取历史指针记录或者是在输入框输入时不计入历史
        if (tree.isPoint || optionInputHasFocus.current) {
            return;
        }
        record.add(tree);
    }, [tree]);

    return checkChildren(tree);
};

export default Page;
