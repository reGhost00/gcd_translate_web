import React, { useState, useRef, useEffect } from 'react';
import { classNamesGenerator } from 'utils/c';
import styles from "./index.module.scss";

const DEF_SCROLLING_TM = 200;
/**
 * @typedef {Parameters<React.createElement>[0]} TReactComponent React组件
 */
/**
 * @typedef TVirtualListArgsComponent
 * @property {TReactComponent} outer 滚动容器
 * @property {TReactComponent} inner 列表容器
 * @property {TReactComponent} empty 空列表
 */

const DEF_COMPONENT = {
    outer: "div",
    inner: "div",
    empty() {
        return null; // React.createElement("div", null, "无数据");
    }
};
/**
 * @typedef TVirtualListArgs
 * @property {number} rowHeight 列高
 * @property {number} rowCount 列总数
 * @property {TVirtualListArgsComponent} [component] 列表容器
 * @property {(index: number) => string} [setRowKey] 设置行key
 */
/**
 * @typedef TVirtualListRefData
 * @property {number} totalHeight 容器总高度
 */

/**
 * 虚拟滚动
 * @component
 * @param {TVirtualListArgs} props
 */
// export function VirtualList({ datarowHeight=0, rowCount=0, setRowKey=null, component=DEF_COMPONENT, children, ...rest }) {
export function VirtualList(props) {
    const [state, setState] = useState({ paddingTop: 0, start: 0, end: 0, scrolling: false });
    const { rowHeight=0, rowCount=0, setRowKey=null, component=DEF_COMPONENT, children, ...rest } = props;
    const refs = {
        scrollingTM: useRef(null),
        scrollingStamp: useRef(0),
        $outerContainer: useRef(null),
        outerContainerRect: useRef({ width: 0, height: 0 }),
        /** @type {React.MutableRefObject<ResizeObserver>} */
        resizeObserver: useRef(null),
    };
    const func = {
        getRowKey: "function" === typeof setRowKey ? setRowKey : v => v,
        onResizeCallback([entry]) {
            if (entry.contentRect.height !== refs.outerContainerRect.current.height) {
                func.setContainerState(entry.target.scrollTop, entry.contentRect.height);
            }
            refs.outerContainerRect.current = entry.contentRect;
        },
        setContainerState(scrollTop, clientHeight, scrolling=false) {
            const start = Math.floor(scrollTop / rowHeight) || 0;
            const end = Math.ceil(start + clientHeight / rowHeight) || 0;
            const paddingTop = start * rowHeight || 0;
            const newState = { paddingTop, start, end, scrolling };
            setState(newState);
            return newState;
        }
    };
    useEffect(() => {
        function resetObserver() {
            clearTimeout(refs.scrollingTM);
            if (refs.resizeObserver.current instanceof ResizeObserver)
                refs.resizeObserver.current.disconnect();
        }
        if (refs.$outerContainer.current instanceof HTMLElement) {
            if (refs.resizeObserver.current instanceof ResizeObserver)
                refs.resizeObserver.current.disconnect();
            const tar = refs.$outerContainer.current;
            refs.outerContainerRect.current = { width: tar.clientHeight, height: tar.clientHeight };
            refs.resizeObserver.current = new ResizeObserver(func.onResizeCallback);
            refs.resizeObserver.current.observe(refs.$outerContainer.current);
            func.setContainerState(tar.scrollTop, tar.clientHeight);
        }
        else
            resetObserver();
        return resetObserver;
    }, [refs.$outerContainer]);

    const attr = {
        innerContainer: {
            style: {
                height: rowHeight * rowCount || 0,
                paddingTop: state.paddingTop
            }
        },
        outerContainer: {
            ref: refs.$outerContainer,
            onScroll(ev) {
                const { scrollTop, clientHeight } = ev.target;
                const newState = func.setContainerState(scrollTop, clientHeight, true);
                clearTimeout(refs.scrollingTM.current);
                refs.scrollingTM.current = setTimeout(() => setState({ ...newState, scrolling: false }), DEF_SCROLLING_TM);
            },
            ...rest
        }
    };
    const $subs = Array.from({ length: Math.min(Math.abs(state.end - state.start), rowCount) }, (v, k) => {
        const index = k + state.start;
        return React.createElement(children, { key: func.getRowKey(index), index, scrolling: state.scrolling });
    });
    const $innerContainer = $subs.length ? React.createElement(component.inner || DEF_COMPONENT.inner, attr.innerContainer, $subs) : React.createElement(component.empty || DEF_COMPONENT.empty);
    return React.createElement(component.outer || DEF_COMPONENT.outer, attr.outerContainer, $innerContainer);
}

// export function VirtualList({ data, ...rest }) {
//     const attr = {
//         rowCount: data?.length * 1 || 0,
//         ...rest
//     };
//     return React.createElement(VirtualListCore, attr);
// }
