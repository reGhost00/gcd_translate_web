import React, { useContext } from "react";
import TreeHeader from "./header";
import TreeBody from "./body";

import { DataAdapterContext } from "root/data-adapter";

import styles from "./index.module.scss";
import { classNamesGenerator } from "utils/c";
import { Icon } from "component/icon";

export default function BodyTree() {
    const { loading } = useContext(DataAdapterContext);
    return <aside className={styles.tree}>
        <div className={classNamesGenerator(styles.loading, { loading: loading.list })}>
            <Icon name="#loader" className="fa-spin" />
        </div>
        <TreeHeader />
        <TreeBody />
    </aside>;
}
