/**
 * @description 全局状态管理
 */
import React from 'react';
import storeContext from './context';

const { Provider } = storeContext;

const App = ({ tree, children }) => {
    const state = {
        tree: JSON.parse(JSON.stringify(tree))           // 页面配置JSON树
    };

    return <Provider value={{ state }}>
        {children}
    </Provider>;
};

export default App;
