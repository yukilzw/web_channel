import React, { useContext, useState, useEffect } from 'react';
import storeContext from './context';

const Page = () => {
    const { state } = useContext(storeContext);
    const { init, event } = state;
    const [pageDom, setPage] = useState(null);

    useEffect(() => {
        checkChildren(init).then((page) => {
            setPage(page);
        });
    }, [JSON.stringify(init)]);

    const checkChildren = async (children) => {
        if (!Array.isArray(children)) {
            return null;
        }
        const res = [];

        for (let i = 0; i < children.length; i++) {
            const comp = await compileJson2Comp(children[i]);

            res.push(comp);
        }

        return res;
    };

    const compileJson2Comp = async ({ el, name, hook, style, props, children }) => {
        let Comp = await loadAsync(name, hook);

        let dragEvent = {};

        if (window.ENV === 'edit') {
            dragEvent = {
                onDragOver: event.handleDragOver.bind(window, el),
                onDragLeave: event.handleDragleave.bind(window, el),
                onDrop: event.handleDrop.bind(window, el),
                onClick: event.handleClick.bind(window, el)
            };
        }

        let fillter;

        if (style.backgroundImage) {
            fillter = { backgroundImage: `url(${style.backgroundImage})` };
        }

        return <div key={el} id={el} style={Object.assign({}, style, fillter)}
            {...dragEvent}
        >
            <Comp {...props} >
                {await checkChildren(children)}
            </Comp>
        </div>;
    };

    return pageDom;
};

const loadAsync = (name, hook) => new Promise((resolve) => {
    if (name in window.comp) {
        resolve(window.comp[name].default);
        return;
    }
    const script = document.createElement('script');

    script.type = 'text/javascript';
    script.onload = () => {
        window.comp[name] = window[name];
        delete window[name];
        resolve(window.comp[name].default);
    };
    script.src = hook;
    document.getElementsByTagName('head')[0].appendChild(script);
});

export default Page;
