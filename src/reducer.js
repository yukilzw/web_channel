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
        // 鼠标按下操作蒙版后，设置当前操作的组件，在root监听鼠标移动事件来改变组件容器的宽高、定位
        case 'EDIT_COMP_BOX':
            return {
                ...state,
                changeCompBox: action.payload
            };
        default:
            return state;
    }
};

const App = ({ tree, children }) => {
    // 预览页面只需要tree，不注入编辑器内的reducer
    const [state, dispatch] = useReducer(reducer, Object.assign(
        {
            tree            // 页面配置JSON树
        }, window.ENV === 'edit' ? {
            choose: null,   // 当前选中的组件配置
            // changeCompBox: {
            //     key: null,   操作按下的是哪个蒙版，取自complie.js中的changeTabList数组
            //     dom: null    要操作哪个组件容器
            // },
            changeCompBox: null,
            tabIndex: 0,    // 属性面板tab索引
            optionArr: [],  // 属性面板样式配置列表
            propsArr: []    // 属性面板自定义属性配置列表
        } : {}
    ));

    return <Provider value={{ state, dispatch }}>
        {children}
    </Provider>;
};

export default App;