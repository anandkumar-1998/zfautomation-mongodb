import { useState, useEffect, useRef } from 'react'
import * as utility from '../libraries/utility'
import * as constants from '../constants/appconstants'
import * as fbc from '../firebase/firebaseConstants'
import Sidebar from '../components/sidebar'
import Navbar from '../components/navbar'
import Head from '../components/head'
import $, { data } from 'jquery'
import { DataTable } from "datatables.net-bs5"
import "datatables.net-colreorderwithresize-npm";
import "datatables.net-buttons-dt";
import "datatables.net-buttons/js/buttons.html5.js";
import "datatables.net-fixedheader-bs5/js/fixedHeader.bootstrap5.js"
import "datatables.net-select-bs5/js/select.bootstrap5"
import { useSnackbar } from 'notistack'
import { RequestgetProductionOrder, RequestgetStorageLocationMaterials, RequestproductionOrderConfirmFG } from '../firebase/masterAPIS'
import { arrayUnion, collection, deleteDoc, doc, getDocs, increment, orderBy, query, runTransaction, setDoc, where } from 'firebase/firestore'
import { db } from '../firebase/firebaseconfig'
import QrScanner from 'qr-scanner';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { largeLabel } from '../firebase/printerlabelConstant'
const moment = extendMoment(Moment);

