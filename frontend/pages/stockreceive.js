import { useState, useEffect, useRef } from 'react'
import * as utility from '../libraries/utility'
import * as constants from '../constants/appconstants'
import * as fbc from '../firebase/firebaseConstants'
import Sidebar from '../components/sidebar'
import Navbar from '../components/navbar'
import Head from '../components/head'
import $ from 'jquery'
import { DataTable } from "datatables.net-bs5"
import "datatables.net-colreorderwithresize-npm";
import "datatables.net-buttons-dt";
import "datatables.net-buttons/js/buttons.html5.js";
import "datatables.net-fixedheader-bs5/js/fixedHeader.bootstrap5.js"
import "datatables.net-select-bs5/js/select.bootstrap5"
import { useSnackbar } from 'notistack'
import { RequestconfirmStockReceive, RequestmaterialDetails } from '../firebase/masterAPIS'
import { arrayUnion, collection, doc, getDocs, increment, orderBy, query, runTransaction, where } from 'firebase/firestore'
import { db } from '../firebase/firebaseconfig'
import Moment from 'moment';
import { extendMoment } from 'moment-range';
const moment = extendMoment(Moment);
const Employees = () => {

    const referenceNumber = useRef(null);
    const [materialDetails, setmaterialDetails] = useState(null);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const showsnackbar = (variant, message) => {
        enqueueSnackbar(message, {
            variant: variant,
            anchorOrigin: { horizontal: 'center', vertical: 'top' },
        });
    }


    const errorCallback = (err) => {
        utility.hideloading();
        showsnackbar("error", err.message)
    }

    useEffect(() => {
        if (materialDetails == null) {
            $('#referencenumber').focus();

            $("#referencenumber").keyup(function (event) {
                if (event.keyCode === 13) {
                    getMaterialsForReferenceNumber()
                }
            });

            utility.hideloading();
            getMaterialsForReferenceNumber()
        }

    }, [materialDetails]);
    const checkifDataisCorrect = () => {
        $('.text-sm rounded form-control form-control-sm').removeClass(
            'is-invalid'
        );

        if (utility.isInputEmpty('referencenumber')) {
            $('#referencenumber').addClass('is-invalid');
            var message = 'Please Add Reference Number.';
            utility.showtippy('referencenumber', message, 'danger');
            showsnackbar('error', message);
            return false;
        } else {
            return true;
        }
    };
    async function getMaterialsForReferenceNumber() {
        var materials = []
        const q = query(
            collection(db, "IssueDetails"),
            where("RCD_LOC", "==", utility.get_keyvalue(constants.EMPLOYEE_STORAGELOCATION)),
            where("TR_QUAN", ">", 0),
            orderBy("TR_QUAN"),
            orderBy("ISSUE_TIMESTAMP", "desc"),
        );
        const querySnapshot = await getDocs(q);
        utility.hideloading();

        if (querySnapshot.size === 0) {
            var message = 'No Pending Stock Materials For';
            showsnackbar('error', message);
            return;
        } else {
            querySnapshot.forEach((doc) => {
                materials.push(doc.data());
            });
            materials.sort(function (x, y) {
                let a = Number(x["ISSUE_TIMESTAMP"]),
                    b = Number(y["ISSUE_TIMESTAMP"]);
                return a == b ? 0 : a > b ? -1 : 1;
            });
            setmaterialDetails(materials);
        }
    }

    function clearAll() {
        setmaterialDetails(null)
        utility.showloading()
    }

    function stocktransfer() {
        if (materialDetails === null) {
            errorCallback({
                message: 'NO Reference Details Available.',
            });
            return;
        }

        var materialCount = 0;
        for (
            let index = 0;
            index < Object.keys(materialDetails).length;
            index++
        ) {
            const material = materialDetails[index];
            let id = material["ISSUE_NUMBER"] + "_" + utility.sanitizeID(material["MATERIAL"]) + "_" + index + '_qty';
            console.log(id);
            if (!utility.isInputEmpty(id) &&
                (utility.getinputValueInNumbers(id) > material["TR_QUAN"] ||
                    utility.getinputValueInNumbers(id) <= 0)
            ) {
                $('#' + id).addClass('is-invalid');
                let message = 'Invalid Transfer Quantity, should be less than Pending Qty :' + material["TR_QUAN"];
                utility.showtippy(id, message, 'danger');
                showsnackbar('error', message);
                return false;
            }

            if (!utility.isInputEmpty(id) && utility.getinputValueInNumbers(id) > 0) {
                materialCount++
            }
        }

        utility.info_alert(
            `Receive Stock of ${materialCount} Materials.`,
            'Are you sure you want to continue.',
            'CONTINUE',
            'CANCEL',
            async () => {
                pushData();
            },
            null
        );
    }

    async function pushData() {
        utility.showloading();

        var selectedMaterials = []
        for (const [index, material] of materialDetails.entries()) {

            let qty_id = material["ISSUE_NUMBER"] + "_" + utility.sanitizeID(material["MATERIAL"]) + "_" + index + '_qty';
            if (utility.getinputValueInNumbers(qty_id) > 0) {
                console.log(material);
                let serialNumbers = []
                if ((material["HASSERIALNUMBER"] || false)) {
                    serialNumbers = material["PENDINGSERIALNUMBERS"].slice(0, utility.getinputValueInNumbers(qty_id));
                }
                console.log({ serialNumbers });
                selectedMaterials.push({
                    ...material,
                    CNF_QUAN: utility.getinputValueInNumbers(qty_id),
                    SELECTEDSERIALNUMBERS: serialNumbers,
                })
            }
        }
        if (selectedMaterials.length == 0) {
            errorCallback({
                message: 'No Materials Selected.',
            });
            utility.hideloading()
            return;
        }
        var log = {
            log: 'Stock Received For : ' + selectedMaterials.length + " Materials.",
            user: utility.get_keyvalue(constants.EMPLOYEE_FULLNAME),
            uid: utility.get_keyvalue(constants.EMPLOYEE_ID),
            date: utility.getDate(),
            timestamp: utility.getTimestamp(),
        }
        utility.showloading();

        console.log(selectedMaterials);

        var confirmStockReceive = await RequestconfirmStockReceive(selectedMaterials, log);
        utility.hideloading();
        if (confirmStockReceive.status) {
            utility.success_alert(
                "#" + confirmStockReceive.data + " Document Posted successfully",
                'Details Added successfully.',
                'OKAY',
                utility.reloadPage,
                null
            );
        } else {
            utility.info_alert(
                confirmStockReceive.message,
                'Something went wrong.',
                'OKAY',
                '',
                null,
                null
            );
        }
    }

    return (



        < main className='d-flex flex-column min-vh-100' >
            <Head title={"Receive Stock"} />

            <div id="main" className="layout-navbar">
                <header>
                    <Navbar pagename={"Receive Stock"} />
                </header>
                <div id="main-content">
                    <div className="page-content">
                        <section className="pc-container m-0 d-flex flex-column p-1">
                            <div className="pcoded-content pb-5 d-flex flex-column flex-grow-1 p-1" style={{
                                overflow: "scroll"
                            }}>


                                {
                                    materialDetails !== null ? <>
                                        <div className="card h-100 flex-grow-1 border p-1 mb-0 col-12 col-lg-4 mx-auto">
                                            <div className="card-header py-3 px-2">

                                                <div className="d-flex flex-row justify-content-between align-center">
                                                    <h5 className="my-auto fs-8 text-dark">Receive Stock</h5>
                                                    <h5 className="my-auto fw-bold text-end fs-8 text-dark">{materialDetails.length} Pending</h5>




                                                </div>


                                            </div>
                                            <div className="card-body p-1" style={{
                                                overflow: "auto",
                                                maxHeight: "100%"
                                            }}>

                                                {(materialDetails || []).map((material, index) => {
                                                    return (<div key={material["RES_ITEM"]} className={"card mb-2 " + (index % 2 ? " bg-secondary-subtle" : "")}>
                                                        <div className='card-header p-2 d-flex flex-row align-items-center justify-content-between'>

                                                            <div className="d-flex flex-row col-auto gap-2 ">


                                                                {material["ISSUE_TYPE"] === "PRODUCTIONORDERMATERIAL" ? <>
                                                                </> : <>
                                                                    <span className="bg-light-primary rounded text-primary fw-bold text-sm p-1 mb-0">
                                                                        #{material["RES_ITEM"] || "--"}
                                                                    </span> </>}


                                                                <span className="bg-light-info rounded text-info fw-bold text-sm p-1 mb-0">
                                                                    {material["PLANT"] || "--"}
                                                                </span>
                                                                <span className="bg-light-info rounded text-info fw-bold text-sm p-1 mb-0">
                                                                    {material["STORE_LOC"] || "--"}
                                                                </span>
                                                            </div>
                                                            <span className="bg-light-success rounded text-success fw-bold text-sm p-1 mb-0">
                                                                {material["MATERIAL"] || "--"}
                                                            </span>
                                                        </div>
                                                        <div className='card-body p-2 d-flex flex-column gap-2'>
                                                            <div className='d-flex flex-row'>
                                                                <div className="d-flex flex-column col-12">

                                                                    <span className="fw-bolder text-dark text-md mb-0">
                                                                        {material["SHORT_TEXT"] || "--"}
                                                                    </span>
                                                                </div>

                                                            </div>
                                                            <div className='d-flex flex-row'>
                                                                <div className="d-flex flex-column col-4 ">


                                                                    {material["ISSUE_TYPE"] === "PRODUCTIONORDERMATERIAL" ? <>
                                                                        <span className="text-gray-500 text-sm mb-1">
                                                                            Document Number
                                                                        </span>
                                                                        <span className="fw-bolder text-dark text-sm mb-0">
                                                                            {Number(material["MBLNR"]) || "--"}
                                                                        </span>
                                                                    </> : <>


                                                                        <span className="text-gray-500 text-sm mb-1">
                                                                            Reservation Number
                                                                        </span>
                                                                        <span className="fw-bolder text-dark text-sm mb-0">
                                                                            {material["RES_NO"] || "--"}
                                                                        </span> </>}
                                                                </div>
                                                                <div className="d-flex flex-column col-4 ">
                                                                    <span className="text-gray-500 text-sm mb-1">
                                                                        Issue Number
                                                                    </span>
                                                                    <span className="fw-bolder text-dark text-sm mb-0">
                                                                        {material["ISSUE_NUMBER"] || "--"}
                                                                    </span>
                                                                </div>
                                                                <div className="d-flex flex-column col-4 ">
                                                                    <span className="text-gray-500 text-sm mb-1">
                                                                        Issue Date & Time
                                                                    </span>
                                                                    <span className="fw-bolder text-dark text-sm mb-0">
                                                                        {moment.unix(material["ISSUE_TIMESTAMP"] || utility.getTimestamp()).format("DD/MM/YYYY HH:mm")}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className='d-flex flex-row gap-2 mt-2'>
                                                                <div className="d-flex flex-column col ">
                                                                    <span className="text-gray-500 text-sm mb-1">
                                                                        Pending Qty
                                                                    </span>
                                                                    <div className="input-group mb-0">
                                                                        <input
                                                                            disabled={true}
                                                                            type="number"
                                                                            className="form-control bg-input-user mb-1 form-control-sm fw-bold text-dark"
                                                                            placeholder=""
                                                                            defaultValue={material["TR_QUAN"]}
                                                                        />
                                                                        <span className="input-group-text form-control-sm text-xs fw-bold">
                                                                            {material["REQ_UNIT"] || ""}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="d-flex flex-column col ">
                                                                    <span className="text-gray-500 text-sm mb-1">
                                                                        Confirm Qty
                                                                    </span>
                                                                    <div className="input-group mb-0">
                                                                        <input
                                                                            id={material["ISSUE_NUMBER"] + "_" + utility.sanitizeID(material["MATERIAL"]) + "_" + index + "_qty"}
                                                                            type="number"
                                                                            className="form-control bg-input-user mb-1 form-control-sm fw-bold text-dark"
                                                                            placeholder=""
                                                                        />
                                                                        <span className="input-group-text form-control-sm text-xs fw-bold">
                                                                            {material["REQ_UNIT"] || ""}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                            </div>

                                                        </div>

                                                    </div>)
                                                })}




                                            </div>
                                            <div className="card-footer p-2 d-flex flex-row gap-2 justify-content-end">
                                                <button type="button" className="btn btn-sm btn-light-secondary" onClick={(e) => clearAll()}>Clear</button>
                                                <button type="button" id="saveBtn" className="btn btn-sm  btn-success" onClick={(e) => stocktransfer()} >Confirm Stock Receive</button>

                                            </div>
                                        </div>

                                    </> : <>

                                        <div className="d-none card h-100 border p-1 mb-0 col-12 col-lg-4 mx-auto">
                                            <div className="card-header py-3 px-2">

                                                <div className="d-flex flex-row justify-content-between align-center">
                                                    <h5 className="my-auto fs-6 text-dark">Receive Material Stock Details</h5>




                                                </div>


                                            </div>
                                            <div className="card-body p-3">
                                                <div className="row">
                                                    <div className="d-flex flex-column">
                                                        <label htmlFor="referencenumber" className="form-label text-muted mb-1 text-sm">Reference Number</label>
                                                        <input id="referencenumber"
                                                            ref={referenceNumber} className="mb-0 rounded form-control form-control-sm border-primary bg-input-user text-dark text-sm rounded form-control form-control-sm masterdata fw-bold" />
                                                    </div>
                                                </div>
                                                <br />
                                            </div>
                                            <div className="card-footer p-2 d-flex flex-row gap-2 justify-content-end">
                                                <button type="button" className="btn btn-sm btn-light-secondary" onClick={(e) => clearAll()}>Clear</button>
                                                <button type="button" id="saveBtn" className="btn btn-sm  btn-success" onClick={(e) => getMaterialsForReferenceNumber()} >Fetch Details</button>

                                            </div>
                                        </div>

                                    </>
                                }

                            </div>
                        </section>
                    </div>
                </div>
            </div >


        </main >


    );
}


export default Employees;

export async function getStaticProps() {
    return {
        props: { module: "STOCKRECEIVE", onlyAdminAccess: false }
    };
}