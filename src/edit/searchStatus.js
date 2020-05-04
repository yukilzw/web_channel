/* eslint-disable complexity */
/**
 * @description 搜索页面配置树
 * 编辑器内各种操作，都是对当前json tree的操作，然后触发compile重新渲染视图。
 * 此方法根据id，搜索当前操作的目标节点的位置，根据不同的操作返回所需要的值
 */
const Enum = {
    add: 'add',
    choose: 'choose',
    edit: 'edit',
    delete: 'delete'
};

/**
 * @param {Array<Config>} arg[0] 页面配置tree
 * @param {String} arg[1] 要搜索的元素id
 * @param {String} arg[2] 操作的枚举类型
 * @param {any} arg[2] 拓展参数，不同操作类型入参不同
 */
const searchInitStatus = (...arg) => new Promise((resolve) => {
    // 传入的tree为readOnly，深拷贝一份新的tree来操作。同时新tree也能保证触发React视图render
    const copyInit = JSON.parse(JSON.stringify(arg[0]));

    arg[0] = copyInit;
    const main = () => {
        const [arr, el, type, expand] = arg;

        for (let i = 0; i < arr.length; i++) {
            if (arr[i].el === el) {
                // 选择
                if (type === Enum.choose) {
                    resolve(arr[i]);
                // 编辑
                } else if (type === Enum.edit) {
                    const { tabIndex, key, value } = expand;

                    if (tabIndex === 0) {
                        arr[i].style[key] = value;
                    } else if (tabIndex === 1) {
                        arr[i].props[key] = value;
                    }
                    resolve(copyInit);
                // 删除
                } else if (type === Enum.delete) {
                    arr.splice(i, 1);
                    resolve(copyInit);
                // 拖入
                } else if (type === Enum.add) {
                    if (Array.isArray(arr[i].children)) {
                        const { el: lastEl } = arr[i].children[arr[i].children.length - 1];
                        const lastElArr = lastEl.split('-');

                        lastElArr.splice(lastElArr.length - 1, 1, Number(lastElArr[lastElArr.length - 1]) + 1);
                        const nextEl = lastElArr.join('-');

                        arr[i].children.push(
                            Object.assign(expand, { el: nextEl })
                        );
                    } else {
                        const { el: parentEl } = arr[i];

                        arr[i].children = [
                            Object.assign(expand, { el: `${parentEl}-1` })
                        ];
                    }
                    resolve([copyInit, expand.el]);
                }
                return;
            }
            if (Array.isArray(arr[i].children)) {
                arg[0] = arr[i].children;
                main();
            }
        }
    };

    main();
});

export {
    Enum,
    searchInitStatus
};
