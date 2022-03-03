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
 * @property {React.ReactNode[]} children
 */
/**
 * @component
 * @param {TResizeParentArgs} props
 */
export function ResizeParent({ nodeName, children, ...rest }) {
    const refPrevPosition = useRef(null);
    if (children?.length) {
        const $childrenWithToggle = children.reduce((prev, curr, idx) => prev.concat([curr, <div key={idx} data-resize-idx={idx} className="resizeToggle" />]), []).slice(0, -1);
        function onResizing(ev) {
            const { x: prev, width: prevWidth, idx } = refPrevPosition.current;
            const currWidth = ev.clientX - prev + prevWidth * 1;
            if (currWidth > 0) {
                this.style.setProperty(`--RESIZE_IDX${idx}_WIDTH`, `${currWidth}px`);
            }
        }
        rest.onMouseDown = function onResizeStart(ev) {
            const $toggle = ev.target;
            if ($toggle.classList.contains("resizeToggle")) {
                const $parent = $toggle.parentElement;
                const $target = $toggle.previousElementSibling;
                refPrevPosition.current = { x: ev.clientX, width: $target.clientWidth, idx: $toggle.dataset.resizeIdx };
                $target.classList.add("resizing");
                $toggle.classList.add("active");
                $parent.addEventListener("mousemove", onResizing);
                $parent.addEventListener("mouseup", () => {
                    $parent.removeEventListener("mousemove", onResizing);
                    $target.classList.remove("resizing");
                    $toggle.classList.remove("active");
                }, true);
            }
        }
        return React.createElement(nodeName || "div", rest, $childrenWithToggle || null);
    }
    return null;
}