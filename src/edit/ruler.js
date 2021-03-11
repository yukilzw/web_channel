/**
 * @description 动态标尺画布
 */
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import style from './style/ruler.less';

export default forwardRef((_, ref) => {
    const canvasBoxDOM = useRef();
    const canvasDOM = useRef();

    useEffect(() => {
        canvasDOM.current.width = canvasBoxDOM.current.offsetWidth;
        canvasDOM.current.height = canvasBoxDOM.current.offsetHeight;
    }, []);

    useImperativeHandle(ref, () => ({
        repaint: (path) => {
            const ctx = canvasDOM.current.getContext('2d');
            ctx.clearRect(0, 0, canvasDOM.current.width, canvasDOM.current.height);
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 3;
            path.forEach(({ start, end }) => {
                ctx.beginPath();
                ctx.setLineDash([5, 5]);
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            });
        }
    }), []);

    return <div ref={canvasBoxDOM} className={style.box} >
        <canvas width="0" height="0" ref={canvasDOM} />
    </div>;
});