import ListHeader from "./header";
import ListBody from "./body";
import styles from "./index.module.scss";

export default function BodyList() {
    return <article className={styles.list}>
        <ListHeader />
        <ListBody />
    </article>;
}
