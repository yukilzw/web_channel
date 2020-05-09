/**
 * @description 编辑器组件树视图
 */
import React, { useContext, useEffect, useCallback, useRef } from 'react';
import { Headers, DOMIN } from '../global';
import storeContext from '../context';
import { Tree, message } from 'antd';

const PageTree = ({
    handleEventCallBack
}) => {
    const { state, dispatch } = useContext(storeContext);
    const { menu, choose } = state;
    const lastTree = useRef([]);
    const lastTreeMap = useRef();
    const checkedKeysList = useRef([]);

    let treeMap = JSON.parse(JSON.stringify(state.tree));

    // 选中某个节点
    const selectNode = useCallback(([el], e) => {
        handleEventCallBack('click', el);
    }, []);

    // 显示隐藏某个节点（隐藏后编译时会忽略此组件以及其包裹的所有子孙组件）
    const checkNode = useCallback((el, e) => {
        console.log(el);
    }, []);

    if (!menu) {
        return null;
    }

    // 用于将页面原始tree字段映射为ANTD树组件所需字段
    const fixTreeKey = (children) => {
        for (let child of children) {
            child.key = child.el;
            child.title = state.menu[child.name].name + '(' + child.el.slice(2) + ')';
            checkedKeysList.current.push(child.key);
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
        checkedKeysList.current = [];
        fixTreeKey(treeMap);
        lastTree.current = state.tree;
        lastTreeMap.current = treeMap;
    } else {
        treeMap = lastTreeMap.current;
    }

    return <Tree
        checkable
        checkStrictly
        checkedKeys={checkedKeysList.current}
        onCheck={checkNode}
        selectedKeys={choose && [choose.el]}
        onSelect={selectNode}
        treeData={treeMap}
    />;
};

export default PageTree;