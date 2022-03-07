import TreeHeader from "./header";
import TreeBody from "./body";
import styles from "./index.module.scss";

export default function BodyTree() {
    return <aside className={styles.tree}>
        <TreeHeader />
        <TreeBody />
    </aside>;
}
