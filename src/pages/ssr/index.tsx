import { ReactElement } from "react";
import { Link } from "react-router-dom";
import { GetServerSideProps } from "../../lib/next";

interface SSRPageProps {
    text: string
}

export default function SSRPage({ text }: SSRPageProps): ReactElement {
    return <div>
        <p>Hello SSR {text}</p>
        <Link to="/ssr/bar">SSR BAR</Link>
        <Link to="/">Back</Link>
    </div>
}

export const getServerSideProps: GetServerSideProps<SSRPageProps> = async () => {
    return {
        props: {
            text: "foobar"
        }
    }
}
