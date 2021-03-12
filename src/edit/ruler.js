/**
 * @description 动态标尺画布
 */
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import style from './style/ruler.less';

const paint = (canvasDOM, path) => {
    const ctx = canvasDOM.current.getContext('2d');
    ctx.clearRect(0, 0, canvasDOM.current.width, canvasDOM.current.height);
    path.forEach(({ start, end, overlap }) => {
        // 拖动节点对应的关键点实际DOM坐标（并不是鼠标拖动的坐标，因为当触发多个吸附边界时，鼠标的坐标与实际DOM坐标有差异，会影响canvas画线的精准性）
        const startAxis = {
            LT: {
                x: start.offsetRoot.left,
                y: start.offsetRoot.top
            },
            RT: {
                x: start.offsetRoot.left + start.dom.offsetWidth,
                y: start.offsetRoot.top
            },
            RB: {
                x: start.offsetRoot.left + start.dom.offsetWidth,
                y: start.offsetRoot.top + start.dom.offsetHeight
            },
            LB: {
                x: start.offsetRoot.left,
                y: start.offsetRoot.top + start.dom.offsetHeight
            },
            MM: {
                x: start.offsetRoot.left + start.dom.offsetWidth / 2,
                y: start.offsetRoot.top + start.dom.offsetHeight / 2
            }
        };
        // 关联目标节点对应的关键点实际DOM坐标
        const endAxis = {
            LT: {
                x: end.offsetRoot.left,
                y: end.offsetRoot.top
            },
            RT: {
                x: end.offsetRoot.left + end.dom.offsetWidth,
                y: end.offsetRoot.top
            },
            RB: {
                x: end.offsetRoot.left + end.dom.offsetWidth,
                y: end.offsetRoot.top + end.dom.offsetHeight
            },
            LB: {
                x: end.offsetRoot.left,
                y: end.offsetRoot.top + end.dom.offsetHeight
            },
            MM: {
                x: end.offsetRoot.left + end.dom.offsetWidth / 2,
                y: end.offsetRoot.top + end.dom.offsetHeight / 2
            }
        };
        const isXLine = Math.abs(startAxis[start.pos].y - endAxis[end.pos].y) <= 1;
        const isYLine = Math.abs(startAxis[start.pos].x - endAxis[end.pos].x) <= 1;
        // 不是水平线也不是垂直线就不绘制，视为脏数据
        if (!isXLine && !isYLine) {
            return;
        }
        // 开始绘制主辅助线
        ctx.beginPath();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 3;
        ctx.setLineDash([1e3, 0]);
        if (end.parent) {
            // 目标是自身父节点就绘制一条贯穿线
            if (isYLine) {
                ctx.moveTo(endAxis[end.pos].x, end.offsetRoot.top);
                ctx.lineTo(endAxis[end.pos].x, end.offsetRoot.top + end.dom.offsetHeight);
            }
            if (isXLine) {
                ctx.moveTo(end.offsetRoot.left, endAxis[end.pos].y);
                ctx.lineTo(end.offsetRoot.left + end.dom.offsetWidth, endAxis[end.pos].y);
            }
        } else {
            // 兄弟节点就将两最近关键点相连
            ctx.moveTo(startAxis[start.pos].x, startAxis[start.pos].y);
            ctx.lineTo(endAxis[end.pos].x, endAxis[end.pos].y);
        }
        ctx.stroke();
        // 节点不重叠补充绘制距离标尺
        if (!end.parent && !overlap) {
            ctx.beginPath();
            ctx.strokeStyle = 'red';
            ctx.setLineDash([5, 5]);
            ctx.fillStyle = 'red';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.font = '30px pingfangsc-Regular, Arial';
            // x轴标尺
            if (isXLine) {
                // 两点间线长，也是标尺展示距离，太小就没必要显示了，反而有视觉干扰
                const dis = Math.abs(endAxis[end.pos].x - startAxis[start.pos].x);
                if (dis >= 5) {
                    // 两测标尺卡槽的虚线
                    ctx.moveTo(startAxis[start.pos].x, startAxis[start.pos].y);
                    ctx.lineTo(startAxis[start.pos].x, startAxis[start.pos].y - 80);
                    ctx.stroke();
                    ctx.moveTo(endAxis[end.pos].x, endAxis[end.pos].y);
                    ctx.lineTo(endAxis[end.pos].x, endAxis[end.pos].y - 80);
                    ctx.stroke();
                    // 连接卡槽中间线
                    ctx.moveTo(startAxis[start.pos].x, endAxis[end.pos].y - 40);
                    ctx.lineTo(endAxis[end.pos].x, endAxis[end.pos].y - 40);
                    ctx.stroke();
                    // 当前标尺数字
                    ctx.fillText(
                        dis.toFixed(0),
                        startAxis[start.pos].x + (endAxis[end.pos].x - startAxis[start.pos].x) / 2, endAxis[end.pos].y - 40
                    );
                }
            }
            // y轴标尺
            if (isYLine) {
                const dis = Math.abs(endAxis[end.pos].y - startAxis[start.pos].y);
                if (dis >= 5) {
                    ctx.moveTo(startAxis[start.pos].x, startAxis[start.pos].y);
                    ctx.lineTo(startAxis[start.pos].x - 80, startAxis[start.pos].y);
                    ctx.stroke();
                    ctx.moveTo(endAxis[end.pos].x, endAxis[end.pos].y);
                    ctx.lineTo(endAxis[end.pos].x - 80, endAxis[end.pos].y);
                    ctx.stroke();
                    ctx.moveTo(endAxis[end.pos].x - 40, startAxis[start.pos].y);
                    ctx.lineTo(endAxis[end.pos].x - 40, endAxis[end.pos].y);
                    ctx.stroke();
                    // 绘制纵向标尺的区别在于文字，需要对原有文字坐标进行旋转、平移后贴近卡槽中间线
                    ctx.beginPath();
                    ctx.textBaseline = 'middle';
                    ctx.textAlign = 'center';
                    ctx.save();
                    const textCenterPoint = {
                        x: endAxis[end.pos].x - 40,
                        y: startAxis[start.pos].y + (endAxis[end.pos].y - startAxis[start.pos].y) / 2
                    };
                    ctx.translate(textCenterPoint.x, textCenterPoint.y);
                    ctx.translate(-18, 0);
                    ctx.rotate(-90 / 180 * Math.PI);
                    ctx.translate(-textCenterPoint.x, -textCenterPoint.y);
                    ctx.fillText(
                        dis.toFixed(0),
                        textCenterPoint.x, textCenterPoint.y
                    );
                    ctx.restore();
                }
            }
        }
    });
};

export default forwardRef((_, ref) => {
    const canvasBoxDOM = useRef();
    const canvasDOM = useRef();

    useEffect(() => {
        canvasDOM.current.width = canvasBoxDOM.current.offsetWidth;
        canvasDOM.current.height = canvasBoxDOM.current.offsetHeight;
    }, []);

    useImperativeHandle(ref, () => ({
        repaint: (path) => paint(canvasDOM, path)
    }), []);

    return <div ref={canvasBoxDOM} className={style.box} >
        <canvas width="0" height="0" ref={canvasDOM} />
    </div>;
});