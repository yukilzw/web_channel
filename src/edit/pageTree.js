/**
 * @description 搭建页面组件树视图
 */
import React, { useContext, useEffect, useCallback, useRef } from 'react';
import { Headers, DOMIN } from '../global';
import storeContext from '../context';
import { Tree, message } from 'antd';

const PageTree = () => {
    const { state, dispatch } = useContext(storeContext);
    const { menu } = state;
    const lastTree = useRef([]);
    const lastTreeMap = useRef();

    let treeMap = JSON.parse(JSON.stringify(state.tree));

    if (!menu) {
        return null;
    }

    // 用于将页面原始tree字段映射为ANTD树组件所需字段
    const fixTreeKey = (children) => {
        for (let child of children) {
            child.key = child.el;
            child.title = state.menu[child.name].name + '(' + child.el.slice(2) + ')';
            delete child.el;
            delete child.hook;
            delete child.name;
            delete child.props;
            delete child.style;
            if (Array.isArray(child.children) && child.children.length > 0) {
                fixTreeKey(child.children);
            } else {
                delete child.children;
            }
        }
    };

    if (JSON.stringify(state.tree) !== JSON.stringify(lastTree.current)) {
        fixTreeKey(treeMap);
        lastTree.current = state.tree;
        lastTreeMap.current = treeMap;
    } else {
        treeMap = lastTreeMap.current;
    }

    return <Tree
        checkable
        treeData={treeMap}
    />;
};

export default PageTree;