/**
 * @description 编辑器渲染组件
 * 根据JSON配置树编译为React组件树
 */
import React, { useContext, useState, useEffect, useRef } from 'react';
import storeContext from '../context';
import { loadAsync } from '../global';

const CompBox = ({ hide, el, name, hook, style, props, children }) => {
    const [compHasLoad, setCompHasLoad] = useState(false);
    const Comp = useRef();

    useEffect(() => {
        loadComp();
    }, []);

    const loadComp = async () => {
        const compModule = await loadAsync(name, hook);

        Comp.current = compModule.default;
        setCompHasLoad(true);
    };

    let fillter = {};

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
        style={Object.assign({}, style, fillter)}
    >
        {
            // 下载完成后再加载组件
            !compHasLoad ? null :  <>
                <Comp.current {...props} env={window.ENV} >
                    {childrenComp}
                </Comp.current>
            </>
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

const Page = () => {
    const { state: { tree } } = useContext(storeContext);

    return checkChildren(tree);
};

export default Page;
