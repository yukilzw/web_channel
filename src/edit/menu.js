/**
 * @description 编辑器组件菜单
 */
import React, { useContext, useEffect, useCallback } from 'react';
import { Headers, DOMIN } from '../global';
import storeContext from '../context';
import { Menu } from 'antd';

const CompMenu = ({ chooseDragComp }) => {
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

    return state.menu ? <Menu
        selectable={false}
        mode="inline"
        theme="light"
    >
        {
            Object.entries(state.menu).map(([compName, config]) => <Menu.Item key="1"
                key={compName}
                style={{ cursor: 'grab' }}
                draggable="true"
                onDragStart={() => chooseDragComp(compName, config)}
            >
                {config.name}
            </Menu.Item>)
        }
    </Menu> : null;
};

export default CompMenu;