/**
 * @description 全局状态管理
 */
import React, { useReducer } from 'react';
import storeContext from './context';

const { Provider } = storeContext;

const reducer = (state, action) => {
    switch (action.type) {
        // 更新页面配置树
        case 'UPDATE_TREE':
            return {
                ...state,
                tree: action.payload
            };
        // 更新组件菜单
        case 'EDIT_MENU':
            return {
                ...state,
                menu: action.payload
            };
        // 编辑选中的组件配置
        case 'EDIT_CHOOSE_CMP':
            return {
                ...state,
                ...action.payload
            };
        // 切换操作面板tab
        case 'EDIT_CHANGE_TABNAV':
            return {
                ...state,
                tabIndex: action.payload
            };
        default:
            return state;
    }
};

const App = ({ tree, event, children }) => {
    // 预览页面只需要tree，不注入编辑器内的reducer
    const [state, dispatch] = useReducer(reducer, Object.assign(
        { tree }, window.ENV === 'edit' && {
            event,          // 对应edit/event.js里的自定义事件，用于compile时绑定到dom
            choose: null,   // 当前选中的组件配置
            tabIndex: 0,    // 属性面板tab索引
            optionArr: [],  // 属性面板样式配置列表
            propsArr: []    // 属性面板自定义属性配置列表
        }
    ));

    return <Provider value={{ state, dispatch }}>
        {children}
    </Provider>;
};

export default App;
