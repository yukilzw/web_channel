import { getOffsetWith, isOverlap } from '../common';
import styleBd from '../style/changeBox.less';

export const RulerData = {
    rulerPointList: [],                       // 暂存当前选中节点所关联标尺线的坐标集
    nextStylesbYChangeMask: null    // 拖动组件蒙层改变的属性记录，用于mouseup时同步更新到页面tree
};

// 执行时机在compile.js中changeTab按下拖动区域后，实现拖动蒙版编辑组件尺寸、定位、吸附、生成辅助线元数据
export const changeBoxByMask = ({ rulerCanvas, stateRef, setIsMoving }, e) => {
    const { changeCompBox, paintScale } = stateRef.current;

    if (!changeCompBox) {
        return;
    }
    const { key, el, clientY, clientX, startLeft, startTop, parentOffset, current } = changeCompBox;
    const container = document.querySelector(`#${el}`);
    const changeX = +((e.clientX - clientX) / paintScale).toFixed(0);
    const changeY = +((e.clientY - clientY) / paintScale).toFixed(0);
    const nextStyles = {};

    switch (key) {
        case 'LT':
            Object.assign(nextStyles, {
                width: (current.width - changeX).toFixed(0) + 'px',
                height: (current.height - changeY).toFixed(0) + 'px',
                left: (current.left + changeX).toFixed(0) + 'px',
                top: (current.top + changeY).toFixed(0) + 'px'
            });
            break;
        case 'MT':
            Object.assign(nextStyles, {
                height: (current.height - changeY).toFixed(0) + 'px',
                top: (current.top + changeY).toFixed(0) + 'px'
            });
            break;
        case 'RT':
            Object.assign(nextStyles, {
                width: (current.width + changeX).toFixed(0) + 'px',
                height: (current.height - changeY).toFixed(0) + 'px',
                top: (current.top + changeY).toFixed(0) + 'px'
            });
            break;
        case 'LM':
            Object.assign(nextStyles, {
                width: (current.width - changeX).toFixed(0) + 'px',
                left: (current.left + changeX).toFixed(0) + 'px'
            });
            break;
        case 'MM':
            var nextLeft = current.left + changeX;
            var nextTop = current.top + changeY;
            // 绝对定位时，拖动节点启用自动吸附算法
            if (current.position === 'absolute') {
                // 获取当前拖动节点的5个关键点的页面全局坐标
                var aboutDom = {
                    dom: document.getElementById(el),
                    offsetRoot: getOffsetWith(el)
                };
                var movePoint = {
                    el,
                    rect: {
                        x: startLeft + changeX,
                        y: startTop + changeY,
                        width: container.offsetWidth,
                        height: container.offsetHeight
                    },
                    data: [
                        {
                            x: startLeft + changeX,
                            y: startTop + changeY,
                            el, pos: 'LT', ...aboutDom
                        },
                        {
                            x: startLeft + container.offsetWidth / 2 + changeX,
                            y: startTop + container.offsetHeight / 2 + changeY,
                            el, pos: 'MM', ...aboutDom
                        },
                        {
                            x: startLeft + container.offsetWidth + changeX,
                            y: startTop + container.offsetHeight + changeY,
                            el, pos: 'RB', ...aboutDom
                        },
                        {
                            x: startLeft + container.offsetWidth + changeX,
                            y: startTop + changeY,
                            el, pos: 'RT', ...aboutDom
                        },
                        {
                            x: startLeft + changeX,
                            y: startTop + container.offsetHeight + changeY,
                            el, pos: 'LB', ...aboutDom
                        }
                    ]
                };
                var newRulerLineList = {
                    x: {}, y: {}
                };
                var tempShortDis = {
                    x: {}, y: {}
                };
                // 将拖动节点的关键点与其兄弟节点、父节点的关键点进行匹配校验。如果两点间的x或y坐标小于dis，则触发吸附
                RulerData.rulerPointList.forEach(({ data, rect }) => {
                    const dis = 16;
                    const overlap = isOverlap(rect, movePoint.rect, dis);    // 判断两个矩形是否有交集，用于后续辅助线距离标注
                    data.forEach((point) => {
                        const minX = point.x - dis;
                        const maxX = point.x + dis;
                        const minY = point.y - dis;
                        const maxY = point.y + dis;
                        movePoint.data.forEach((mPoint) => {
                            // 判断是否存在y轴吸附
                            if (mPoint.x >= minX && mPoint.x <= maxX) {
                                // 将两个点连成直线
                                let start = {
                                    ...mPoint,
                                    x: point.x
                                };
                                let end = { ...point };
                                // 如果是关键点来自父级，则从头到尾绘制一条贯穿辅助线
                                if (point.parent) {
                                    start.y = parentOffset.top;
                                    end.y = parentOffset.top + parentOffset.height;
                                }
                                if (isNaN(tempShortDis.x[point.x]) || Math.abs(start.y - end.y) < tempShortDis.x[point.x]) {
                                    if (!!~mPoint.pos.indexOf('R')) {
                                        // 拖动节点关键点如果在元素右侧，则需要在坐标计算定位后，额外再减去自身的宽度
                                        nextLeft = point.x - parentOffset.left - current.marginLeft - container.offsetWidth;
                                    } else if (!!~mPoint.pos.indexOf('M')) {
                                        // 同理，关键点为中央时，计算定位后，要减去自身宽度的一半
                                        nextLeft = point.x - parentOffset.left - current.marginLeft - container.offsetWidth / 2;
                                    } else {
                                        nextLeft = point.x - parentOffset.left - current.marginLeft;
                                    }
                                    newRulerLineList.x[point.x] = {
                                        start, end, overlap
                                    };
                                    tempShortDis.x[point.x] = Math.abs(start.y - end.y);
                                }
                            }
                            // 判断是否存在x轴吸附
                            if (mPoint.y >= minY && mPoint.y <= maxY) {
                                let start = {
                                    ...mPoint,
                                    y: point.y
                                };
                                let end = { ...point };
                                if (point.parent) {
                                    start.x = parentOffset.left;
                                    end.x = parentOffset.left + parentOffset.width;
                                }
                                if (isNaN(tempShortDis.y[point.y]) || Math.abs(start.x - end.x) < tempShortDis.y[point.y]) {
                                    if (!!~mPoint.pos.indexOf('B')) {
                                        nextTop = point.y - parentOffset.top - current.marginTop - container.offsetHeight;
                                    } else if (!!~mPoint.pos.indexOf('M')) {
                                        nextTop = point.y - parentOffset.top - current.marginTop - container.offsetHeight / 2;
                                    } else {
                                        nextTop = point.y - parentOffset.top - current.marginTop;
                                    }
                                    newRulerLineList.y[point.y] = {
                                        start, end, overlap
                                    };
                                    tempShortDis.y[point.y] = Math.abs(start.x - end.x);
                                }
                            }
                        });
                    });
                });
                // 通知标尺cavans重绘辅助线
                const lineList = [];
                Object.keys(newRulerLineList).forEach((key) => {
                    const data = newRulerLineList[key];
                    Object.keys(data).forEach((keyR) => {
                        lineList.push(data[keyR]);
                    });
                });
                rulerCanvas.current?.repaint(lineList);
            }
            Object.assign(nextStyles, {
                left: nextLeft.toFixed(0) + 'px',
                top: nextTop.toFixed(0) + 'px',
                right: null,
                bottom: null
            });
            break;
        case 'RM':
            Object.assign(nextStyles, {
                width: (current.width + changeX).toFixed(0) + 'px'
            });
            break;
        case 'LB':
            Object.assign(nextStyles, {
                width: (current.width - changeX).toFixed(0) + 'px',
                height: (current.height + changeY).toFixed(0) + 'px',
                left: (current.left + changeX).toFixed(0) + 'px'
            });
            break;
        case 'MB':
            Object.assign(nextStyles, {
                height: (current.height + changeY).toFixed(0) + 'px'
            });
            break;
        case 'RB':
            Object.assign(nextStyles, {
                width: (current.width + changeX).toFixed(0) + 'px',
                height: (current.height + changeY).toFixed(0) + 'px'
            });
            break;
        default: break;
    }
    Object.assign(container.style, nextStyles);
    RulerData.nextStylesbYChangeMask = nextStyles;
    const computedStyle = window.getComputedStyle(container);

    document.querySelector(`.${styleBd.topLeftTip}`).innerHTML = `${parseInt(computedStyle.left)},${parseInt(computedStyle.top)}`;
    document.querySelector(`.${styleBd.bottomTip}`).innerHTML = parseInt(computedStyle.width);
    document.querySelector(`.${styleBd.rightTip}`).innerHTML = parseInt(computedStyle.height);

    setIsMoving(true);
};