import Body from "./body"
import Top from "./top"
import withDataAdapter from "./data-adapter";

export default withDataAdapter(function Root() {
    return <>
        <Top/>
        <Body/>
    </>;
})
