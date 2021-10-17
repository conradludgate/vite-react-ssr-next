import { ReactElement } from "react";
import { Link } from "react-router-dom";

export default function Index(): ReactElement {
    return <div>
        <Link to="/ssr">SSR</Link><br />
        <Link to="/ssg">SSG</Link><br />
        <Link to="/csr">CSR</Link><br />
    </div>
}
