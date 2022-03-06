import BodyTree from "./tree";
import BodyList from "./list";
import { HorizontalResizeParent } from "component/resize-panel";
import styles from "./index.module.scss";

export default function Body() {
    return <HorizontalResizeParent className={styles.body}>
        <BodyTree />
        <BodyList />
    </HorizontalResizeParent>
}