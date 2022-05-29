import React from "react";
import { Icon } from "component/icon";
import styles from "./index.module.scss";

/** @typedef {"info" | "warn" | "succ" | "error"} TMessageType */
/**
 * @typedef TInputWithMessageArgs
 * @property {string} message
 * @property {TMessageType} messageType
 * @property {string} containerClassName
 *
 */
/**
 *
 * @param {TInputWithMessageArgs} props
 */
export default function InputWithMessage({ message, messageType, containerClassName, children, ...rest }) {
    const $icon = message && ({
        info: <Icon name="#circle-info" className={styles.icon} />,
        warn: <Icon name="#circle-exclamation" className={styles.icon} />,
        succ: <Icon name="#circle-exclamation" className={styles.icon} />,
        error: <Icon name="#circle-xmark" className={styles.icon} />
    }[messageType] || null);
    const $messageInner = message && ($icon ? <div className={`${styles.message_inner} withIcon`}>
        {$icon}
        <div className={styles.message_inner}>{message}</div>
    </div> : <div className={styles.message_inner}>{message}</div>);
    const $messageOuter = $messageInner && <div className={`${styles.message_outer} ${messageType}`}>{$messageInner}</div>;
    rest.onKeyPress = (fn => e => {
        if ("function" === typeof fn)
            fn(e);
        if ("Enter" === e.key)
            e.target.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    })(rest.onKeyPress);

    return <label className={`${styles.input_with_message} ${containerClassName || ""}`}>
        <input {...rest}/>
        {$messageOuter}
        {children}
    </label>;
}
