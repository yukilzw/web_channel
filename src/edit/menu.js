import React, { useContext, useEffect, useCallback } from 'react';
import { Headers } from '../global';
import storeContext from '../context';

const Menu = ({ chooseDragComp }) => {
    const { state, dispatch } = useContext(storeContext);

    useEffect(() => {
        getCompMenu();
    }, []);

    const getCompMenu = useCallback(() => {
        fetch(window.HOST + '/getCompMenu', {
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