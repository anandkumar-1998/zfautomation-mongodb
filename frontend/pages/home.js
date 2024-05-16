import { useState, useEffect } from 'react'
import * as utility from '../libraries/utility'
import Sidebar from '../components/sidebar'
import Navbar from '../components/navbar'
import Head from '../components/head'
import { EMPLOYEE_ALLMODULES, EMPLOYEE_STORAGELOCATION, FG_MATERIALS, SFG_MATERIALS, WEBAPPTITLE } from '../constants/appconstants'
import { MODULES } from '../firebase/firebaseConstants'
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { collection, getCountFromServer, query, where } from 'firebase/firestore'
import { db } from '../firebase/firebaseconfig'
const moment = extendMoment(Moment);
const Home = () => {

    useEffect(() => {
        utility.hideloading()
        var dateuid = moment().format("DD/MM/YYYY").replaceAll("/", "")
        var modules = utility.get_keyvalue(EMPLOYEE_ALLMODULES)
        Object.keys(MODULES.modules).map(modulekey => {
            if (modules.includes(modulekey)) {
                var value = utility.get_keyvalue("counter_" + dateuid + "_" + modulekey)
                if (value === "nothingfound") {
                    value = 0
                    utility.store_newvalue("counter_" + dateuid + "_" + modulekey, 0)
                }
                var item = ` <div id="${modulekey}" class="d-flex p-1" style="height: 150px; width: 50%; max-width: 250px !important">
                                                <div
                                                    class="clickrowtext mb-0 card bg-light-primary rounded w-100" >
                                                    <div class='card-body d-flex flex-column align-items-top p-4 d-flex flex-start gap-2'>
                                                        <h1 id="${modulekey}_counter" class="fw-light text-start text-dark  my-auto mb-0">
                                                            ${utility.padwithzero(value)}
                                                        </h1>
                                                        <span class="fw-bold text-start  text-muted mt-0 mb-2">
                                                           ${MODULES.modules[modulekey].label}
                                                        </span>


                                                    </div>

                                                </div>
                                            </div>`

                $("#modulesdiv").append(item)

                if (!MODULES.modules[modulekey].counterrequired) {
                    // utility.hideitem(modulekey + "_counter")
                    $("#" + modulekey + "_counter").text("")
                }
                $("#" + modulekey).on("click", function () {
                    navigatetopage(this.id);
                });
            }



        })


        getActiveUserCount()
        getstocktransferCount()
        getstockreceiveCount()
        $(window).focus(function () {
            console.log('welcome (back)');

            getActiveUserCount()
            getstocktransferCount()
            getstockreceiveCount()
        });
        $(window).blur(function () {
            console.log('bye bye');
        });
        // console.log(utility.get_keyvalue(FG_MATERIALS));
    }, [])

    function navigatetopage(modulekey) {
        window.location = MODULES.modules[modulekey].path
    }

    async function getActiveUserCount() {
        const q = query(
            collection(db, "UsersDetails"),
            where("isactive", "==", true)
        );
        const snapshot = await getCountFromServer(q);
        let count = snapshot.data().count
        $("#USERMASTER_counter").text(utility.padwithzero(count))
    }


    async function getstocktransferCount() {
        const q = query(
            collection(db, "IssueDetails"),
            where("MOVE_STLOC", "==", utility.get_keyvalue(EMPLOYEE_STORAGELOCATION)),
            where("ISSUE_TYPE", "==", "STOCKTRANSFER"),
            where("ISSUE_DATE", "==", utility.getDate())
            ,)
        const snapshot = await getCountFromServer(q);
        let count = snapshot.data().count
        $("#STOCKTRANSFER_counter").text(utility.padwithzero(count))
    }
    async function getstockreceiveCount() {
        const q = query(
            collection(db, "IssueDetails"),
            where("RCD_LOC", "==", utility.get_keyvalue(EMPLOYEE_STORAGELOCATION)),
            where("TR_QUAN", ">", 0),
        );
        const snapshot = await getCountFromServer(q);
        let count = snapshot.data().count
        $("#STOCKRECEIVE_counter").text(utility.padwithzero(count))
    }
    return (



        < main className='d-flex flex-column min-vh-100  homebg ' >
            <Head title={WEBAPPTITLE} />

            <div id="main" className="layout-navbar">
                <header>
                    <Navbar pagename={WEBAPPTITLE} />
                </header>
                <div id="main-content">
                    <div className="page-content  ">
                        <section className="pc-container d-flex flex-column p-1">
                            <div className="pcoded-content d-flex flex-column flex-grow-1 p-1">


                                <div className="card h-100 bg-transparent flex-grow-1 border-0 shadow-none p-1 mb-0 col-12  mx-auto">

                                    <div className="card-body p-1 d-flex flex-column gap-2" style={{
                                        overflow: "auto",
                                        // maxHeight: "100%"
                                    }}>

                                        <div id="modulesdiv" className="d-flex flex-wrap">

                                            {/* <div

                                                onClick={(e) => window.location = "/stockreceive"}
                                                className="clickrowtext mb-0 card bg-light-primary rounded  flex-grow-1" style={{ height: "150px", width: "50%", maxWidth: "250px" }}>

                                                <div className='card-body d-flex flex-column p-4 d-flex flex-start gap-2'>
                                                    <span className="fs-1 fw-thin text-start text-dark  my-auto mb-1">
                                                        02
                                                    </span>

                                                    <span className="fw-bolder text-start  text-dark mt-0 mb-2">
                                                        RECEIVE STOCK
                                                    </span>
                                                </div>

                                            </div> */}


                                        </div>
                                        <div className="d-flex p-1" style={{ height: "150px", width: "50%" }}>

                                        </div>
                                        {/* <div className="d-flex flex-row gap-2">
                                            <div
                                                onClick={(e) => window.location = "/stockissue"}

                                                className="clickrowtext mb-0 card bg-light-primary rounded flex-grow-1" style={{ height: "150px", width: "50%" }}>

                                                <div className='card-body p-2 d-flex flex-center gap-2'>
                                                    <span className="fw-bolder text-dark m-auto">
                                                        ISSUE STOCK
                                                    </span>


                                                </div>

                                            </div>

                                            <div

                                                onClick={(e) => window.location = "/stockreceive"}
                                                className="clickrowtext mb-0 card bg-light-primary rounded  flex-grow-1" style={{ height: "150px", width: "50%" }}>

                                                <div className='card-body p-2 d-flex flex-center gap-2'>
                                                    <span className="fw-bolder text-dark m-auto">
                                                        RECEIVE STOCK
                                                    </span>


                                                </div>

                                            </div>
                                        </div>

                                        <div className="d-flex flex-row gap-2 w-100">
                                            <div
                                                onClick={(e) => window.location = "/production-confirmation"}

                                                className="clickrowtext mb-0 card bg-light-primary rounded flex-grow-1" style={{ height: "150px", width: "50%" }}>

                                                <div className='card-body p-2 d-flex flex-center gap-2'>
                                                    <span className="fw-bolder text-center text-dark m-auto">
                                                        PROD. CONFIRMATION
                                                    </span>


                                                </div>

                                            </div>

                                            <div
                                                onClick={(e) => window.location = "/stocktransfer"}

                                                className="clickrowtext mb-0 card bg-light-primary rounded flex-grow-1" style={{ height: "150px", width: "50%" }}>

                                                <div className='card-body p-2 d-flex flex-center gap-2'>
                                                    <span className="fw-bolder text-center text-dark m-auto">
                                                        TRANSFER STOCK
                                                    </span>


                                                </div>

                                            </div>
                                        </div>
                                        <div className="d-flex flex-row gap-2 w-100">
                                            <div
                                                onClick={(e) => window.location = "/scanning"}

                                                className="clickrowtext mb-0 card bg-light-primary rounded flex-grow-1" style={{ height: "150px", width: "50%" }}>

                                                <div className='card-body p-2 d-flex flex-center gap-2'>
                                                    <span className="fw-bolder text-center text-dark m-auto">
                                                        SCANNING CONFIRMATION
                                                    </span>


                                                </div>

                                            </div>

                                            <div
                                                onClick={(e) => window.location = "/manual-confirmation"}

                                                className="clickrowtext mb-0 card bg-light-primary rounded flex-grow-1" style={{ height: "150px", width: "50%" }}>

                                                <div className='card-body p-2 d-flex flex-center gap-2'>
                                                    <span className="fw-bolder text-center text-dark m-auto">
                                                        MANUAL CONFIRMATION
                                                    </span>


                                                </div>

                                            </div>
                                        </div> */}
                                    </div>

                                </div>



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