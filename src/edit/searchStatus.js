/* eslint-disable complexity */
const Enum = {
    add: 'add',
    choose: 'choose',
    edit: 'edit',
    delete: 'delete'
};

const searchInitStatus = (...arg) => new Promise((resolve) => {
    const copyInit = JSON.parse(JSON.stringify(arg[0]));

    arg[0] = copyInit;
    const main = () => {
        const [arr, el, type, expand] = arg;

        for (let i = 0; i < arr.length; i++) {
            if (arr[i].el === el) {
                if (type === Enum.choose) {
                    resolve(arr[i]);
                } else if (type === Enum.edit) {
                    const { tabIndex, key, value } = expand;

                    if (tabIndex === 0) {
                        arr[i].style[key] = value;
                    } else if (tabIndex === 1) {
                        arr[i].props[key] = value;
                    }
                    resolve(copyInit);
                } else if (type === Enum.delete) {
                    arr.splice(i, 1);
                    resolve(copyInit);
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
