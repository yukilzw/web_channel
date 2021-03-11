/**
 * @description 动态标尺画布
 */
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import style from './style/ruler.less';

const paint = (canvasDOM, path) => {
    const ctx = canvasDOM.current.getContext('2d');
    ctx.clearRect(0, 0, canvasDOM.current.width, canvasDOM.current.height);
    path.forEach(({ start, end }) => {
        ctx.beginPath();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 3;
        ctx.setLineDash([1, 0]);
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        if (end.parent) {
            return;
        }
        const cur = document.getElementById(start.el);
        const target = document.getElementById(end.el);
        if (start.pos === 'LT' && end.pos === 'RB') {
            ctx.beginPath();
            ctx.setLineDash([5, 5]);
            ctx.moveTo(end.x - target.offsetWidth, end.y);
            ctx.lineTo(end.x - target.offsetWidth, end.y + cur.offsetHeight * 0.6);
            ctx.stroke();

            ctx.beginPath();
            ctx.setLineDash([1, 0]);
            ctx.lineWidth = 4.5;
            ctx.strokeStyle = 'rgb(92,176,221)';
            const y2 = end.y + cur.offsetHeight * 0.6 / 2;
            const sx2 = start.x + cur.offsetWidth;
            const ex2 = end.x - target.offsetWidth;
            ctx.moveTo(sx2, y2);
            ctx.lineTo(ex2, y2);
            ctx.stroke();

            ctx.beginPath();
            ctx.fillStyle = 'rgb(92,176,221)';
            const x3 = (sx2 + (ex2 - sx2) / 2);

            ctx.fillRect(
                x3 - 50, y2 - 15,
                100, 30
            );

            ctx.beginPath();
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = '24px pingfangsc-Regular, Arial';
            ctx.fillText(
                (ex2 - sx2).toFixed(0),
                x3, y2
            );
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