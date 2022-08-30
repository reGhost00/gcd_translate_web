import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { deepFreeze } from "utils/c";
import styles from './style.module.scss';

/**
 * @typedef TGridRenderArgsOptsClassName
 * @property {string} [grid] grid容器
 * @property {string} [item] grid项
 */
/**
 * @typedef TGridRenderArgsOptsNodeName
 * @property {string} [grid] grid容器
 * @property {string} [item] grid项
 */
/**
 * @typedef TGridRenderArgsOpts
 * @property {"horizontal"|"vertical"} [direction] 表格方向
 * @property {TGridRenderArgsOptsClassName|string} [className] 自定义样式
 * @property {TGridRenderArgsOptsNodeName|string} [nodeName] 自定义节点
 */
/** @type {TGridRenderArgsOpts} */
const DEF_GRID_OPTS = deepFreeze({
    className: {
        grid: "renderGrid_grid",
        item: "renderGrid_item",
        [Symbol.toPrimitive]() {
            return "renderGrid_grid"
        }
    },
    nodeName: {
        grid: "div",
        item: "div",
        [Symbol.toPrimitive]() {
            return "div"
        }
    },
    direction: "horizontal", // "vertical"
    [Symbol.toPrimitive]() {
        return ""
    }
});
/**
 * @template T
 * @typedef {{ [P in keyof T]?: string }} TRenderGridArgsConfig<T>
 */
/**
 * @template T
 * @param {TRenderGridArgsConfig<T>} config { 项: 标题 }
 * @param {T} data 数据
 * @param {TGridRenderArgsOpts} opts 可选项
 * @returns {React.ReactElement}
 */
export function renderGrid(config, data, opts = DEF_GRID_OPTS) {
    if (config && data) {
        const gridNodeName = opts?.nodeName?.grid || opts?.nodeName || DEF_GRID_OPTS.nodeName.grid;
        const itemNodeName = opts?.nodeName?.item || DEF_GRID_OPTS.nodeName.item;
        const gridDirectionCSS = `${styles.grid} ${["horizontal", "vertical"].includes(opts.direction) ? opts.direction : "horizontal"}`;
        const gridCSS = `${gridDirectionCSS} ${opts?.className?.grid || opts?.className || DEF_GRID_OPTS.className.grid}`;
        const itemCSS = `${styles.item} ${opts?.className?.item || DEF_GRID_OPTS.className.item}`;
        const items = Object.entries(config).map(([key, title]) => {
            const itemTitle = React.createElement(itemNodeName, { className: itemCSS }, title);
            const itemValue = React.createElement(itemNodeName, { className: itemCSS }, data[key]);
            return React.createElement(React.Fragment, { key }, itemTitle, itemValue);
        });
        return React.createElement(gridNodeName, { className: gridCSS }, items);
    }
    throw new Error("renderGrid() 参数错误");
}
/**
 * @typedef TGridWrapClassName
 * @property {string} [wrapContainer] 容器
 * @property {string} [tooltipContainer] 浮层容器
 */
/**
 * @typedef TGridWrapNodeName
 * @property {string} [wrapContainer] 容器
 * @property {string} [tooltipContainer] 浮层容器
 */
/**
 * @typedef {TGridWrapClassName & TGridRenderArgsOptsClassName} TGridWrapOptsClassName tooltipGridWrap 自定义样式
 */
/**
 * @typedef {TGridWrapNodeName & TGridRenderArgsOptsNodeName} TGridWrapOptsNodeName tooltipGridWrap 自定义节点
 */
/**
 * @typedef TGridWrapOpts
 * @property {TGridWrapOptsClassName} [className] 自定义样式
 * @property {TGridWrapOptsNodeName} [nodeName] 自定义节点
 * @property {HTMLElement} [popupContainer] 浮层渲染节点，忽略原地渲染
 */
/** @type {TGridWrapOpts} */
const DEF_WRAP_OPTS = deepFreeze({
    className: {
        grid: "tooltipGrid_tooltip_grid",
        item: "tooltipGrid_tooltip_item",
        wrapContainer: "tooltipGrid_wrap",
        tooltipContainer: "tooltipGrid_tooltip",
        [Symbol.toPrimitive]() {
            return "tooltipGrid_wrap"
        }
    },
    nodeName: {
        grid: "ul",
        item: "li",
        wrapContainer: "div",
        tooltipContainer: "section",
        [Symbol.toPrimitive]() {
            return "div"
        }
    },
    popupContainer: null,
    [Symbol.toPrimitive]() {
        return ""
    }
});
function hofGetResizeTarget(fn) {
    return "function" === typeof fn && function getResizeTargetWrap(entries) {
        return entries[0].target instanceof HTMLElement && fn(entries[0].target, entries[0]);
    }
}

