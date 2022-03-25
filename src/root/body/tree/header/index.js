import { IconBar } from "component/icon";
import { deepFreeze } from "utils/c";
import styles from "./index.module.scss";

const DEF = deepFreeze({
    actionGroup: [
        { name: "#rotate", title: "刷新树", className: styles.headerMenu_icon, nodeName: "button" },
        { name: "#folder-plus", title: "添加文件夹", className: styles.headerMenu_icon, nodeName: "button" },
        { name: "#folder-arrow-up", title: "文件夹上传", className: styles.headerMenu_icon, nodeName: "button" },
    ]
});

export default function TreeHeader() {
    return <header className={styles.header}>
        <IconBar icons={DEF.actionGroup} />
    </header>;
}
