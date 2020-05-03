import React, { useContext, useCallback } from 'react';
import storeContext from '../context';
import { searchInitStatus, Enum } from './searchStatus';

export const initStylesItemArr = [
    { name: '宽度', styleName: 'width' },
    { name: '高度', styleName: 'height' },
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
    const { tabIndex, optionArr, propsArr, choose, init, menu } = state;

    const renderOption = () => {
        if (!choose) {
            return null;
        }
        if (tabIndex === 0) {
            return <ul className="optionBox" key={tabIndex}>
                {
                    optionArr.map(({ name, styleName, value }, i) => <li className="optionItem" key={styleName}>
                        <p>{name}</p>
                        <input value={value} onChange={(e) => {
                            changeInputStyle(e, i, styleName);
                        }}/>
                    </li>)
                }
            </ul>;
        }
        return <ul className="optionBox" key={tabIndex}>
            {
                propsArr.map(({ name, prop, value }, i) => <li className="optionItem" key={prop}>
                    <p>{name}</p>
                    <input value={value} onChange={(e) => {
                        changeInputStyle(e, i, prop);
                    }}/>
                </li>)
            }
        </ul>;
    };

    const changeInputStyle = async (e, i, key) => {
        const { value } = e.target;

        const newInit = await searchInitStatus(init, choose.el, Enum.edit, { tabIndex, key, value });

        if (tabIndex === 0) {
            optionArr[i].value = value;
        } else if (tabIndex === 1) {
            propsArr[i].value = value;
        }

        dispatch({
            type: 'UPDATE_INIT',
            payload: newInit
        });
    };

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
