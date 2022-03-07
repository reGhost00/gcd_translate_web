import { Icon } from "component/icon";
import styles from "./index.module.scss";

export default function TreeHeader() {
    return <header className={styles.header}>
        <Icon name="#rotate" className={styles.headerMenu_icon} />
        <Icon name="#folder-plus" className={styles.headerMenu_icon} />
        <Icon name="#file-arrow-up" className={styles.headerMenu_icon} />
    </header>;
}
