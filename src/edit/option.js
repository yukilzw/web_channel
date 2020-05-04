/**
 * @description 编辑器属性操作面板
 */
import React, { useContext, useCallback } from 'react';
import storeContext from '../context';
import { searchTree, Enum } from './searchTree';

// 定义固有的样式属性配置项，后续可持续拓展（自定义属性配置项没有固有的，是根据每个组件JSON中staticProps动态渲染的）
export const initStylesItemArr = [
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

const Option = () => {
    const { state, dispatch } = useContext(storeContext);
    const { tabIndex, optionArr, propsArr, choose, tree, menu } = state;

    // 渲染面板配置列表
    const renderOption = () => {
        // 没选中组件不显示面板
        if (!choose) {
            return null;
        }
        // 样式面板
        if (tabIndex === 0) {
            return <ul className="optionBox" key={tabIndex}>
                {
                    optionArr.map(({ name, styleName, value }, i) => <li className="optionItem" key={styleName}>
                        <p>{name}</p>
                        <input value={value}
                            onChange={(e) => changeInputStyle(e, i, styleName)}
                        />
                    </li>)
                }
            </ul>;
        }
        // 属性面板
        return <ul className="optionBox" key={tabIndex}>
            {
                propsArr.map(({ name, prop, value }, i) => <li className="optionItem long" key={prop}>
                    <p>{name}</p>
                    <input value={value}
                        onChange={(e) => changeInputStyle(e, i, prop)}
                    />
                </li>)
            }
        </ul>;
    };

    // 改变面板属性值的回调
    const changeInputStyle = (e, i, key) => {
        const { value } = e.target;
        const nextTree = searchTree(tree, choose.el, Enum.edit, { tabIndex, key, value });

        // 判断当前是要更新到样式面板，还是自定义属性面板
        if (tabIndex === 0) {
            optionArr[i].value = value;
        } else if (tabIndex === 1) {
            propsArr[i].value = value;
        }

        dispatch({
            type: 'UPDATE_TREE',
            payload: nextTree
        });
    };

    // 面板TAB切换
    const setTab = useCallback((i) => {
        dispatch({
            type: 'EDIT_CHANGE_TABNAV',
            payload: i
        });
    }, []);

    return <>
        {choose && <>
        <p className="optionTtile">{menu[choose.name].name}({choose.name})：#{choose.el}</p>
            <ul className="optionNav">
                {
                    tab.map((name, i) => <li
                        key={name}
                        className={`optionNavTab ${tabIndex === i ? 'active' : ''}`}
                        onClick={() => setTab(i)}
                    >{name}</li>)
                }
            </ul>
        </>}
        {renderOption()}
    </>;
};

export default Option;
