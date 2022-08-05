import React, { useEffect, useRef } from 'react';
import { useState } from 'react';
import styles from "./index.module.scss";

/**
 * @typedef TVirtualListArgs
 * @property {number} rowHeight 列高
 * @property {number} rowCount 列总数
 * @property {string} [outerElement] 列表容器
 * @property {string} [innerElement] 滚动容器
 */
/**
 * @typedef TVirtualListRefData
 * @property {number} totalHeight 容器总高度
 */

/**
 * 虚拟滚动
 * @component
 * @param {TVirtualListArgs}
 */
export function VirtualListCore({ rowHeight=0, rowCount=0, outerElement="div", innerElement="div", children, ...rest }) {
    const [state, setState] = useState({ paddingTop: 0, start: 0 });
    const refs = {
        /** @type {React.MutableRefObject<TVirtualListRefData>} */
        data: useRef({ totalHeight: 0 })
    };
    // useEffect(() => {
    //     refs.data.current = {
    //         totalHeight: rowHeight * rowCount || 0
    //     };
    // }, [rowHeight, rowCount]);
    const attr = {
        innerContainer: {
            style: {
                height: rowHeight * rowCount || 0,
                paddingTop: state.paddingTop
            }
        },
        outerElement: {
            onScroll(ev) {
                const { scrollHeight, scrollTop, clientHeight } = ev.target;

                const start = Math.floor(scrollTop / rowHeight);
                const paddingTop = start * rowHeight;
                setState({ paddingTop, start });
                // console.log('os', scrollHeight, scrollTop, clientHeight)
            },
            ...rest
        }
    };
    const $subs = Array.from({ length: rowCount - state.start }).map((_, i) => React.createElement(children, { index: i + state.start }));
    const $innerContainer = React.createElement(innerElement, attr.innerContainer, $subs);
    return React.createElement(outerElement, attr.outerElement, $innerContainer);
}

export function VirtualList({ data, className, ...rest }) {
    const attr = {
        rowCount: data?.length * 1 || 0,
        className: `${styles.virtualList} ${className}`,
        ...rest
    };
    return React.createElement(VirtualListCore, attr);
}
