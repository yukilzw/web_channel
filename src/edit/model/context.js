/**
 * @description 全局状态对象
 */
import { createContext } from 'react';

const storeContext = createContext();
const EditFuncContext = createContext();

export default storeContext;
export {
    EditFuncContext
};