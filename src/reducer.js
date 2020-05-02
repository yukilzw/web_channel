import React, { useReducer } from 'react';
import storeContext from './context';

const { Provider } = storeContext;

const reducer = (state, action) => {
    switch (action.type) {
        case 'UPDATE_INIT':
            return {
                ...state,
                init: action.payload
            };
        case 'EDIT_MENU':
            return {
                ...state,
                menu: action.payload
            };
        case 'EDIT_CHOOSE_CMP':
            return {
                ...state,
                ...action.payload
            };
        case 'EDIT_CHANGE_TABNAV':
            return {
                ...state,
                tabIndex: action.payload
            };
        default:
            return state;
    }
};

const App = ({ init, event, children }) => {
    const [state, dispatch] = useReducer(reducer, Object.assign(
        { init }, window.ENV === 'edit' && {
            event,
            choose: null,
            tabIndex: 0,
            optionArr: [],
            propsArr: []
        }
    ));

    return <Provider value={{ state, dispatch }}>
        {children}
    </Provider>;
};

export default App;
