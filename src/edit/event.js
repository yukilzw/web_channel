/**
 * @description 自定义事件分发中心
 * Q: 为什么要使用自定义事件来分发编辑器内原生事件？
 * A: 因为编辑器和预览页都是引用同一个compile.js来生成页面，但只有编辑器内需要绑定这些事件，预览页面根本不需要加载多余代码
 * Q: 为什么不使用reducer来触发面板内的回调？
 * A：并不是不可以，这里使用自定义事件是为了区别于代码逻辑上的dispatch，使得Board面板内收到的通知来源于事件分发
 */
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
