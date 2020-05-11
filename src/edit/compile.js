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

const CompBox = ({ hide, el, name, hook, style, props, children }) => {
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
        Comp.current = await loadAsync(name, hook);
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

    // 对渲染组件包裹一层div元素，用来处理编辑器内事件，以及将编辑器配置的样式渲染到视图
    return <div
        key={el}
        id={el}
        className={styleBd.container}
        style={Object.assign({}, style, fillter)}
        {...editEvent}
    >
        {
            !compHasLoad ? null :  <>
                <Comp.current {...props} env={window.ENV} >
                    {childrenComp}
                </Comp.current>
                {renderEditSizeTab(el, style, store)}
            </>
        }
    </div>;
};

// 为每一个具有定位属性的组件添加九宫格操作蒙版区域，用来拖动改变组件尺寸、组件位置
const renderEditSizeTab = (el, { position }, store) => {
    const { state } = store;

    if (['relative', 'fiexd', 'absolute'].indexOf(position) === -1) {
        return;
    }
    if (state.choose !== el) {
        return;
    }
    return <div className={styleBd.changeSizeMask}>
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
const changeTab = ({ type, clientX, clientY }, key, el, store) => {
    const { dispatch } = store;

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
    const { state } = useContext(storeContext);
    const { tree } = state;

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
