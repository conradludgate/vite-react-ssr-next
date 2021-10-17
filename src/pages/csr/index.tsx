import { ReactElement } from "react";
import { Link } from "react-router-dom";

export default function CSRPage(): ReactElement {
    return <div>
        <p>Hello CSR</p>
        <Link to="/csr/foo">CSR FOO</Link>
        <Link to="/">Back</Link>
    </div>
}