/**
 * 设置 popupContainer 的
 * @param {TTooltipWithGridWrapArgsPlacement} placement
 * @param {HTMLElement} target
 */
function positionVisibleGuarantee(placement, target) {
    if (target instanceof HTMLElement) {
        const rect = target.getBoundingClientRect();
        const { clientHeight, clientWidth } = document.body;
        if ((rect.height * rect.width || Number.POSITIVE_INFINITY) < clientHeight * clientWidth) {
            if (rect.left < 0 || rect.top < 0) {
                target.style.cssText = `left: ${rect.left < 0 ? 0 : target.style.left}; top: ${rect.top < 0 ? 0 : target.style.top};`;
            }
            else if (rect.right > clientWidth || rect.bottom > clientHeight)
                target.style.cssText = ``;
            // if ((target.style.cssText.includes("left") || target.style.cssText.includes("top")) && rect.left * rect.top < 0)

            // else if ((target.style.cssText.includes("right") || target.style.cssText.includes("bottom")) && rect.right * rect.bottom < 0)
            //     cssText += "top: 0; ";
            // if (target.style.cssText.includes("right") && rect.right > clientWidth)
            //     cssText += "right: 0; ";
            // if (target.style.cssText.includes("bottom") && rect.bottom > clientHeight)
            //     cssText += "bottom: 0; ";
            // if (cssText)
            //     target.style.cssText = cssText;
        }
    }
}

/**
 * 设置弹层 placement
 * @param {TTooltipWithGridWrapArgsPlacement} placement
 */
function getPlacementAttr(placement) {
    const placementStyleKVs = {
        topLeft: { style: { bottom: "100%", left: 0 },  },
        top: { style: { bottom: "100%", left: "50%", transform: "translateX(-50%)" },  },
        topRight: { style: { bottom: "100%", right: 0 },  },
        rightTop: { style: { left: "100%", top: 0 },  },
        right: { style: { left: "100%", top: "50%", transform: "translateY(-50%)" },  },
        rightBottom: { style: { left: "100%", bottom: 0 },  },
        bottomRight: { style: { top: "100%", right: 0 },  },
        bottom: { style: { top: "100%", left: "50%", transform: "translateX(-50%)" },  },
        bottomLeft: { style: { top: "100%", left: 0 },  },
        leftBottom: { style: { right: "100%", bottom: 0 },  },
        left: { style: { right: "100%", top: "50%", transform: "translateY(-50%)" },  },
        leftTop: { style: { right: "100%", top: 0 },  },
    };
    return (placement && placementStyleKVs[placement]) || placementStyleKVs.top;
}
/**
 * @typedef {"auto"|"topLeft"|"top"|"topRight"|"rightTop"|"right"|"rightBottom"|"bottomRight"|"bottom"|"bottomLeft"|"leftBottom"|"left"|"leftTop"} TTooltipWithGridWrapArgsPlacement 可用弹层位置
 */
/**
 * @template T
 * @typedef TTooltipWithGridWrapArgs<T>
 * @property {string | TGridWrapOptsClassName} className 自定义样式
 * @property {string | TGridWrapOptsNodeName} nodeName 自定义节点
 * @property {boolean} [fixed] 固定定位
 * @property {TTooltipWithGridWrapArgsPlacement} [placement] 弹层位置
 * @property {"horizontal"|"vertical"} [direction] 表格方向
 * @property {TRenderGridArgsConfig<T>} config { 项: 标题 }
 * @property {T} data 数据
 */
/**
 * @template T
 * @param {TTooltipWithGridWrapArgs<T>} props
 * @return {React.ReactElement}
 */
