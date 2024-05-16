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
import { RequestgetPlanOrder, RequestgetStorageLocationForMaterials, RequestgetStorageLocationMaterials, RequestmaterialAvailabilityCheck, RequestmaterialDetails, RequestplanOrderToProductionOrder, RequestproductionOrderConfirmation, RequestproductionRelease } from '../firebase/masterAPIS'
import { arrayUnion, doc, increment, runTransaction } from 'firebase/firestore'
import { db } from '../firebase/firebaseconfig'

import Moment from 'moment';
import { extendMoment } from 'moment-range';
const moment = extendMoment(Moment);
const ProductionConfirmation = () => {

    const [materialchoices, setmaterialchoices] = useState(null);
    const [storagelocationchoices, setstoragelocationchoices] = useState(null);
    const [planOrder, setplanOrder] = useState(null);
    const [productionOrder, setproductionOrder] = useState(null);
    const [productionOrderRelease, setproductionOrderRelease] = useState(null);
    const [productionOrderConfirmation, setproductionOrderConfirmation] = useState(null);
    const [materialDetails, setmaterialDetails] = useState(null);
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
    async function getSFGMaterials() {
        var sfgMaterials = utility.get_keyvalue(constants.SFG_MATERIALS)
        if (sfgMaterials === "nothingfound") {
            utility.showloading()
            utility.updateloadingstatus("Fetching SFG Materials")
            var details = await RequestgetStorageLocationMaterials({
                plant: "1000",
                storagelocation: utility.get_keyvalue(constants.EMPLOYEE_STORAGELOCATION),
                materialtype: 'SFG',
            });
            console.log(details);
            if (details.status) {
                utility.store_newvalue(constants.SFG_MATERIALS, details.data)
            } else {
                var message = 'Failed To Fetch SFG Materials, ' + details.message;
                showsnackbar('error', message);
                utility.store_newvalue(constants.SFG_MATERIALS, [])
            }
            utility.hideloading()
            sfgMaterials = utility.get_keyvalue(constants.SFG_MATERIALS)
        }

        console.log(sfgMaterials);
        var materials = [
            { value: "", label: "Select Materials", placeholder: true, disabled: true, selected: true },

        ]
        sfgMaterials.map(material => {
            materials.push({ value: material["MATNR"], label: material["MATNR"] + " | " + material["MAKTX"] })
        })

        setmaterialchoices(new Choices($("#materialcodeselect")[0], {
            addItems: true,
            placeholder: true,
            removeItemButton: false,
            position: "bottom",
            resetScrollPosition: false,
            classNames: {
                containerInner: "choices__inner bg-input-user text-dark fw-bold text-sm border-primary",
                item: "choices__item pe-2 text-sm",
            },
            choices: materials,
        }))

        var storagelocation = [
            // { value: "", label: "Select Storage Location", placeholder: true, disabled: true, selected: true },

        ]
        Object.keys(fbc.STORAGELOCATION).map(key => {
            storagelocation.push({
                value: key,
                selected: key === utility.get_keyvalue(constants.EMPLOYEE_STORAGELOCATION),
                label: key + " | " + fbc.STORAGELOCATION[key]
            })
        })

        let choiceElem = new Choices($("#storagelocationselect")[0], {
            // addItems: true,
            placeholder: true,
            removeItemButton: false,
            position: "bottom",
            resetScrollPosition: false,
            classNames: {
                containerInner: "choices__inner bg-input-user text-dark fw-bold text-sm border-primary",
                item: "choices__item pe-2 text-sm",
            },
            choices: storagelocation,
        })
        choiceElem.disable()
        setstoragelocationchoices(choiceElem)
        utility.hideloading();
    }

    const errorCallback = (err) => {
        utility.hideloading();
        showsnackbar("error", err.message)
    }


    useEffect(() => {
        if (materialDetails === null) {

            getSFGMaterials()


        }

    }, [materialDetails]);
    const checkifDataisCorrect = () => {
        $('.text-sm rounded form-control form-control-sm').removeClass(
            'is-invalid'
        );

        if (materialchoices.getValue(true).length == 0) {
            var message = ("Please Select Material")
            showsnackbar('error', message)
            materialchoices.showDropdown()
            return false;
        } else if (utility.getinputValueInNumbers('materialquantity') <= 0) {
            $('#materialquantity').addClass('is-invalid');
            var message = 'Please Add Material Quantity.';
            utility.showtippy('materialquantity', message, 'danger');
            showsnackbar('error', message);
            return false;
        } else if (storagelocationchoices.getValue(true).length == 0) {
            var message = ("Please Select Storage Location")
            showsnackbar('error', message)
            storagelocationchoices.showDropdown()
            return false;
        } else {
            return true;
        }
    };
    async function getmaterialAvailabilityCheck() {
        if (checkifDataisCorrect()) {
            var data = {
                plant: "1000",
                materialdescription: "MATERIAL DESCRIPTION",
                storagelocation: storagelocationchoices.getValue(true),
                materialcode: materialchoices.getValue(true),
                quantity: utility.getinputValueInNumbers('materialquantity'),
            }
            setmaterialDetails(data)
            var element = getElement("MATERIALAVAILABILITYCHECK", 1, "Material Availability Check", "Checking...")
            $("#statusdiv").empty().append(element)
            utility.showitem("MATERIALAVAILABILITYCHECK_loading")
            var planOrderDetails = await RequestmaterialAvailabilityCheck(data);

            utility.hideitem("MATERIALAVAILABILITYCHECK_loading")
            console.log(planOrderDetails);
            if (planOrderDetails.status) {
                utility.showitem("MATERIALAVAILABILITYCHECK_done")
                $("#MATERIALAVAILABILITYCHECK_status").text("Available")
                getPlanOrderDetails(data)

            } else {
                utility.showitem("MATERIALAVAILABILITYCHECK_error")
                let errortable = getErrorTable(planOrderDetails?.data?.["ITEM"] || [])
                console.log(errortable);
                $("#MATERIALAVAILABILITYCHECK_errordiv").empty().append(errortable)
                var message = 'Failed To Continue, ' + planOrderDetails.message;
                showsnackbar('error', message);
                $("#MATERIALAVAILABILITYCHECK_status").text(planOrderDetails.message)
                $("#MATERIALAVAILABILITYCHECK_status").removeClass("text-dark")
                $("#MATERIALAVAILABILITYCHECK_status").addClass("text-danger")
                addClearBtn()
            }
        }
    }

    async function getPlanOrderDetails(data) {
        if (data == null) {
            var message = ("Material Details Unavailable")
            showsnackbar('error', message)
            return;
        }

        var element = getElement("GETPLANORDER", 2, "Plan Order Number", "Creating Plan Order...")
        $("#statusdiv").append(element)
        utility.showitem("GETPLANORDER_loading")
        var planOrderDetails = await RequestgetPlanOrder(JSON.parse(JSON.stringify(data)));

        utility.hideitem("GETPLANORDER_loading")
        console.log(planOrderDetails);
        if (planOrderDetails.status) {
            utility.showitem("GETPLANORDER_done")
            $("#GETPLANORDER_status").text(planOrderDetails.data["PLANNEDORDER_NUM"])
            setplanOrder(planOrderDetails.data);

        } else {
            utility.showitem("GETPLANORDER_error")
            var message = 'Failed To Continue, ' + planOrderDetails.message;
            showsnackbar('error', message);
            $("#GETPLANORDER_status").text(planOrderDetails.message)
            addClearBtn()
        }

    }

    useEffect(() => {
        if (planOrder !== null) { getPlanOrderToProductionOrder() }
    }, [planOrder])


    async function getPlanOrderToProductionOrder() {
        if (materialDetails == null) {
            var message = ("Material Details Unavailable")
            showsnackbar('error', message)
            return;
        } else if (planOrder == null) {
            var message = ("Plan Order Number Unavailable")
            showsnackbar('error', message)
            return;
        } else {
            var data = {
                ...materialDetails,
                planordernumber: planOrder["PLANNEDORDER_NUM"]
            }
            var element = getElement("PLOTOPRDO", 3, "Plan Order To Production Order", "Fetching Production Order...")
            $("#statusdiv").append(element)
            utility.showitem("PLOTOPRDO_loading")
            var prodOrderDetails = await RequestplanOrderToProductionOrder(data);

            utility.hideitem("PLOTOPRDO_loading")
            console.log(prodOrderDetails);
            if (prodOrderDetails.status) {
                utility.showitem("PLOTOPRDO_done")
                $("#PLOTOPRDO_status").text(prodOrderDetails.data["AUFNR"])
                setproductionOrder(prodOrderDetails.data);
            } else {
                utility.showitem("PLOTOPRDO_error")
                var message = 'Failed To Continue, ' + prodOrderDetails.message;
                showsnackbar('error', message);
                $("#PLOTOPRDO_status").text(prodOrderDetails.message)
                addClearBtn()
            }
        }
    }

    useEffect(() => {
        if (productionOrder !== null) { getProductionOrderRelease() }
    }, [productionOrder])
    async function getProductionOrderRelease() {
        if (materialDetails == null) {
            var message = ("Material Details Unavailable")
            showsnackbar('error', message)
            return;
        }
        else if (planOrder == null) {
            var message = ("Plan Order Number Unavailable")
            showsnackbar('error', message)
            return;
        }
        else if (productionOrder == null) {
            var message = ("Production Order Number Unavailable")
            showsnackbar('error', message)
            return;
        }
        else {
            var data = {
                ...materialDetails,
                productionordernumber: productionOrder["AUFNR"]
            }
            var element = getElement("PRODORDERRELEASE", 4, "Production Order Release", "Fetching Production Order...")
            $("#statusdiv").append(element)
            utility.showitem("PRODORDERRELEASE_loading")
            var productionRelease = await RequestproductionRelease(data);

            utility.hideitem("PRODORDERRELEASE_loading")
            console.log(productionRelease);
            if (productionRelease.status) {
                utility.showitem("PRODORDERRELEASE_done")
                $("#PRODORDERRELEASE_status").text(productionRelease.data["RELE"] ? "RELEASED" : "NOT RELEASED")
                setproductionOrderRelease(productionRelease.data);
            } else {
                utility.showitem("PRODORDERRELEASE_error")
                var message = 'Failed To Continue, ' + productionRelease.message;
                showsnackbar('error', message);
                $("#PRODORDERRELEASE_status").text(productionRelease.message)
                addClearBtn()
            }
        }
    }
    useEffect(() => {
        if (productionOrderRelease !== null) { getProductionOrderConfirmation() }
    }, [productionOrderRelease])
    async function getProductionOrderConfirmation() {
        if (materialDetails == null) {
            var message = ("Material Details Unavailable")
            showsnackbar('error', message)
            return;
        }
        else if (planOrder == null) {
            var message = ("Plan Order Number Unavailable")
            showsnackbar('error', message)
            return;
        }
        else if (productionOrder == null) {
            var message = ("Production Order Number Unavailable")
            showsnackbar('error', message)
            return;
        }
        else if (productionOrderRelease == null) {
            var message = ("Production Order Not Released")
            showsnackbar('error', message)
            return;
        }
        else {
            var data = {
                ...materialDetails,
                productionordernumber: productionOrder["AUFNR"]
            }
            var element = getElement("PRODORDERCONFIRMATION", 5, "Production Order Confirmation", "Fetching Production Order Confirmation...")
            $("#statusdiv").append(element)
            utility.showitem("PRODORDERCONFIRMATION_loading")
            var productionRelease = await RequestproductionOrderConfirmation(data);

            utility.hideitem("PRODORDERCONFIRMATION_loading")
            console.log(productionRelease);
            if (productionRelease.status) {
                saveProductionConfirmation(productionRelease.data)

            } else {
                utility.showitem("PRODORDERCONFIRMATION_error")
                var message = 'Failed To Continue, ' + productionRelease.message;
                showsnackbar('error', message);
                $("#PRODORDERCONFIRMATION_status").removeClass("text-dark")
                $("#PRODORDERCONFIRMATION_status").addClass("text-danger")
                $("#PRODORDERCONFIRMATION_status").text(productionRelease.message)
                addClearBtn()
            }
        }
    }

    function getErrorTable(errorData) {
        let errortable = ``

        errorData.map(material => {
            errortable += `
             <div class="d-flex flex-row">
                                <span class="text-dark w-50 text-wrap text-sm fw-bold m-auto"> ${material["MATNR"]}</br>${material["MAKTX"]} </span>
                                <span class="text-dark w-25 text-sm fw-bold m-auto">  ${material["RLABST"]} </span>
                                <span class="text-dark w-25 text-sm fw-bold m-auto">  ${material["ALABST"]} </span>
                             </div>
            `
        })

        return `<div class="d-flex flex-column mt-3 w-100 border rounded p-2">
                            <div class="d-flex flex-row">
                                <span class="text-muted w-50 text-sm m-auto"> Material </span>
                                <span class="text-muted w-25 text-sm m-auto"> Required </span>
                                <span class="text-muted w-25 text-sm m-auto"> Available </span>
                             </div>
                             ${errortable}
                        </div>`
    }

    function getElement(id, sequenceNumber, title, subtitle) {


        return ` <div id="${id}_div" class="card shadow-md mb-0 d-flex flex-row w-100 bg-light align-items-center py-3 px-2 rounded border border-primary">
                                                <div style={{
                                                    height: "35px",
                                                    width: "35px",
                                                }} class="rounded-circle d-flex bg-light-primary p-2">
                                                    <span class="text-primary fw-bolder text-md m-auto">
                                                        ${utility.padwithzero(sequenceNumber)}
                                                    </span>
                                                </div>
                                                <div class="d-flex flex-grow-1 flex-row justify-content-between align-items-center">
                                                    <div class="d-flex flex-column border-start border-primary w-100 ms-2 ps-2 ">
                                                        <span class="fw-bolder text-gray-500 text-sm mb-0">
                                                            ${title}
                                                        </span>
                                                        <span id="${id}_status" class="fw-bolder text-dark text-sm mb-0">
                                                            ${subtitle}
                                                        </span>
                                                            <div id="${id}_errordiv" class="d-flex w-100"></div>
                                                    </div>

                                                    <div class='d-flex flex-row align-items-center gap-2 p-2'>
                                                        <span id="${id}_done" class="d-none text-success m-0 p-0 fs-1 ri-checkbox-circle-fill"></span>
                                                        <span id="${id}_error" class="d-none text-danger m-0 p-0 fs-1 ri-alert-fill"></span>
                                                        
                                                        <div id="${id}_loading" class="d-none spinner-border border-4 text-warning" role="status">
                                                            <span class="visually-hidden">Loading...</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
`
    }
    function addClearBtn() {
        $("#statusdiv").append(` <button id="clearbtn" class="btn-sm btn btn-block w-100 rounded btn-outline-danger">CLEAR AND EXIT</button>`)
        $("#clearbtn").on("click", function () {
            clearAll()
        });
    }
    function addDoneandExitBtn() {
        $("#statusdiv").append(` <button id="exitbtn" class="btn-sm btn btn-block w-100 rounded btn-outline-success">DETAILS ADDED AND EXIT NOW</button>`)
        $("#exitbtn").on("click", function () {
            clearAll()
        });
    }
    function clearAll() {
        $("#materialcode").val("")
        setmaterialDetails(null)
        setplanOrder(null)
        setproductionOrder(null)
        setproductionOrderRelease(null)
        setproductionOrderConfirmation(null)
        $("#statusdiv").empty()
    }
    useEffect(() => {
        if (productionOrderConfirmation !== null) { }
    }, [productionOrderConfirmation])
    async function saveProductionConfirmation(productionOrderConfirmation) {

        utility.showloading();

        let availablestoragelocations = await getMaterialStorageLocation(productionOrderConfirmation["WERKS"],
            productionOrderConfirmation["LGORT"], productionOrderConfirmation["MATNR"])

        console.log(availablestoragelocations);

        let hasSameStorageLocation = false;
        availablestoragelocations.map(location => {
            if (availablestoragelocations.length == 1 && location["LGORT_TAR"] == productionOrderConfirmation["LGORT"]) {
                hasSameStorageLocation = true;
            }
        })
        console.log(hasSameStorageLocation);
        try {
            const res = await runTransaction(db, async (transaction) => {


                const ref = doc(db, 'ConfirmationMaterialDetails', productionOrderConfirmation["MBLNR"].toString());

                // if (productionOrderConfirmation["LGORT"].toString() !== utility.get_keyvalue(constants.EMPLOYEE_STORAGELOCATION)) {

                // } else {
                //     return { status: true, message: "#" + productionOrderConfirmation["MBLNR"] + ' Confirmation Number Created.' };

                // }
                await transaction.set(
                    ref,
                    {

                        ...productionOrderConfirmation,
                        PLANT: productionOrderConfirmation["WERKS"],
                        MATERIAL: productionOrderConfirmation["MATNR"],
                        STORE_LOC: productionOrderConfirmation["LGORT"],
                        STATUS: hasSameStorageLocation ? "TRANSFERED" : "PENDING",
                        TIMESTAMP: utility.getTimestamp(),
                        DATE: utility.getDate(),
                        LOGS: arrayUnion({
                            log: productionOrderConfirmation["MBLNR"] + " Created",
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

                return { status: true, message: "#" + productionOrderConfirmation["MBLNR"] + ' Confirmation Number Created.' };

            });

            utility.hideloading();
            if (res.status) {
                utility.showitem("PRODORDERCONFIRMATION_done")
                $("#PRODORDERCONFIRMATION_status").text("#" + productionOrderConfirmation["MBLNR"] + " Created.")
                setproductionOrderConfirmation(productionOrderConfirmation);
                addDoneandExitBtn()
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

    async function getMaterialStorageLocation(plant, storagelocation, materialcode) {
        utility.showloading()
        var details = await RequestgetStorageLocationForMaterials({
            materials: [
                {
                    WERKS: plant,
                    LGORT: storagelocation,
                    MATNR: materialcode,
                }
            ]
        });
        utility.hideloading();
        console.log(details);
        if (details.status) {
            return details.data?.[0].availablestoragelocations || []
        } else {
            var message = 'Failed To Continue, ' + details.message;
            showsnackbar('error', message);
            return []
        }
    }

    return (



        < main className='d-flex flex-column min-vh-100' >
            <Head title={"Production Confirmation"} />

            <div id="main" className="layout-navbar">
                <header>
                    <Navbar pagename={"Production Confirmation"} />
                </header>
                <div id="main-content">
                    <div className="page-content">
                        <section className="pc-container m-0 d-flex flex-column p-1">
                            <div className="pcoded-content pb-5 d-flex flex-column flex-grow-1 p-1" style={{
                                overflow: "scroll"
                            }}>



                                {
                                    materialDetails !== null ? <>
                                        <div className="card shadow-md border p-1 mb-0 col-12 col-lg-4 mx-auto">
                                            <div className="card-body d-flex flex-wrap py-2 px-2">
                                                <div className="d-flex flex-column col-8 mb-2 ">
                                                    <span className="fw-bolder text-gray-500 text-sm mb-1">
                                                        {materialDetails.materialdescription}
                                                    </span>
                                                    <span className="fw-bolder text-dark text-md mb-0">
                                                        {materialDetails.materialcode}
                                                    </span>
                                                </div>

                                                <div className="d-flex flex-column col-4 mb-2 ">
                                                    <span className="fw-bolder text-gray-500 text-sm mb-1">
                                                        Quantity
                                                    </span>
                                                    <span className="fw-bolder text-dark text-md mb-0">
                                                        {materialDetails.quantity}
                                                    </span>
                                                </div>
                                                <div className="d-flex flex-column col-6 mb-2 ">
                                                    <span className="fw-bolder text-gray-500 text-sm mb-1">
                                                        Storage Location
                                                    </span>
                                                    <span className="fw-bolder text-dark text-md mb-0">
                                                        {materialDetails.storagelocation} | {fbc.STORAGELOCATION[materialDetails.storagelocation]}
                                                    </span>
                                                </div>
                                            </div>

                                        </div>


                                    </> : <>

                                        <div className="card h-100 border p-1 mb-0 col-12 col-lg-4 mx-auto">
                                            <div className="card-header py-3 px-2">

                                                <div className="d-flex flex-row justify-content-between align-center">
                                                    <h5 className="my-auto fs-6 text-dark">Get Plan Order Details</h5>




                                                </div>


                                            </div>
                                            <div className="card-body px-2 py-3">

                                                <div className="row gap-4">
                                                    <div className="d-flex flex-column">
                                                        <label htmlFor="materialcode" className="form-label text-muted mb-1 text-sm">Material Code</label>

                                                        <select id="materialcodeselect" className="text-sm rounded form-control form-control-sm" >

                                                        </select>


                                                    </div>
                                                    <div className="d-flex flex-column">
                                                        <label htmlFor="materialquantity" className="form-label text-muted mb-1 text-sm">Material Quantity</label>
                                                        <input id="materialquantity"
                                                            className="mb-0 rounded form-control form-control-sm border-primary bg-input-user text-dark text-sm rounded form-control form-control-sm masterdata fw-bold" />
                                                    </div>
                                                    <div className="d-flex flex-column">
                                                        <label htmlFor="storagelocationselect" className="form-label text-muted mb-1 text-sm">Storage Location</label>
                                                        <select id="storagelocationselect" className="text-sm rounded form-control form-control-sm" >

                                                        </select>
                                                    </div>
                                                </div>
                                                <br />
                                            </div>
                                            <div className="card-footer p-2 d-flex flex-row gap-2 justify-content-end">
                                                <button type="button" className="btn btn-sm btn-light-secondary" onClick={(e) => clearAll()}>Clear</button>
                                                <button type="button" id="saveBtn" className="btn btn-sm  btn-success" onClick={(e) => getmaterialAvailabilityCheck()} >Fetch Details</button>

                                            </div>
                                        </div>

                                    </>
                                }
                                <div id="statusdiv" className="d-flex flex-column flex-grow-1 col-12 col-lg-4 mx-auto p-0 gap-2 py-2" style={{
                                    overflow: "auto",
                                    maxHeight: "100%"
                                }}>


                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div >



        </main >


    );
}


export default ProductionConfirmation;

export async function getStaticProps() {
    return {
        props: { module: "PRODUCTIONCONFIRMATION", onlyAdminAccess: false }
    };
}