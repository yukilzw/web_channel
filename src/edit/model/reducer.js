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
            var newTree = JSON.parse(JSON.stringify(action.payload));

            // 如果新的配置被标记为一条撤销恢复类型，就在这个配置的属性中注明，compile渲染时不将其加入历史记录
            if (action.isPoint) {
                newTree.isPoint = action.isPoint;
            }

            return {
                ...state,
                tree: newTree
            };
        // 选中组件
        case 'EDIT_CHOOSE_CMP':
            var resetTabIndex = {};

            if (action.payload === null) {
                resetTabIndex.tabIndex = 0;
            } else if (state.choose !== action.payload || state.tabIndex === 0) {
                resetTabIndex.tabIndex = 1;
            }
            return {
                ...state,
                choose: action.payload,
                ...resetTabIndex
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
        // 更新页面基本设置
        case 'UPDATE_PAGE_INFO':
            return {
                ...state,
                page: {
                    ...state.page,
                    ...action.payload
                }
            };
        default:
            return state;
    }
};

const App = ({ pid, page, tree, menu, children }) => {
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    // 预览页面只需要tree，不注入编辑器内的reducer
    const [state, dispatch] = useReducer(reducer,
        {
            tree: JSON.parse(JSON.stringify(tree)),           // 页面配置JSON树
            page: JSON.parse(JSON.stringify(page)),
            menu: JSON.parse(JSON.stringify(menu)),
            changeCompBox: null,
            tabIndex: 0,    // 属性面板tab索引
            choose: null   // 当前选中的组件配置
            // type changeCompBox = {
            //     el: string;    组件容器id
            //     key: string;   操作按下的是哪个蒙版，取自complie.js中的changeTabList数组
            //     clientX: number;
            //     clientY: number;
            //     current: {
            //           width: number;
            //           height: number;
            //           position: {
            //               left: number;
            //               top: number;
            //           }
            //     }
            // },
        }
    );

    return <Provider value={{ pid, state, dispatch, forceUpdate }}>
        {children}
    </Provider>;
};

export default App;
