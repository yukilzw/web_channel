/**
 * @description 页面渲染组件
 * 根据JSON配置树编译为React组件树
 */
import React, { useContext, useState, useEffect } from 'react';
import storeContext from './context';

const Page = () => {
    const { state } = useContext(storeContext);
    const { tree, event } = state;
    const [pageDom, setPage] = useState(null);

    // 当state更新时，只有在深比较当前tree与next tree不同时，才重新触发编译，提高性能
    useEffect(() => {
        checkChildren(tree).then((page) => {
            setPage(page);
        });
    }, [JSON.stringify(tree)]);

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

        let dragEvent = {};

        let fillter = {};

        if (window.ENV === 'edit') {
            // 如果是编辑器内，将reducer里绑定的自定义event注入到每一个原始事件上
            dragEvent = {
                onDragOver: event.handleDragOver.bind(window, el),
                onDragLeave: event.handleDragleave.bind(window, el),
                onDrop: event.handleDrop.bind(window, el),
                onClick: event.handleClick.bind(window, el),
                onMouseOver: event.handleMouseOver.bind(window, el),
                onMouseLeave: event.handleMouseLeave.bind(window, el)
            };
            Object.assign(fillter, { cursor: 'default' });
        }

        // 过滤处理一些属性
        if (style.backgroundImage) {
            Object.assign(fillter, { backgroundImage: `url(${style.backgroundImage})` });
        }

        // 对渲染组件包裹一层div元素，用来处理编辑器内事件，以及将编辑器配置的样式渲染到视图
        return <div
            key={el}
            id={el}
            style={Object.assign({}, style, fillter)}
            {...dragEvent}
        >
            <Comp {...props} env={window.ENV} >
                {/* 递归检查当前节点的子节点配置 */}
                {await checkChildren(children)}
            </Comp>
        </div>;
    };

    return pageDom;
};

// 编译时按需加载组件js文件
const loadAsync = (name, hook) => new Promise((resolve) => {
    // 如果当前window.comp下有缓存对应的组件函数，就直接返回复用
    if (name in window.comp) {
        resolve(window.comp[name].default);
        return;
    }
    // 否则就实时下载对应组件的js文件，并返回组件函数
    const script = document.createElement('script');

    script.type = 'text/javascript';
    script.onload = () => {
        // 由于在webpack.config.comp.js中打包的每个组件都挂载到window下
        // 组件js加载执行完毕后，可以从window中取出构造函数存入window.comp
        window.comp[name] = window[name];
        delete window[name];
        resolve(window.comp[name].default);
    };
    script.src = hook;
    document.getElementsByTagName('head')[0].appendChild(script);
});

export default Page;
