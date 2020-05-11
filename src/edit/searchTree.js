/* eslint-disable no-loop-func */
/* eslint-disable complexity */
/**
 * @description 搜索页面配置树
 * 编辑器内各种操作，都是对当前json tree的修改，然后触发compile重新渲染视图
 * 此方法根据id，搜索当前操作的目标节点的位置，根据不同的操作返回所需要的值
 * 考虑到日常搭建中组件嵌套层级不会过深，采用广度优先搜索
 */
import { DOMIN } from '../global';

const EnumEdit = {
    add: 'add',         // 插入
    choose: 'choose',   // 选择
    change: 'change',   // 编辑
    delete: 'delete',   // 删除
    hide: 'hide'       // 隐藏
};

/**
 * @param {Array<Config>} arr 页面配置tree
 * @param {String} el 要搜索的元素id
 * @param {EnumEdit} type 操作的枚举类型
 * @param {any} expand 拓展参数，不同操作类型入参不同
 */
const searchTree = (arr, el, type, expand) => {
    const root = {
        children: arr
    };
    const queue = [root];

    // 找到匹配元素后根据搜索类型返回对应结构
    while (queue.length > 0) {
        const config = queue.pop();
        const { children = [] } = config;

        for (let child of children) {
            if (child.el === el) {
                switch (type) {
                    case EnumEdit.hide:
                        if (child.hide) {
                            delete child.hide;
                        } else {
                            child.hide = true;
                        }
                        return arr;
                    case EnumEdit.choose:
                        return child;
                    case EnumEdit.change:
                        var { tabIndex, items } = expand;

                        items.forEach(({ key, value }) => {
                            if (tabIndex === 0) {
                                child.style[key] = value;
                            } else if (tabIndex === 1) {
                                child.props[key] = value;
                            }
                        });
                        return arr;
                    case EnumEdit.delete:
                        children.splice(children.indexOf(child), 1);
                        return arr;
                    case EnumEdit.add:
                        rangeKey(child, expand);

                        if (!Array.isArray(child.children)) {
                            child.children = [];
                        }
                        child.children.push(expand);
                        return [arr, expand.el];
                    default: return;
                }
            }
            queue.push(child);
        }
    }

    return null;
};

// 插入树片段签名算法，动态生成符合当前插入位置的el值(key)
/**
 * @param {targeNode} target 目标节点数
 * @param {treeNode} node 要插入的节点数
 * @param {number} index 内部递归标识符（外部调用勿传）
 */
const rangeKey = (target, node, index) => {
    // 传入index则在递归内直接按照索引生成el
    if (index) {
        const { el: parentEl } = target;

        Object.assign(node, { el: `${parentEl}-${index}` });
    // 如果插入的目标存在子元素数组
    } else if (Array.isArray(target.children) && target.children.length > 0) {
        const { el: lastEl } = target.children[target.children.length - 1];
        const lastElArr = lastEl.split('-');

        let nextEl;

        if (lastElArr.length === 1) {   // 目标位置为根节点
            nextEl = `wc${Number(lastEl.replace(/^wc/, '')) + 1}`;
        } else {
            // 解析当前的el为数组，在末尾添加新的el，最后合并为el字符串
            lastElArr.splice(lastElArr.length - 1, 1, Number(lastElArr[lastElArr.length - 1]) + 1);
            nextEl = lastElArr.join('-');
        }
        Object.assign(node, { el: nextEl });
    // 如果插入的目标没有子元素
    } else {
        const { el: parentEl } = target;

        Object.assign(node, { el: parentEl ? `${parentEl}-1` : `wc1` });
    }
    if (Array.isArray(node.children)) {
        node.children.forEach((child, i) => {
            rangeKey(node, child, i + 1);
        });
    }
};

// 根据组件JSON配置生成组件数片段
// 新组件的id，后面会根据层级结构动态生成
// 例如 #wc2-1-3，即该组件处于根目录下 -> 第二个元素 -> 第一个子元素 -> 第三个子元素
/**
 * @param {compConfigJSON} initConfig 目标节点对应菜单的静态JSON配置
 * @param {menu} menu 菜单数据
 */
const creatPart = (initConfig, menu) => {
    const config = JSON.parse(JSON.stringify(menu[initConfig.compName]));

    initConfig.defaultProps = Object.assign(config.defaultProps, initConfig.mergeProps);
    initConfig.defaultStyles = Object.assign(config.defaultStyles, initConfig.mergeStyles);
    Object.assign(config, initConfig);

    const { compName, defaultStyles, defaultProps, defaultChildren } = config;

    return {
        hook: DOMIN + `/comp/${compName}.js`,
        name: compName,
        style: defaultStyles,
        props: defaultProps,
        children: !Array.isArray(defaultChildren) ? undefined : defaultChildren.map((childConfig) => creatPart(childConfig, menu))
    };
};

export {
    EnumEdit,
    searchTree,
    rangeKey,
    creatPart
};
