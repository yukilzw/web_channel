/**
 * @description 编辑器组件菜单
 */
import React, { useContext, useEffect, useCallback } from 'react';
import { Headers, DOMIN } from '../global';
import storeContext from '../context';

const Menu = ({ chooseDragComp }) => {
    const { state, dispatch } = useContext(storeContext);

    useEffect(() => {
        getCompMenu();
    }, []);

    // 获取当前可选用的组件列表
    const getCompMenu = useCallback(() => {
        fetch(DOMIN + '/getCompMenu', {
            method: 'POST',
            headers: Headers.json
        }).then(response => response.json()).then(res => {
            if (res.error !== 0) {
                console.warn(res.msg);
                return;
            }
            dispatch({
                type: 'EDIT_MENU',
                payload: res.data
            });
        });
    }, []);

    return state.menu ? Object.entries(state.menu).map(([compName, config]) => <li
        key={compName}
        className="item"
        draggable="true"
        onDragStart={() => chooseDragComp(compName, config)}
    >{config.name}</li>) : null;
};

export default Menu;