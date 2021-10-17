import { ReactElement } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";

export default function CSRPage(): ReactElement {
    const params = useParams<{id: string}>();
    return <div>
        <p>Hello CSR {params.id}</p>
        <Link to="/csr">Back</Link>
    </div>
}
