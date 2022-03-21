import styles from "./index.module.scss";
/**
 * @typedef TIconArgs
 * @property {string} name icon name
 * @property {string} className */
/**
 * fontAwesome icon wrap
 * @component
 * @param {TIconArgs} props
 */
export function Icon({ name, ...rest }) {
    rest.className = `${rest.className || ""} ${styles.icon}`
    return <span {...rest}>
        <svg xmlns="http://www.w3.org/2000/svg">
            <use xlinkHref={name} />
        </svg>
    </span>;
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
    return Array.isArray(icons) && <div {...rest}>
        {icons.map((icon, idx) => <Icon key={`${idx}${icon.name}`} {...icon} />)}
    </div>;
}
