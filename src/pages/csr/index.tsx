import { ReactNode } from "react";
import { Link } from "react-router-dom";

export default function CSRPage(): ReactNode {
    return <div>
        <p>Hello CSR</p>
        <Link to="/csr/foobar">foobar</Link>
    </div>
}
