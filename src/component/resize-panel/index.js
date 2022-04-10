import React, { useRef } from "react";
import styles from "./index.module.scss";

/**
 * @typedef TResizeParentArgs
 * @property {HTMLElement} parent css变量所在元素
 * @property {string} nodeName 容器
 * @property {string[]} vars css变量
 * @property {string} toggleClass toggle样式
 * @property {React.ReactNode[]} children
 */
/**
 * 水平调整宽度
 * @component
 * @param {TResizeParentArgs} props
 */
 export function HorizontalResizeParent({ nodeName, vars, toggleClassName, parent, children, ...rest }) {
    const refs = {
        $: useRef(null),
        $toggle: useRef(null),
        $target: useRef(null),
        prevSize: useRef(null),
        toggleCSS: useRef(null)
    }
    if (children?.length) {
        refs.toggleCSS.current = toggleClassName || styles.resize_toggle_horizontal;
        const $childrenWithToggle = Array.isArray(vars)
            ? vars.reduce((prev, curr, idx) => [...prev, children[idx], curr && <div key={curr} data-resize-name={curr} className={refs.toggleCSS.current} />], []).concat(children.slice(vars.length))
            : children.reduce((prev, curr, idx) => [...prev, curr, <div key={idx} data-resize-name={`--RESIZE_IDX${idx}_WIDTH`} className={refs.toggleCSS.current} />], []);
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
        rest.onMouseDown = function onResizeStart(ev) {
            refs.$toggle.current = ev.target;
            if (refs.$toggle.current.classList.contains(refs.toggleCSS.current)) {
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
        if (parent instanceof HTMLElement)
            refs.$.current = parent;
        else
            rest.ref = refs.$;
        return React.createElement(nodeName || "div", rest, $childrenWithToggle || null);
    }
    return null;
}
