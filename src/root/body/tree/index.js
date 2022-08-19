import React, { useContext } from "react";
import TreeHeader from "./header";
import TreeBody from "./body";

import { NetworkAdapterContext } from "root/data-adapter";

import styles from "./index.module.scss";
import { classNamesGenerator as cn } from "utils/c";
import { Icon } from "component/icon";

export default function BodyTree() {
    const { loading } = useContext(NetworkAdapterContext);
    return <aside className={cn(styles.tree, loading.tree && "loading")}>
        <div className={cn(styles.loading, loading.tree && "active")}>
            <Icon name="#loader" className="fa-spin" />
        </div>
        <TreeHeader />
        <TreeBody />
    </aside>;
}
