import { useState, useEffect } from 'react'
import * as utility from '../libraries/utility'
import Sidebar from '../components/sidebar'
import Navbar from '../components/navbar'
import Head from '../components/head'
import { WEBAPPTITLE } from '../constants/appconstants'
import AddTIcket from '../components/Tickets/AddTIcket'
const Home = () => {

    useEffect(() => {
       utility.hideloading()

    }, [])
    return (



        < main className='d-flex flex-column min-vh-100' >
            <Head title={WEBAPPTITLE} />
            <Sidebar />

            <div id="main" className="layout-navbar">
                <header>
                    <Navbar pagename={WEBAPPTITLE} />
                </header>
                <div id="main-content">
                    <div className="page-content">
                        <section className="pc-container d-flex flex-column p-1">
                            <div className="pcoded-content  d-flex flex-column flex-grow-1 p-1">
                                {/* <div className="flex-grow-1 d-flex flex-column"
                                    style={{ height: "95vh" }}
                                >
                                    <img src="../assets/images/zfplant.jpg" className="img-fluid rounded shadow h-100" />

                                </div> */}
                                <AddTIcket />
                            </div>
                        </section>
                    </div>
                </div>
            </div>

        </main >


    );
}


export default Home;

export async function getStaticProps() {
    return {
        props: { module: "HOME", onlyAdminAccess: false }
    };
}