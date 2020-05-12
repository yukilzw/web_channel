/**
 * @description 编辑器组件树视图
 */
import React, { useContext, useCallback, useMemo } from 'react';
import storeContext from '../context';
import { searchTree, EnumEdit } from './searchTree';
import { Tree } from 'antd';
import style from './style/index.less';

const PageTree = ({
    handleClick, checkedKeysList, expandedKeys
}) => {
    const { state, dispatch, forceUpdate } = useContext(storeContext);
    const { choose, tree } = state;

    // 选中某个节点
    const selectNode = useCallback(([el], e) => {
        handleClick(e.node.key);
        const selectCompDom = document.querySelector(`#${e.node.key}`);
        const paintingWrapDom =  document.querySelector(`.${style.paintingWrap}`);
        const nextScrollTop = selectCompDom.getBoundingClientRect().top - 50 - 30 + paintingWrapDom.scrollTop;

        paintingWrapDom.scrollTop = nextScrollTop;
    }, []);

    // 显示隐藏某个节点（隐藏后编译时会忽略此组件以及其包裹的所有子孙组件，但在编辑器内扔可为其配置属性）
    const checkNode = (el, e) => {
        const nextTree = searchTree(tree, e.node.key, EnumEdit.hide);

        dispatch({
            type: 'UPDATE_TREE',
            payload: nextTree
        });
    };

    // 展开节点
    const expendNode = useCallback((el, e) => {
        const hasKey = expandedKeys.current.has(e.node.key);

        if (hasKey) {
            expandedKeys.current.delete(e.node.key);
        } else {
            expandedKeys.current.add(e.node.key);
        }
        expandedKeys.current = new Set(expandedKeys.current);
        forceUpdate();
    }, []);

    // 用于将页面原始tree字段映射为ANTD树组件所需字段
    const fixTreeKey = (children) => {
        for (let child of children) {
            child.key = child.el;
            child.title = state.menu[child.name].name + '(' + child.el.replace(/^wc/, '') + ')';
            if (!child.hide) {
                checkedKeysList.current.add(child.key);
            }

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

    // 缓存树组件，如果没有涉及到影响树组件展示的状态更新，直接渲染缓存树组件
    const compTree = useMemo(() => {
        const treeData = JSON.parse(JSON.stringify(tree));

        checkedKeysList.current = new Set();
        fixTreeKey(treeData);

        return <Tree
            checkable
            checkStrictly
            checkedKeys={Array.from(checkedKeysList.current)}
            onCheck={checkNode}
            selectedKeys={choose && [choose]}
            onSelect={selectNode}
            expandedKeys={Array.from(expandedKeys.current)}
            onExpand={expendNode}
            treeData={treeData}
        />;
    }, [tree, choose, expandedKeys.current, checkedKeysList.current]);

    return compTree;
};

export default PageTree;