const creatCustomEvent = (eventName, data) => {
    const msgEvent = document.createEvent('CustomEvent');

    msgEvent.initCustomEvent(eventName, true, true, data);
    document.dispatchEvent(msgEvent);
};

const handleDragOver = (el, e) => {
    e.stopPropagation();
    e.preventDefault();
    creatCustomEvent(`CUSTOM_handleDragOver`, el);
};

const handleDragleave = (el, e) => {
    e.stopPropagation();
    creatCustomEvent(`CUSTOM_handleDragleave`, el);
};

const handleDrop = (el, e) => {
    e.stopPropagation();
    creatCustomEvent(`CUSTOM_handleDrop`, el);
};

const handleClick = (el, e) => {
    e.nativeEvent.stopImmediatePropagation();
    e.stopPropagation();
    creatCustomEvent(`CUSTOM_handleClick`, el);
};

export {
    handleDragOver,
    handleDragleave,
    handleDrop,
    handleClick,
    creatCustomEvent
};
