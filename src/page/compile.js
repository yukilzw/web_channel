/**
 * @description 页面渲染组件
 * 根据JSON配置树编译为React组件树
 */
import React, { useContext, useState, useEffect } from 'react';
import storeContext from '../context';
import { loadAsync } from '../global';

const Page = () => {
    const { state } = useContext(storeContext);
    const { tree } = state;
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

        let fillter = {};

        // 过滤处理一些属性
        if (style.backgroundImage) {
            Object.assign(fillter, { backgroundImage: `url(${style.backgroundImage})` });
        }

        // 对渲染组件包裹一层div元素，用来处理编辑器内事件，以及将编辑器配置的样式渲染到视图
        return <div
            key={el}
            id={el}
            style={Object.assign({}, style, fillter)}
        >
            <Comp {...props} env={window.ENV} >
                {/* 递归检查当前节点的子节点配置 */}
                {await checkChildren(children)}
            </Comp>
        </div>;
    };

    return pageDom;
};

export default Page;
