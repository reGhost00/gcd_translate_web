import BodyTree from "./tree";
import BodyList from "./list";
import { HorizontalResizeParent } from "component/resize-panel";
import styles from "./index.module.scss";

export default function Body() {
    const attr = {
        className:      styles.body,
        toggleClassName:styles.resize_toggle,
        vars:           ["--treeWidth"]
    };
    return <HorizontalResizeParent {...attr}>
        <BodyTree />
        <BodyList />
    </HorizontalResizeParent>
}