const ZebraBrowserPrintWrapper = require('zebra-browser-print-wrapper');
let selectedMaterials = []
let allSerialNumbers = []
var selected_device;
var browserPrint;
var devices = [];
let printerStatus;
const ScanningAndPrinting = () => {
    const [allModelDocs, setModelDocs] = useState({})
    const [allCustomerDocs, setCustomerDocs] = useState({})

    const [qrData, setqrData] = useState("")
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const qrinputstring = useRef(null);
    const showsnackbar = (variant, message) => {
        enqueueSnackbar(message, {
            variant: variant,
            anchorOrigin: { horizontal: 'center', vertical: 'top' },
        });
    }
    async function setup() {

        try {

            // Create a new instance of the object
            browserPrint = new ZebraBrowserPrintWrapper.default();

            // Select default printer
            selected_device = await browserPrint.getDefaultPrinter();

            // Set the printer
            browserPrint.setPrinter(selected_device);
            // Check printer status
            printerStatus = await browserPrint.checkPrinterStatus();

            // Check if the printer is ready
            if (printerStatus.isReadyToPrint) {

                getAllCustomers()

            } else {
                console.log("Error/s", printerStatus.errors);
                utility.hideloading();
                showsnackbar("error", "Printer Unavailable, " + printerStatus.errors)

            }


        } catch (error) {
            throw new Error(error);
        }

    }
    function writeToSelectedPrinter(data) {
        let dataToWrite = largeLabel(data)
        browserPrint.print(dataToWrite);
        setqrData("")
    }



    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSearchInput()

        }
    }
    function handleSearchInput() {
        if (!printerStatus.isReadyToPrint) {
            showsnackbar("error", "Printer Unavailable")
        }
        setqrData(() => {
            var value = qrinputstring.current.value
            qrinputstring.current.value = ""
            console.log(value);
            return value;
        });
    }

    const errorCallback = (err) => {
        utility.hideloading();
        showsnackbar("error", err.message)
    }

    async function getAllModels() {
        utility.showloading()
        const q = query(
            collection(db, "ModelDetails"),
            orderBy("modelnumber", "desc")
        );
        var data = {}
        const querySnapshot = await getDocs(q);
        utility.hideloading();
        console.log(querySnapshot.size);
        querySnapshot.forEach((doc) => {
            data[doc.data().modelnumber] = doc.data()
        });
        setModelDocs(data)
        utility.hideloading()


    }

    async function getAllCustomers() {
        utility.showloading()
        const q = query(
            collection(db, "CustomersDetails"),
            orderBy("customername", "asc")
        );
        var data = {}
        const querySnapshot = await getDocs(q);
        utility.hideloading();
        console.log(querySnapshot.size);
        querySnapshot.forEach((doc) => {
            data[doc.id] = doc.data()
        });
        setCustomerDocs(data)
        utility.hideloading()
        getAllModels()
    }

    useEffect(() => {

        $('#qrstring').focus();

        $('#qrstring').focusout(function () {
            $('#qrstring').focus();
        });


        window.addEventListener("focus", function (event) {
            $('#qrstring').focus();
        }, false);

        setup()

    }, []);


    useEffect(() => {

        $("#finalqrstring").text("")
        if (qrData.length > 0) {
            validateData()
        }

    }, [qrData])



    function validateData() {

        let materialcode = qrData.split("$")[qrData.split("$").length - 1]
        if (allModelDocs[materialcode] == undefined) {
            $('#qrstring').addClass('is-invalid');
            var message = 'No Model Found For Material ' + materialcode;
            utility.showtippy('qrstring', message, 'danger');
            showsnackbar('error', message);
            return;
        }
        let model = allModelDocs[materialcode]
        let customer = allCustomerDocs[model.customer.uid]
        let vendorcode = qrData.split("$")[0]
        let customerpartnumber = qrData.split("$")[1]
        let serialnumber = qrData.split("$")[2]
        let mfgdate = qrData.split("$")[3]
        let partdescription = qrData.split("$")[8]
        let printObject = {
            vendorcode,
            qty: 1,
            customername: customer.customername,
            shippinglocation: customer.shippinglocation,
            grossweight: model.grossweight,
            materialcode,
            customerpartnumber,
            serialnumber,
            mfgdate,
            partdescription,
            qrstring: vendorcode +
                customer.stringseprator + serialnumber +
                customer.stringseprator + mfgdate
        }
        writeToSelectedPrinter(printObject)
    }
    function validateDataOld() {
        let materialcode = qrData.split("#")[0]
        let serialnumber = qrData.split("#")[1]
        if (allModelDocs[materialcode] == undefined) {
            $('#qrstring').addClass('is-invalid');
            var message = 'No Model Found For Material ' + materialcode;
            utility.showtippy('qrstring', message, 'danger');
            showsnackbar('error', message);
            return;
        }

        let model = allModelDocs[materialcode]
        let customer = allCustomerDocs[model.customer.uid]
        let customerbarcodetemplate = customer.customerbarcodetemplate
        let stringseprator = customer.stringseprator
        let qrstring = ""
        let printObject = {}

        customerbarcodetemplate.split("$").map(key => {
            if (model[key] != undefined) {
                qrstring += (model[key] + stringseprator)
                printObject[key] = model[key]
            } else if (customer[key] != undefined) {
                qrstring += (customer[key] + stringseprator)
                printObject[key] = customer[key]
            }
            else if (key == "mfgdate") {
                qrstring += (moment().format(customer.dateformat) + stringseprator)
                printObject["mfgdate"] = moment().format(customer.dateformat)
            }
            else if (key == "serialnumber") {
                qrstring += (serialnumber + stringseprator)
                printObject["serialnumber"] = serialnumber
            }
            else {
                qrstring += (key + stringseprator)
            }
        })
        printObject["customername"] = customer.customername
        printObject["shippinglocation"] = customer.shippinglocation
        printObject["materialcode"] = materialcode
        printObject["qrstring"] = qrstring
        printObject["qty"] = 1
        printObject["grossweight"] = model.grossweight
        $("#finalqrstring").text(qrstring)
        console.log(customerbarcodetemplate.split("#"), qrstring, model, customer, printObject);
        writeToSelectedPrinter(printObject)
    }


    return (



        < main className='d-flex flex-column min-vh-100' >
            <Head title={"Packing Label Print"} />

            <div id="main" className="layout-navbar">
                <header>
                    <Navbar pagename={"Packing Label Print"} />
                </header>
                <div id="main-content">
                    <div className="page-content">
                        <section className="pc-container m-0 d-flex flex-column p-1">
                            <div className="pcoded-content pb-5 d-flex flex-column flex-grow-1 p-1">

                                <div className='flex-row d-flex h-100 gap-2 p-2'>
                                    <div className="tab-content w-100 d-flex flex-row gap-2" id="main-items-pills-tabContent">
                                        <div className="tab-pane show active col-lg-3 col-12 mx-auto"
                                            id="pills-entry"
                                            role="tabpanel"
                                            aria-labelledby="pills-entry-tab"
                                        >
                                            <div className="card h-100 border p-1 mb-0">
                                                <div className="card-header py-3 px-2">

                                                    <div className="d-flex flex-row justify-content-between align-center">
                                                        <h5 className="my-auto fs-6 text-dark">Packing Label Print</h5>




                                                    </div>


                                                </div>
                                                <div className="card-body p-2" style={{
                                                    overflowY: "auto",
                                                    overflowX: "hidden"
                                                }}>
                                                    <div className="row d-flex flex-column gap-2">
                                                        <div className="d-flex flex-column bg-light-success rounded p-3">

                                                            <div className="d-flex flex-column">
                                                                <input id="qrstring" placeholder="QR String"
                                                                    onKeyDown={(e) => handleKeyDown(e)} ref={qrinputstring}
                                                                    className="mb-0 rounded form-control form-control-sm border-success bg-input-user text-dark text-sm rounded form-control form-control-sm masterdata fw-bold" />
                                                            </div>


                                                            <video className='d-none w-100' style={{ height: "150px" }} id="scannerview"></video>
                                                        </div>

                                                        <span id="finalqrstring" className="text-md text-primary"></span>

                                                    </div>
                                                    <br />
                                                </div>
                                                <div className="card-footer p-2 d-flex flex-row gap-2 justify-content-end">
                                                    <button type="button" className="btn btn-sm btn-light-secondary" onClick={(e) => clearAll()}>Clear</button>
                                                    <button type="button" id="getprodorderbtn" className="btn btn-sm  btn-outline-success" onClick={(e) => handleSearchInput()} >PRINT</button>

                                                </div>
                                            </div>
                                        </div>

                                    </div>




                                </div>

                            </div>
                        </section>
                    </div>
                </div>
            </div >



        </main >


    );
}


export default ScanningAndPrinting;

export async function getStaticProps() {
    return {
        props: { module: "PACKINGLABELPRINT", onlyAdminAccess: false }
    };
}