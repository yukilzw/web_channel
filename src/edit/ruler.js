import ReactDom from 'react-dom';
import React, { useContext, useEffect, useRef, useCallback, useState } from 'react';
import storeContext from './model/context';
import style from './style/ruler.less';

export default ({
    rulerPointList
}) => {
    const { state, dispatch, forceUpdate } = useContext(storeContext);
    const canvasBoxDOM = useRef();
    const canvasDOM = useRef();

    useEffect(() => {
        canvasDOM.current.width = canvasBoxDOM.current.offsetWidth;
        canvasDOM.current.height = canvasBoxDOM.current.offsetHeight;
    }, []);

    // useEffect(() => {
    //     const ctx = canvasDOM.current.getContext('2d');
    //     ctx.beginPath();
    //     ctx.strokeStyle = 'red';
    //     ctx.lineWidth = 20;
    //     ctx.moveTo(100, 100);
    //     ctx.lineTo(240, 200);
    //     ctx.stroke();
    //     ctx.beginPath();
    //     ctx.lineWidth = 5;
    //     ctx.strokeStyle = 'blue';
    //     ctx.moveTo(0, 20);
    //     ctx.lineTo(100, 120);
    //     ctx.stroke();
    // }, [rulerPointList]);

    return <div ref={canvasBoxDOM} className={style.box} >
        <canvas width="0" height="0" ref={canvasDOM} />
    </div>;
};