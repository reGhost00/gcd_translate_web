import React from "react";
import styles from "./index.module.scss";

export default function Header() {
    return <header className={styles.header}>
        <span className={styles.header_title}>文件传输WEB</span>
    </header>;
}