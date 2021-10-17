import { ReactElement } from "react";
import { Link } from "react-router-dom";
import { GetStaticProps } from "../../lib/next";

interface SSGPageProps {
    text: string
}

export default function SSGPage({text}: SSGPageProps): ReactElement {
    return <div>
        <p>Hello SSG {text}</p>
        <Link to="/ssg/baz">SSG BAZ</Link>
        <Link to="/">Back</Link>
    </div>
}

export const getStaticProps: GetStaticProps<SSGPageProps> = async () => {
    return {
        props: {
            text: "foobar"
        }
    }
}
