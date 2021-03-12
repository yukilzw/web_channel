/**
 * @description 动态标尺画布
 */
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import style from './style/ruler.less';

const paint = (canvasDOM, path) => {
    const ctx = canvasDOM.current.getContext('2d');
    ctx.clearRect(0, 0, canvasDOM.current.width, canvasDOM.current.height);
    path.forEach(({ start, end, overlap }) => {
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
        if (
            Math.abs(startAxis[start.pos].x - endAxis[end.pos].x) > 1 &&
            Math.abs(startAxis[start.pos].y - endAxis[end.pos].y) > 1
        ) {
            return;
        }
        ctx.beginPath();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 3;
        ctx.setLineDash([Infinity, 0]);
        if (end.parent) {
            if (Math.abs(startAxis[start.pos].x - endAxis[end.pos].x) <= 1) {
                ctx.moveTo(endAxis[end.pos].x, end.offsetRoot.top);
                ctx.lineTo(endAxis[end.pos].x, end.offsetRoot.top + end.dom.offsetHeight);
            }
            if (Math.abs(startAxis[start.pos].y - endAxis[end.pos].y) <= 1) {
                ctx.moveTo(end.offsetRoot.left, endAxis[end.pos].y);
                ctx.lineTo(end.offsetRoot.left + end.dom.offsetWidth, endAxis[end.pos].y);
            }
        } else {
            ctx.moveTo(startAxis[start.pos].x, startAxis[start.pos].y);
            ctx.lineTo(endAxis[end.pos].x, endAxis[end.pos].y);
        }
        ctx.stroke();
        // console.log(overlap)
        // const cur = document.getElementById(start.el);
        // const target = document.getElementById(end.el);
        // if (start.pos === 'LT' && end.pos === 'RB') {
        //     ctx.beginPath();
        //     ctx.setLineDash([5, 5]);
        //     ctx.moveTo(end.x - target.offsetWidth, end.y);
        //     ctx.lineTo(end.x - target.offsetWidth, end.y + cur.offsetHeight * 0.6);
        //     ctx.stroke();

        //     ctx.beginPath();
        //     ctx.setLineDash([1, 0]);
        //     ctx.lineWidth = 4.5;
        //     ctx.strokeStyle = 'rgb(92,176,221)';
        //     const y2 = end.y + cur.offsetHeight * 0.6 / 2;
        //     const sx2 = start.x + cur.offsetWidth;
        //     const ex2 = end.x - target.offsetWidth;
        //     ctx.moveTo(sx2, y2);
        //     ctx.lineTo(ex2, y2);
        //     ctx.stroke();

        //     ctx.beginPath();
        //     ctx.fillStyle = 'rgb(92,176,221)';
        //     const x3 = (sx2 + (ex2 - sx2) / 2);

        //     ctx.fillRect(
        //         x3 - 50, y2 - 15,
        //         100, 30
        //     );

        //     ctx.beginPath();
        //     ctx.fillStyle = '#fff';
        //     ctx.textAlign = 'center';
        //     ctx.textBaseline = 'middle';
        //     ctx.font = '24px pingfangsc-Regular, Arial';
        //     ctx.fillText(
        //         (ex2 - sx2).toFixed(0),
        //         x3, y2
        //     );
        // }
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