import React, { useRef } from "react";
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
    const refs = {
        $messageOuter: useRef(null),
        observer: useRef(null)
    }
    function setMessageObserver(tar) {
        if (tar instanceof HTMLElement && message) {
            if (refs.observer.current instanceof IntersectionObserver)
                refs.observer.current.disconnect();
            refs.observer.current = new IntersectionObserver(function cbIntersectionObserver([target]) {
                console.log('cb', target)
            });
            refs.observer.current.observe(tar);
        } else if (refs.observer.current instanceof IntersectionObserver) {
            refs.observer.current.disconnect();
            refs.observer.current = null;
        }
        refs.$messageOuter.current = tar
    }
    const $icon = {
        info: <Icon name="#circle-info" className={styles.icon} />,
        warn: <Icon name="#circle-exclamation" className={styles.icon} />,
        succ: <Icon name="#circle-exclamation" className={styles.icon} />,
        error: <Icon name="#circle-xmark" className={styles.icon} />
    }[messageType] || null;
    rest.onKeyPress = (fn => e => {
        if ("function" === typeof fn)
            fn(e);
        if ("Enter" === e.key)
            e.target.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    })(rest.onKeyPress);

    return <label className={`${styles.input_with_message} ${containerClassName || ""}`}>
        <input {...rest}/>
        {message && <div className={`${styles.message_outer} ${messageType || ""}`} ref={setMessageObserver}>
            <div className={styles.message_inner}>
                {$icon}
                <pre>{message}</pre>
            </div>
        </div>}
        {children}
    </label>;
}