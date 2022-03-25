import React from "react";
import styles from "./index.module.scss";
/**
 * @typedef TIconArgs
 * @property {string} name icon name
 * @property {string} nodeName
 * @property {string} className */
/**
 * fontAwesome icon wrap
 * @component
 * @param {TIconArgs} props
 */
export function Icon({ name, nodeName="span", ...rest }) {
    rest.className = `${styles.icon} ${rest.className || ""}`;
    return React.createElement(nodeName, rest, <svg xmlns="http://www.w3.org/2000/svg">
        <use xlinkHref={name} />
    </svg>);
}

/**
 * @typedef TIconBarArgs
 * @property {TIconArgs[]} icons
 */
/**
 * fontAwesome icon bar wrap
 * @param {TIconBarArgs} props
 */
export function IconBar({ icons, ...rest }) {
    rest.className = `${styles.iconBar} ${rest.className || ''}`;
    return Array.isArray(icons) && <div {...rest}>
        {icons.map((icon, idx) => <Icon key={`${idx}${icon.name}`} {...icon} />)}
    </div>;
}
