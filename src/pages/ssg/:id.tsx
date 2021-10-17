import { ReactElement } from "react";
import { Link } from "react-router-dom";
import { GetStaticProps } from "../../lib/next";

interface SSGPageProps {
    text: string
}

export default function SSGPage({text}: SSGPageProps): ReactElement {
    return <div>
        <p>Hello SSG {text}</p>
        <Link to="/ssg">Back</Link>
    </div>
}

export const getStaticProps: GetStaticProps<SSGPageProps> = async ({params}) => {
    return {
        props: {
            text: "foobar " + params.id
        }
    }
}
