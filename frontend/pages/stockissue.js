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
import { RequestAddorUpdateUser, RequestGetAllUsers } from '../apis/masterAPIS'
import { RequestreservationDetails } from '../firebase/masterAPIS'
import { arrayUnion, doc, increment, runTransaction } from 'firebase/firestore'
import { db } from '../firebase/firebaseconfig'

import Moment from 'moment';
import { extendMoment } from 'moment-range';
const moment = extendMoment(Moment);
const StockIssue = () => {

    const reservationNumber = useRef(null);
    const [resNumber, setresNumber] = useState("");
    const [reservationDetails, setreservationDetails] = useState(null);
    const [allEmployeeDocs, setEmployeeDocs] = useState([])
    const [selectedModules, setselectedModules] = useState([])
    const [contentModal, setcontentModal] = useState(null);
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
        if (reservationDetails == null) {
            $('#reservationnumber').focus();

            $("#reservationnumber").keyup(function (event) {
                if (event.keyCode === 13) {
                    getReservationDetails()
                }
            });

            utility.hideloading();
        }

    }, [reservationDetails]);
    const checkifDataisCorrect = () => {
        $('.text-sm rounded form-control form-control-sm').removeClass(
            'is-invalid'
        );

        if (utility.isInputEmpty('reservationnumber')) {
            $('#reservationnumber').addClass('is-invalid');
            var message = 'Please Add Reservation Number.';
            utility.showtippy('reservationnumber', message, 'danger');
            showsnackbar('error', message);
            return false;
        } else {
            return true;
        }
    };
    async function getReservationDetails() {

        if (checkifDataisCorrect()) {
            utility.showloading();
            var reservationDetails = await RequestreservationDetails(utility.getinputValue('reservationnumber'));
            utility.hideloading();
            setresNumber(utility.getinputValueInNumbers('reservationnumber'))
            console.log(reservationDetails);

            if (reservationDetails.status) {
                setreservationDetails(reservationDetails.data);
            } else {
                var message = 'Failed To Continue, ' + reservationDetails.message;
                showsnackbar('error', message);
            }
        }
    }

    function clearAll() {
        $("#reservationnumber").val("")
        setreservationDetails(null)
        setresNumber("")
    }

    function stocktransfer() {
        if (reservationDetails === null) {
            errorCallback({
                message: 'NO Reservation Details Available.',
            });
            return;
        }

        var materialCount = 0;
        for (
            let index = 0;
            index < Object.keys(reservationDetails).length;
            index++
        ) {
            const material = reservationDetails[index];
            let id = utility.sanitizeID(material["MATERIAL"]) + '_qty';

            if (!utility.isInputEmpty(id) &&
                (utility.getinputValueInNumbers(id) > material["AVAIL_QUAN"] ||
                    utility.getinputValueInNumbers(id) <= 0)
            ) {
                $('#' + id).addClass('is-invalid');
                let message = 'Invalid Issue Quantity, should be less than Available Qty :' + material["AVAIL_QUAN"];
                utility.showtippy(id, message, 'danger');
                showsnackbar('error', message);
                return false;
            }
            if (!utility.isInputEmpty(id) &&
                (utility.getinputValueInNumbers(id) > material["ACTUALSTOCK_QUAN"] ||
                    utility.getinputValueInNumbers(id) <= 0)
            ) {
                $('#' + id).addClass('is-invalid');
                let message = 'Stock Deficient : ' + (material["ACTUALSTOCK_QUAN"] - utility.getinputValueInNumbers(id));
                utility.showtippy(id, message, 'danger');
                showsnackbar('error', message);
                return false;
            }

            if (!utility.isInputEmpty(id) && utility.getinputValueInNumbers(id) > 0) {
                materialCount++
            }
        }

        utility.info_alert(
            `Stock Issue ${materialCount} Materials From of Reservation #` + resNumber,
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
        for (let material of reservationDetails) {
            let qty_id = utility.sanitizeID(material["MATERIAL"]) + '_qty';
            if (utility.getinputValueInNumbers(qty_id) > 0 && (material["WITHDRAWN"] || "").toUpperCase() != "X") {
                selectedMaterials.push(material)
            }
        }
        if (selectedMaterials.length == 0) {
            errorCallback({
                message: 'No Materials Selected.',
            });
            utility.hideloading()
            return;
        }

        try {
            const res = await runTransaction(db, async (transaction) => {
                for (let material of selectedMaterials) {
                    let qty_id = utility.sanitizeID(material["MATERIAL"]) + '_qty';

                    let id =
                        material["RES_ITEM"] +
                        '_' +
                        material["PLANT"] +
                        '_' +
                        utility.sanitizeID(material["MATERIAL"])

                    const ref = doc(db, 'TransitStockDetails', id);
                    const docSnap = await transaction.get(ref);
                    if (docSnap.exists()) {

                        var availableqty = material["REQ_QUAN"] - docSnap.data()["TR_QUAN"]
                        if (utility.getinputValueInNumbers(qty_id) > availableqty) {
                            return {
                                status: false,
                                message:
                                    'Material Quantity Changed for ' + material["MATERIAL"] + ", " + material["SHORT_TEXT"] + " to " +
                                    availableqty,
                            };
                        }
                    }
                }

                const counterRef = doc(db, 'CounterDetails', "TransitStockCounter");

                var financialyear = utility.getFinancialYear(moment().format('DD/MM/YYYY'));
                var poPlantInitials = selectedMaterials[0]["PLANT"]
                var financialyearInitials = financialyear.toString().slice(-2);
                var defaultCounter = Number(
                    poPlantInitials + financialyearInitials + '000000'
                );

                var counter = defaultCounter + 1;

                const docSnap = await transaction.get(counterRef);
                if (docSnap.exists()) {
                    if (
                        docSnap.data()[poPlantInitials + '_' + financialyearInitials] != undefined
                    ) {
                        counter = docSnap.data()[poPlantInitials + '_' + financialyearInitials].counter + 1;
                    }
                }


                for (let material of selectedMaterials) {
                    let qty_id = utility.sanitizeID(material["MATERIAL"]) + '_qty';
                    let location_id = utility.sanitizeID(material["MATERIAL"]) + '_location';

                    let rcd_location = material["MOVE_STLOC"]
                    let id =
                        material["RES_NO"] +
                        '_' +
                        material["PLANT"] +
                        '_' +
                        utility.sanitizeID(material["MATERIAL"]);

                    const transitref = doc(db, 'TransitStockDetails', id);
                    const ref = doc(db, 'IssueDetails', counter + "_" + id);
                    delete material["AVAIL_QUAN"]
                    await transaction.set(
                        transitref,
                        {

                            ISSUE_NUMBERS: arrayUnion(counter),
                            ...material,
                            RCD_LOC: (rcd_location).toString(),
                            TR_QUAN: increment(utility.getinputValueInNumbers(qty_id)),
                            RCD_QUAN: increment(0),
                            LOGS: arrayUnion({
                                log: 'Stock Issue : ' + utility.getinputValueInNumbers(qty_id) + " to " + rcd_location,
                                user: utility.get_keyvalue(constants.EMPLOYEE_FULLNAME),
                                uid: utility.get_keyvalue(constants.EMPLOYEE_ID),
                                date: utility.getDate(),
                                timestamp: utility.getTimestamp(),
                            }),
                        },
                        { merge: true }
                    );
                    await transaction.set(
                        ref,
                        {
                            ...material,
                            ISSUE_TYPE: "REGULARMATERIAL",
                            ISSUE_NUMBER: counter,
                            ISSUE_DATE: utility.getDate(),
                            ISSUE_TIMESTAMP: utility.getTimestamp(),
                            RCD_LOC: rcd_location.toString(),
                            TR_QUAN: increment(utility.getinputValueInNumbers(qty_id)),
                            RCD_QUAN: increment(0),
                            LOGS: arrayUnion({
                                log: 'Stock Issue : ' + utility.getinputValueInNumbers(qty_id) + " to " + rcd_location,
                                user: utility.get_keyvalue(constants.EMPLOYEE_FULLNAME),
                                uid: utility.get_keyvalue(constants.EMPLOYEE_ID),
                                date: utility.getDate(),
                                timestamp: utility.getTimestamp(),
                            }),
                            username: utility.get_keyvalue(constants.EMPLOYEE_FULLNAME),
                            useruid: utility.get_keyvalue(constants.EMPLOYEE_ID),
                        },
                        { merge: true }
                    );
                }
                transaction.set(
                    counterRef,
                    { [poPlantInitials + '_' + financialyearInitials]: { counter } },
                    { merge: true }
                );
                return { status: true, message: "#" + counter + ' Issue Number Generated, Material Stock Issueed.' };
            });

            utility.hideloading();
            if (res.status) {
                var value = utility.get_keyvalue("counter_" + moment().format("DD/MM/YYYY").replaceAll("/", "") + "_STOCKISSUE")
                if (value === "nothingfound") {
                    value = 0
                }
                value++

                utility.store_newvalue("counter_" + moment().format("DD/MM/YYYY").replaceAll("/", "") + "_STOCKISSUE", value)
                utility.success_alert(
                    res.message,
                    'Details Added successfully.',
                    'OKAY',
                    utility.reloadPage,
                    null
                );
            } else {
                utility.info_alert(
                    res.message,
                    'Something went wrong.',
                    'OKAY',
                    '',
                    null,
                    null
                );
            }
        } catch (e) {
            utility.hideloading();
            errorCallback({
                message: e.message,
            });
        }
    }

    return (



        < main className='d-flex flex-column min-vh-100' >
            <Head title={"Reservation Stock Issue"} />

            <div id="main" className="layout-navbar">
                <header>
                    <Navbar pagename={"Reservation Stock Issue"} />
                </header>
                <div id="main-content">
                    <div className="page-content">
                        <section className="pc-container m-0 d-flex flex-column p-1">
                            <div className="pcoded-content pb-5 d-flex flex-column flex-grow-1 p-1" style={{
                                overflow: "scroll"
                            }}>



                                {
                                    reservationDetails !== null ? <>
                                        <div className="card h-100 flex-grow-1 border p-1 mb-0 col-12 col-lg-4 mx-auto">
                                            <div className="card-header py-3 px-2">

                                                <div className="d-flex flex-row justify-content-between align-center">
                                                    <h5 className="my-auto fs-8 text-dark"> Stock Issue</h5>
                                                    <h5 className="my-auto fw-bold text-end fs-8 text-dark">{resNumber}</h5>




                                                </div>


                                            </div>
                                            <div className="card-body p-1" style={{
                                                overflow: "auto",
                                                maxHeight: "100%"
                                            }}>

                                                {(reservationDetails || []).map((material, index) => {
                                                    return (<div key={material["RES_ITEM"]} className={"card mb-2 " + (index % 2 ? " bg-secondary-subtle" : "")}>
                                                        <div className='card-header p-2 d-flex flex-row align-items-center justify-content-between'>

                                                            <div className="d-flex flex-row col-auto gap-2 ">
                                                                <span className="bg-light-primary rounded text-primary fw-bold text-sm p-1 mb-0">
                                                                    #{material["RES_ITEM"] || "--"}
                                                                </span>
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
                                                                    <span className="text-gray-500 text-sm mb-1">
                                                                        Required Qty
                                                                    </span>
                                                                    <span className="fw-bolder text-dark text-sm mb-0">
                                                                        {material["REQ_QUAN"] || "0"} {material["REQ_UNIT"] || "--"}
                                                                    </span>
                                                                </div>
                                                                <div className="d-flex flex-column col-4 ">
                                                                    <span className="text-gray-500 text-sm mb-1">
                                                                        Transit Qty
                                                                    </span>
                                                                    <span className="fw-bolder text-dark text-sm mb-0">

                                                                        {material["TR_QUAN"] || "0"} {material["REQ_UNIT"] || "--"}
                                                                    </span>
                                                                </div>
                                                                <div className="d-flex flex-column col-4 ">
                                                                    <span className="text-gray-500 text-sm mb-1">
                                                                        Available Qty
                                                                    </span>
                                                                    <span className="fw-bolder text-dark text-sm mb-0">
                                                                        {material["AVAIL_QUAN"] || "0"} {material["REQ_UNIT"] || "--"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className='d-flex flex-row gap-2'>
                                                                <div className="d-flex flex-column col ">
                                                                    <span className="text-gray-500 text-sm mb-1">
                                                                        Issue Qty
                                                                    </span>
                                                                    <div className="input-group mb-0">
                                                                        <input
                                                                            id={utility.sanitizeID(material["MATERIAL"]) + "_qty"}
                                                                            disabled={(material["WITHDRAWN"] || "") === "X"}
                                                                            type="number"
                                                                            className={"form-control mb-1 form-control-sm fw-bold text-dark " + ((material["WITHDRAWN"] || "") !== "X" ? " bg-input-user " : "")}
                                                                            placeholder=""
                                                                        />
                                                                        <span className="input-group-text form-control-sm text-xs fw-bold">
                                                                            {material["REQ_UNIT"] || "--"}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="d-flex flex-column col">
                                                                    <span className="text-gray-500 text-sm mb-1">
                                                                        Issue Location
                                                                    </span>
                                                                    <div className="input-group mb-0">
                                                                        <input
                                                                            id={utility.sanitizeID(material["MATERIAL"]) + "_location"}
                                                                            type="number"
                                                                            disabled={true}
                                                                            defaultValue={material["MOVE_STLOC"]}
                                                                            className={"form-control mb-1 form-control-sm fw-bold text-dark " + ((material["WITHDRAWN"] || "") !== "X" ? " bg-input-user " : "")}
                                                                            placeholder=""
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                        </div>

                                                    </div>)
                                                })}




                                            </div>
                                            <div className="card-footer p-2 d-flex flex-row gap-2 justify-content-end">
                                                <button type="button" className="btn btn-sm btn-light-secondary" onClick={(e) => clearAll()}>Clear</button>
                                                <button type="button" id="saveBtn" className="btn btn-sm  btn-success" onClick={(e) => stocktransfer()} >Confirm Stock Issue</button>

                                            </div>
                                        </div>

                                    </> : <>

                                        <div className="card h-100 border p-1 mb-0 col-12 col-lg-4 mx-auto">
                                            <div className="card-header py-3 px-2">

                                                <div className="d-flex flex-row justify-content-between align-center">
                                                    <h5 className="my-auto fs-6 text-dark">Reservation Details</h5>




                                                </div>


                                            </div>
                                            <div className="card-body p-3">
                                                <div className="row">
                                                    <div className="d-flex flex-column">
                                                        <label htmlFor="reservationnumber" className="form-label text-muted mb-1 text-sm">Reservation Number</label>
                                                        <input id="reservationnumber"
                                                            ref={reservationNumber} className="mb-0 rounded form-control form-control-sm border-primary bg-input-user text-dark text-sm rounded form-control form-control-sm masterdata fw-bold" />
                                                    </div>
                                                </div>
                                                <br />
                                            </div>
                                            <div className="card-footer p-2 d-flex flex-row gap-2 justify-content-end">
                                                <button type="button" className="btn btn-sm btn-light-secondary" onClick={(e) => clearAll()}>Clear</button>
                                                <button type="button" id="saveBtn" className="btn btn-sm  btn-success" onClick={(e) => getReservationDetails()} >Fetch Details</button>

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


export default StockIssue;

export async function getStaticProps() {
    return {
        props: { module: "STOCKISSUE", onlyAdminAccess: false }
    };
}