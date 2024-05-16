import Head from 'next/head'

export default function PageHeader({ title }) {

    var env = process.env.NEXT_PUBLIC_ENVTYPE === "dev" ? "dev : " : ""
    return (<div>
        <Head>
            <title>{env + title}</title>
            {/* <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests"></meta> */}
        </Head>


    </div>)
}