export default function TooltipWithGridWrap(props) {
    const refs = {
        /** @type {React.MutableRefObject<HTMLElement>} */
        $wrap: useRef(null),
        /** @type {React.MutableRefObject<HTMLElement>} */
        $container: useRef(null),
        /** @type {React.MutableRefObject<ResizeObserver>} */
        ob: useRef(null),
        // wrapStyle: useRef({}),
        /** @type {React.MutableRefObject<DOMRect>} */
        containerRect: useRef({})
    };
    const { className=DEF_WRAP_OPTS.className, nodeName=DEF_WRAP_OPTS.nodeName, fixed=false, config, data, direction="horizontal", placement="top", children=null, ...rest } = props;
    useEffect(() => {
        if (fixed && refs.$container.current instanceof HTMLElement) {
            refs.containerRect.current = refs.$container.current.getBoundingClientRect();
        }
    }, [refs.$container, fixed]);
    useEffect(() => {
        if (fixed && refs.$wrap.current instanceof HTMLElement) {
            if (refs.ob.current instanceof ResizeObserver)
                refs.ob.current.disconnect();
            if (refs.$container.current instanceof HTMLElement && !(refs.containerRect.current.width * refs.containerRect.current.height))
                refs.containerRect.current = refs.$container.current.getBoundingClientRect();
            if (refs.containerRect.current.width * refs.containerRect.current.height) {
                refs.ob.current = new ResizeObserver(function onResize([entry]) {
                    if (entry.contentRect.width * entry.contentRect.height) {
                        if ("top" === placement || "bottom" === placement) {
                            const offset = refs.containerRect.current.width - entry.contentRect.width;
                            const left = Math.max(Math.round(refs.containerRect.current.left + offset / 2), 0);
                            const top = "top" === placement
                                ? Math.max(Math.floor(refs.containerRect.current.top - entry.contentRect.height), 0)
                                : Math.min(Math.floor(refs.containerRect.current.bottom), document.body.clientHeight - entry.contentRect.height);
                            entry.target.style.cssText = `display: block; left: ${left}px; top: ${top}px`;
                        }
                    }
                });
                refs.ob.current.observe(refs.$wrap.current);
            }

        }
        return () => {
            if (refs.ob.current instanceof ResizeObserver)
                refs.ob.current.disconnect();
        };
    }, [refs.$wrap, fixed]);
    if (config && data) {
        const wrapContainerCSS = className?.wrapContainer || className || DEF_WRAP_OPTS.className.wrapContainer;
        const tooltipContainerCSS = className?.tooltipContainer || DEF_WRAP_OPTS.className.tooltipContainer;
        const wrapContainerNodeName = nodeName?.wrapContainer || nodeName || DEF_WRAP_OPTS.nodeName.wrapContainer;
        const tooltipContainerNodeName = nodeName?.tooltipContainer || DEF_WRAP_OPTS.nodeName.tooltipContainer;
        const attrGrid = {
            className: {
                grid: className?.grid || DEF_WRAP_OPTS.className.grid, item: className?.item || DEF_WRAP_OPTS.className.item
            },
            nodeName: {
                grid: nodeName?.grid || DEF_WRAP_OPTS.nodeName.grid, item: nodeName?.item || DEF_WRAP_OPTS.nodeName.item
            },
            direction: ["horizontal", "vertical"].includes(direction) ? direction : "horizontal"
        };
        const attrWrap = {
            ref: refs.$wrap,
            className: `${styles.tooltipWrap_inner} ${attrGrid.direction} ${tooltipContainerCSS}`,
        };
        const $grid = renderGrid(config, data, attrGrid);
        let $tooltip = null;
        rest.ref = refs.$container;
        rest.className = `${styles.tooltipWrap} ${wrapContainerCSS}`;
        if (fixed) {
            $tooltip = ReactDOM.createPortal(React.createElement(tooltipContainerNodeName, attrWrap, $grid), document.body);
            rest.onMouseEnter = function onMouseEnter() {
                if (refs.$wrap.current instanceof HTMLElement) {
                    refs.$wrap.current.style.cssText = "display: block"; // Object.entries(refs.wrapStyle.current).reduce((prev, [key, val]) => `${prev}${key}: ${val}px; `, "display: block; ");
                }
            };
            rest.onMouseLeave = function onMouseLeave() {
                if (refs.$wrap.current instanceof HTMLElement)
                    refs.$wrap.current.removeAttribute("style");
            };
        }
        else
            $tooltip = React.createElement(tooltipContainerNodeName, Object.assign(attrWrap, getPlacementAttr(placement)), $grid);

        return React.createElement(wrapContainerNodeName, rest, children, $tooltip);
    }
    return children;
}
