import React, { useEffect, useRef } from 'react';

export function withResize($parent, Com) {
    function setToggleRef($tar) {
        if ($tar instanceof HTMLElement) {
            console.log('setToggle', $tar);
        }
    }
    return $parent instanceof HTMLElement && function ResizeWrap(props) {
        useEffect(() => {
            if ($parent instanceof HTMLElement) {
                console.log('ee', $parent);
            }
        }, []);
        return <><Com {...props} /><div ref={setToggleRef} >&nbsp;</div></>;
    };
}

/**
 * @typedef TResizeParentArgs
 * @property {string} nodeName 父元素
 * @property {string[]} vars css变量
 * @property {React.ReactNode[]} children
 */
/**
 * @component
 * @param {TResizeParentArgs} props
 */
export function ResizeParent({ nodeName, vars, children, ...rest }) {
    const refs = {
        $: useRef(null),
        $toggle: useRef(null),
        $target: useRef(null),
        prevSize: useRef(null),
    }
    if (children?.length) {
        const $childrenWithToggle = Array.isArray(vars)
            ? vars.reduce((prev, curr, idx) => [...prev, children[idx], <div key={curr} data-resize-name={curr} className="resizeToggle" />], []).concat(children.slice(vars.length))
            : children.reduce((prev, curr, idx) => [...prev, curr, <div key={idx} data-resize-name={`--RESIZE_IDX${idx}_WIDTH`} className="resizeToggle" />], []);
        function onResizeEnd() {
            refs.$.current.removeEventListener("mousemove", onResizing);
            refs.$target.current?.classList.remove("resizing");
            refs.$toggle.current?.classList.remove("active");
            refs.prevSize.current = null;
            refs.$target.current = null;
            refs.$toggle.current = null;
        }
        function onResizing(ev) {
            if (ev.buttons) {
                const varName = refs.$toggle.current?.dataset?.resizeName;
                const { x: prev, width: prevWidth } = refs.prevSize.current || {};
                const currWidth = ev.clientX - prev + prevWidth * 1;
                if (varName && currWidth > 0) {
                    refs.$.current.style.setProperty(varName, `${currWidth}px`);
                }
            }
            else
                onResizeEnd();
        }
        rest.ref = refs.$;
        rest.onMouseDown = function onResizeStart(ev) {
            refs.$toggle.current = ev.target;
            if (refs.$toggle.current.classList.contains("resizeToggle")) {
                refs.$target.current = refs.$toggle.current.previousElementSibling;
                refs.prevSize.current = { x: ev.clientX, width: refs.$target.current.clientWidth };
                refs.$target.current.classList.add("resizing");
                refs.$toggle.current.classList.add("active");
                refs.$.current.addEventListener("mousemove", onResizing);
                refs.$.current.addEventListener("mouseup", onResizeEnd, true);
            }
            else {
                refs.$.current.removeEventListener("mousemove", onResizing);
            }
        }
        return React.createElement(nodeName || "div", rest, $childrenWithToggle || null);
    }
    return null;
}