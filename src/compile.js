import React, { useContext, useState, useEffect } from 'react';
import storeContext from './context';

let Event;

let initBeforeStr = '';

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

const compileJson2Comp = async ({ el, name, hook, style, props, children }) => {
    let Comp = await loadAsync(name, hook);

    let dragEvent = {};

    if (window.ENV === 'edit') {
        dragEvent = {
            onDragOver: Event.handleDragOver.bind(this, el),
            onDragLeave: Event.handleDragleave.bind(this, el),
            onDrop: Event.handleDrop.bind(this, el),
            onClick: Event.handleClick.bind(this, el)
        };
    }

    return <div key={el} id={el} style={style}
        {...dragEvent}
    >
        <Comp {...props} >
            {await checkChildren(children)}
        </Comp>
    </div>;
};

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

const Page = () => {
    const { state } = useContext(storeContext);
    const { init, event } = state;
    const [pageDom, setPage] = useState(null);

    useEffect(() => {
        Event = event;
    }, []);

    if (initBeforeStr !== JSON.stringify(init)) {
        initBeforeStr = JSON.stringify(init);
        checkChildren(init).then((page) => {
            setPage(page);
        });
    }

    return pageDom;
};

export default Page;
