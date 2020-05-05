/* eslint-disable complexity */
/**
 * @description 搜索页面配置树
 * 编辑器内各种操作，都是对当前json tree的修改，然后触发compile重新渲染视图
 * 此方法根据id，搜索当前操作的目标节点的位置，根据不同的操作返回所需要的值
 * 考虑到日常搭建中组件嵌套层级不会过深，采用广度优先搜索
 */
const EnumEdit = {
    add: 'add',         // 插入
    choose: 'choose',   // 选择
    change: 'change',   // 编辑
    delete: 'delete'    // 删除
};

/**
 * @param {Array<Config>} arg[0] 页面配置tree
 * @param {String} arg[1] 要搜索的元素id
 * @param {EnumEdit} arg[2] 操作的枚举类型
 * @param {any} arg[3] 拓展参数，不同操作类型入参不同
 */
const searchTree = (...arg) => {
    // 深拷贝一份新的tree来操作，新tree能确保返回后dispatch触发React视图render
    arg[0] = JSON.parse(JSON.stringify(arg[0]));
    const [arr, el, type, expand] = arg;
    const root = {
        children: arr
    };
    const queue = [root];

    // 找到匹配元素后立即终止BFS
    while (queue.length > 0) {
        const config = queue.pop();
        const { children = [] } = config;

        for (let child of children) {
            if (child.el === el) {
                switch (type) {
                    case EnumEdit.choose:
                        return child;
                    case EnumEdit.change:
                        var { tabIndex, key, value } = expand;

                        if (tabIndex === 0) {
                            child.style[key] = value;
                        } else if (tabIndex === 1) {
                            child.props[key] = value;
                        }
                        return arr;
                    case EnumEdit.delete:
                        children.splice(children.indexOf(child), 1);
                        return arr;
                    case EnumEdit.add:
                        // 如果插入的目标存在子元素数组
                        if (Array.isArray(child.children)) {
                            const { el: lastEl } = child.children[child.children.length - 1];
                            const lastElArr = lastEl.split('-');

                            lastElArr.splice(lastElArr.length - 1, 1, Number(lastElArr[lastElArr.length - 1]) + 1);
                            const nextEl = lastElArr.join('-');

                            child.children.push(
                                Object.assign(expand, { el: nextEl })
                            );
                        // 如果插入的目标没有子元素
                        } else {
                            const { el: parentEl } = child;

                            child.children = [
                                Object.assign(expand, { el: `${parentEl}-1` })
                            ];
                        }
                        return [arr, expand.el];
                    default: return;
                }
            }
            queue.push(child);
        }
    }
};


export {
    EnumEdit,
    searchTree
};
