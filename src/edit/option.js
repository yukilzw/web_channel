/**
 * @description 编辑器属性操作面板
 */
import React, { useContext, useCallback } from 'react';
import storeContext from '../context';
import { searchTree, EnumEdit } from './searchTree';
import { recordStack } from './compile';
import { Tabs, Layout, Input } from 'antd';
import style from './style/index.less';

const { TabPane } = Tabs;

// 定义固有的样式属性配置项，后续可持续拓展（自定义属性配置项没有固有的，是根据每个组件JSON中staticProps动态渲染的）
const initStylesItemArr = [
    { name: '宽度', styleName: 'width' },
    { name: '高度', styleName: 'height' },
    { name: '移除布局', styleName: 'overflow' },
    { name: '定位方式', styleName: 'position' },
    { name: '左定位', styleName: 'left' },
    { name: '右定位', styleName: 'right' },
    { name: '上定位', styleName: 'top' },
    { name: '下定位', styleName: 'bottom' },
    { name: '左外距', styleName: 'marginLeft' },
    { name: '右外距', styleName: 'marginRight' },
    { name: '上外距', styleName: 'marginTop' },
    { name: '下外距', styleName: 'marginBottom' },
    { name: '背景色', styleName: 'backgroundColor' },
    { name: '背景图', styleName: 'backgroundImage' },
    { name: '背景尺寸', styleName: 'backgroundSize' }
];

const tab = ['样式', '属性'];

const Option = ({ optionInputHasFocus }) => {
    const { state, dispatch } = useContext(storeContext);
    const { tabIndex, choose, tree, menu } = state;

    // 渲染面板配置列表
    const renderOption = () => {
        // 没选中组件不显示面板
        if (!choose) {
            return null;
        }
        // 样式面板
        if (tabIndex === 0) {
            return <div className={style.configWrap} key={0}>
                {
                    initStylesItemArr.map(({ name, styleName }) => <div className={style.config} key={styleName}>
                        <p>{name}</p>
                        <Input value={choose.style[styleName] || ''}
                            onFocus={() => changeOptionInputHasFocus(true)}
                            onBlur={() => changeOptionInputHasFocus(false)}
                            onChange={(e) => changeInputStyle(e, styleName)}
                        />
                    </div>)
                }
            </div>;
        }
        // 属性面板
        return <div className={style.configWrap} key={1}>
            {
                menu[choose.name].staticProps.map(({ name, prop }) => <div className={[style.config, style.long].join(' ')} key={prop}>
                    <p>{name}</p>
                    <Input value={choose.props[prop] || ''}
                        onFocus={() => changeOptionInputHasFocus(true)}
                        onBlur={() => changeOptionInputHasFocus(false)}
                        onChange={(e) => changeInputStyle(e, prop)}
                    />
                </div>)
            }
        </div>;
    };


    const changeOptionInputHasFocus = (type) => {
        if (!type) {
            // 只有输入框失去焦点时才算完成编辑，记录一次当前tree到堆栈
            recordStack.add(tree);
        }
        // 释放当前编辑输入框状态，开启撤销、恢复快捷键权限
        optionInputHasFocus.current = type;
    };

    // 改变面板属性值的回调
    const changeInputStyle = (e, key) => {
        const { value } = e.target;
        const nextTree = searchTree(tree, choose.el, EnumEdit.change, { tabIndex, items: [{ key, value }] });
        const curChoose = searchTree(nextTree, choose.el, EnumEdit.choose);

        dispatch({
            type: 'EDIT_CHOOSE_CMP',
            payload: curChoose
        });

        dispatch({
            type: 'UPDATE_TREE',
            payload: nextTree
        });
    };

    // 面板TAB切换
    const changeTab = useCallback((i) => {
        dispatch({
            type: 'EDIT_CHANGE_TABNAV',
            payload: Number(i)
        });
    }, []);

    return <Tabs activeKey={tabIndex.toString()} onChange={changeTab}>
        <TabPane tab={tab[0]} key="0">
            {choose && <Layout className={style.tabPane}>
                <p className={style.compName}>{menu[choose.name].name}({choose.name})：#{choose.el}</p>
                {renderOption()}
            </Layout>}
        </TabPane>
        <TabPane tab={tab[1]} key="1">
            {choose && <Layout className={style.tabPane}>
                <p className={style.compName}>{menu[choose.name].name}({choose.name})：#{choose.el}</p>
                {renderOption()}
            </Layout>}
        </TabPane>
    </Tabs>;
};

export default Option;
