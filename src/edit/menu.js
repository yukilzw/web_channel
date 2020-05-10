/**
 * @description 编辑器组件菜单
 */
import React, { useContext } from 'react';
import storeContext from '../context';
import { Menu } from 'antd';

const CompMenu = ({ chooseDragComp }) => {
    const { state } = useContext(storeContext);

    return <Menu
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
    </Menu>;
};

export default CompMenu;