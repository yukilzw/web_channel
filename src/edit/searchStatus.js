/* eslint-disable complexity */
const Enum = {
    choose: 'choose',
    edit: 'edit'
};

const searchInitStatus = (...arg) => new Promise((resolve) => {
    const copyInit = JSON.parse(JSON.stringify(arg[0]));

    arg[0] = copyInit;
    const main = () => {
        const [arr, el, data, expand] = arg;

        for (let i = 0; i < arr.length; i++) {
            if (arr[i].el === el) {
                if (data === Enum.choose) {
                    resolve(arr[i]);
                } else if (data === Enum.edit) {
                    const { tabIndex, key, value } = expand;

                    if (tabIndex === 0) {
                        arr[i].style[key] = value;
                    } else if (tabIndex === 1) {
                        arr[i].props[key] = value;
                    }
                    resolve(copyInit);
                } else if (Object.prototype.toString.call(data) === '[object Object]') {
                    if (Array.isArray(arr[i].children)) {
                        const { el: lastEl } = arr[i].children[arr[i].children.length - 1];
                        const lastElArr = lastEl.split('-');

                        lastElArr.splice(lastElArr.length - 1, 1, Number(lastElArr[lastElArr.length - 1]) + 1);
                        const nextEl = lastElArr.join('-');

                        arr[i].children.push(
                            Object.assign(data, { el: nextEl })
                        );
                    } else {
                        const { el: parentEl } = arr[i];

                        arr[i].children = [
                            Object.assign(data, { el: `${parentEl}-1` })
                        ];
                    }
                    resolve(copyInit);
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
