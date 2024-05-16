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
import { RequestconfirmStockReceive, RequestgetStockForStorageLocation, RequestgetStorageLocationForMaterials, RequestmaterialDetails } from '../firebase/masterAPIS'
import { arrayUnion, collection, doc, getDocs, increment, orderBy, query, runTransaction, where } from 'firebase/firestore'
import { db } from '../firebase/firebaseconfig'
import Moment from 'moment';
import { extendMoment } from 'moment-range';
const moment = extendMoment(Moment);
let selectedMaterialsForTransfer = [];
const StockTransfer = () => {

    const referenceNumber = useRef(null);
    const [storagelocationchoices, setstoragelocationchoices] = useState(null);

    const [dynamicstoragelocationchoices, setdynamicstoragelocationchoices] = useState(null);
    const [materialDetails, setmaterialDetails] = useState(null);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [reportData, setreportData] = useState(null);

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

            utility.hideloading();




            // getMaterialsForReferenceNumber()
        } else {
            selectedMaterialsForTransfer = [];
            var storagelocation = [
                { value: "", label: "Select Storage Location", placeholder: true, disabled: true, selected: true },

            ]
            Object.keys(fbc.STORAGELOCATION).map(key => {
                storagelocation.push({ value: key, label: key + " | " + fbc.STORAGELOCATION[key] })
            })

            $('#searchbox').keyup(function () {
                $('.materialitem').removeClass('active border-primary border-1');

                var n = $('#searchbox').val();
                $('.materialitem').each(function () {
                    var $this = $(this);
                    var value = $this.attr('data-find').toString()

                    if (value.includes(n.toUpperCase())) {
                        console.log('INVLUDE');
                        utility.showitem(utility.sanitizeID(this.id));
                    } else {
                        utility.hideitem(utility.sanitizeID(this.id));
                    }
                });
            });

            setstoragelocationchoices(new Choices($("#storagelocationselect")[0], {
                addItems: true,
                placeholder: true,
                itemSelectText: '',
                removeItemButton: false,
                resetScrollPosition: false,
                classNames: {
                    containerInner: "choices__inner bg-input-user text-dark fw-bold text-sm border-primary",
                    item: "choices__item pe-2 text-sm",
                },
                choices: storagelocation,
            }))

            $('.aufnrcheckbox').click(function (event) {
                if (this.checked) {
                    selectedMaterialsForTransfer.push(this.id);
                } else {
                    selectedMaterialsForTransfer = utility.removeItemAllFromArray(selectedMaterialsForTransfer, this.id)
                }
                console.log(selectedMaterialsForTransfer);
            });

            for (let material of materialDetails) {
                var materialstoragelocation = [
                    // { value: "", label: "Select Storage Location", placeholder: true, disabled: true, selected: true },

                ]
                var availablestoragelocations = []
                material["availablestoragelocations"].map(loc => {
                    availablestoragelocations.push(loc)
                    materialstoragelocation.push({
                        value: loc,
                        label: loc,
                        selected: material["availablestoragelocations"].length === 1
                    })
                })
                // Object.keys(fbc.STORAGELOCATION).map(key => {
                //     console.log(key, availablestoragelocations.includes(key));
                //     if (availablestoragelocations.includes(key)) {
                //         materialstoragelocation.push({
                //             value: key,
                //             label: key + " | " + fbc.STORAGELOCATION[key],
                //             selected: availablestoragelocations.length === 1
                //         })
                //     }
                // })

                setdynamicstoragelocationchoices((matchoices => {
                    let newMatchoices = { ...matchoices }
                    let matchoice = new Choices($("#" + utility.sanitizeID(material["MATNR"]) + "select")[0], {
                        addItems: true,
                        placeholder: true,
                        itemSelectText: '',
                        removeItemButton: false,
                        resetScrollPosition: false,
                        classNames: {
                            containerInner: "choices__inner bg-input-user text-dark fw-bold text-sm border-primary",
                            item: "choices__item pe-2 text-sm",
                        },
                        choices: materialstoragelocation,
                    })
                    if (material["availablestoragelocations"].length === 1 && matchoice != undefined) {
                        // matchoice.setChoiceByValue(material["availablestoragelocations"][])
                        matchoice.disable()
                    }

                    newMatchoices[utility.sanitizeID(material["MATNR"])] = matchoice
                    return newMatchoices
                }))
            }
        }

    }, [materialDetails]);
    async function getStockReport() {

        utility.showloading();
        var data = {
            plant: "1000",
            plants: ["1000"],
            storagelocations: [utility.get_keyvalue(constants.EMPLOYEE_STORAGELOCATION)],
            materialcodes: [],
        }
        var details = await RequestgetStockForStorageLocation(data);

        setreportData(null)
        console.log(details);

        if (details.status) {
            setreportData(details.data)
        } else {
            utility.hideloading();
            var message = 'Failed To Continue, ' + details.message;
            showsnackbar('error', message);
        }
    }
    async function getMaterialsForReferenceNumber() {
        var materials = []
        const q = query(
            collection(db, "ConfirmationMaterialDetails"),
            where("LGORT", "==", utility.get_keyvalue(constants.EMPLOYEE_STORAGELOCATION)),
            where("STATUS", "==", "PENDING"),
            orderBy("MBLNR"),
        );
        const querySnapshot = await getDocs(q);
        utility.hideloading();

        if (querySnapshot.size === 0) {
            var message = 'No Pending Materials';
            showsnackbar('error', message);
            return;
        } else {
            querySnapshot.forEach((doc) => {
                materials.push(doc.data());
            });

            materials.sort(function (x, y) {
                let a = Number(x["TIMESTAMP"]),
                    b = Number(y["TIMESTAMP"]);
                return a == b ? 0 : a > b ? -1 : 1;
            });

            getMaterialStorageLocation(materials);
        }
    }

    useEffect(() => {
        if (reportData !== null) {
            console.log(reportData);

            getMaterialStorageLocation(reportData);
        } else {
            getStockReport()
        }
    }, [reportData]);
    async function getMaterialStorageLocation(materials) {
        utility.showloading()
        var details = await RequestgetStorageLocationForMaterials({ materials });
        utility.hideloading();
        console.log(details);
        if (details.status) {
            setmaterialDetails(details.data);
        } else {
            var message = 'Failed To Continue, ' + details.message;
            showsnackbar('error', message);
        }
    }

    function clearAll() {
        $("#referencenumber").val("")
        setmaterialDetails(null)
        setrefNumber("")
    }
    function isDivisible(number, divisor) {
        return number % divisor === 0;
    }
    function stocktransfer() {
        // console.log(storagelocationchoices.getValue(true));
        // if (storagelocationchoices.getValue(true).length == 0) {
        //     var message = ("Please Select Storage Location")
        //     showsnackbar('error', message)
        //     storagelocationchoices.showDropdown()
        //     return;
        // }

        for (let material of materialDetails) {
            console.log(utility.getinputValueInNumbers(utility.sanitizeID(material["MATNR"]) + "_qty"), (material["LABST"] - material["TRANSITQTY"]));
            if (utility.getinputValueInNumbers(utility.sanitizeID(material["MATNR"]) + "_qty") > 0

                && !isDivisible(utility.getinputValueInNumbers(utility.sanitizeID(material["MATNR"]) + "_qty"), material["MODQTY"])

            ) {
                var message = ("Tranfer Qty should be multiple of MOD Quantity.")
                showsnackbar('error', message)
                return;
            } else if (utility.getinputValueInNumbers(utility.sanitizeID(material["MATNR"]) + "_qty") > 0

                && (utility.getinputValueInNumbers(utility.sanitizeID(material["MATNR"]) + "_qty") > (material["LABST"] - material["TRANSITQTY"]))


            ) {
                var message = ("Tranfer Qty greater than available quantity.")
                showsnackbar('error', message)
                return;
            }
        }

        for (let material of materialDetails) {
            if (utility.getinputValueInNumbers(utility.sanitizeID(material["MATNR"]) + "_qty") > 0) {
                console.log(utility.sanitizeID(material["MATNR"]), (dynamicstoragelocationchoices[utility.sanitizeID(material["MATNR"])]).getValue(true));
                if ((dynamicstoragelocationchoices[utility.sanitizeID(material["MATNR"])]).getValue(true).length == 0) {
                    var message = ("Please Select Storage Location")
                    showsnackbar('error', message)
                    dynamicstoragelocationchoices[utility.sanitizeID(material["MATNR"])].showDropdown()
                    return;
                }
            }
        }
        selectedMaterialsForTransfer = [];
        for (let material of materialDetails) {
            if (utility.getinputValueInNumbers(utility.sanitizeID(material["MATNR"]) + "_qty") > 0) {
                selectedMaterialsForTransfer.push(material)
            }
        }

        utility.info_alert(
            `Transfer Stock of ${selectedMaterialsForTransfer.length} Materials.`,
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
        for (let material of materialDetails) {
            if (utility.getinputValueInNumbers(utility.sanitizeID(material["MATNR"]) + "_qty") > 0) {
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

                const counterRef = doc(db, 'CounterDetails', "TransitStockCounter");

                var financialyear = utility.getFinancialYear(moment().format('DD/MM/YYYY'));
                var poPlantInitials = selectedMaterials[0]["WERKS"]
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

                console.log(counter);

                let isIssueNumberAssigned = true;
                for (let material of selectedMaterials) {
                    let rcd_location = material["LGORT"]
                    let id =
                        material["WERKS"] +
                        '_' +
                        utility.sanitizeID(material["MATNR"]);
                    console.log(id);
                    const ref = doc(db, 'IssueDetails', counter + "_" + id);
                    const transitref = doc(db, 'TransferTransitStockDetails', material["LGORT"] + "_" + utility.sanitizeID(material["MATNR"]));

                    await transaction.set(
                        transitref,
                        {

                            ISSUE_NUMBERS: arrayUnion(counter),
                            LGORT: material["LGORT"],
                            WERKS: material["WERKS"],
                            MATERIAL: material["MATNR"],
                            SHORT_TEXT: material["MAKTX"],
                            TR_QUAN: increment(utility.getinputValueInNumbers(utility.sanitizeID(material["MATNR"]) + "_qty")),
                            RCD_QUAN: increment(0),
                            LOGS: arrayUnion({
                                log: 'Stock Transfer : ' + utility.getinputValueInNumbers(utility.sanitizeID(material["MATNR"]) + "_qty") + " to " + (dynamicstoragelocationchoices[utility.sanitizeID(material["MATNR"])]).getValue(true),
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

                    await transaction.set(
                        ref,
                        {
                            PLANT: material["WERKS"] || "",
                            MATERIAL: material["MATNR"] || "",
                            STORE_LOC: material["LGORT"] || "",
                            ISSUE_TYPE: "STOCKTRANSFER",
                            ISSUE_NUMBER: counter,
                            ISSUE_DATE: utility.getDate(),
                            ISSUE_TIMESTAMP: utility.getTimestamp(),
                            RCD_LOC: (dynamicstoragelocationchoices[utility.sanitizeID(material["MATNR"])]).getValue(true),
                            MOVE_STLOC: rcd_location.toString(),
                            TR_QUAN: utility.getinputValueInNumbers(utility.sanitizeID(material["MATNR"]) + "_qty"),
                            RCD_QUAN: increment(utility.getinputValueInNumbers(utility.sanitizeID(material["MATNR"]) + "_qty")),
                            LOGS: arrayUnion({
                                log: 'Stock Transfered : ' + (dynamicstoragelocationchoices[utility.sanitizeID(material["MATNR"])]).getValue(true),
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
                if (isIssueNumberAssigned) {
                    transaction.set(
                        counterRef,
                        { [poPlantInitials + '_' + financialyearInitials]: { counter } },
                        { merge: true }
                    );
                    return { status: true, message: "#" + counter + ' Issue Number Generated, Material Stock Transfered.' };

                } else {
                    return { status: true, message: 'Material Stock Transfered.' };
                }
            });

            utility.hideloading();
            if (res.status) {
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
            <Head title={"Transfer Stock"} />

            <div id="main" className="layout-navbar">
                <header>
                    <Navbar pagename={"Transfer Stock"} />
                </header>
                <div id="main-content">
                    <div className="page-content">
                        <section className="pc-container m-0 d-flex flex-column p-1">
                            <div className="pcoded-content pb-5 d-flex flex-column flex-grow-1 p-1" style={{
                                overflow: "scroll"
                            }}>


                                {
                                    (materialDetails) !== null ? <>
                                        <div className="card h-100 flex-grow-1 border p-1 mb-0 col-12 col-lg-4 mx-auto">
                                            <div className="card-header py-3 px-2">

                                                <div className="d-flex flex-md-row flex-column justify-content-between align-center">
                                                    <h5 className="my-auto fs-8 text-dark d-none d-md-flex">Transfer Stock</h5>
                                                    <div className="d-flex flex-row gap-2">
                                                        <div className="d-none flex-column flex-grow-1">
                                                            <select id="storagelocationselect" className="text-sm rounded form-control form-control-sm" >

                                                            </select>
                                                        </div>
                                                        <button type="button" id="saveBtn" className="btn btn-sm  btn-success" onClick={(e) => stocktransfer()} >Confirm</button>

                                                    </div>




                                                </div>


                                            </div>
                                            <div className="card-body p-1" style={{
                                                overflow: "auto",
                                                maxHeight: "100%"
                                            }}>

                                                <input
                                                    id="searchbox"
                                                    type="text"
                                                    className="form-control bg-input-user mb-1 form-control-sm fw-bold text-dark"
                                                    placeholder="Search"
                                                />

                                                <hr />


                                                {(materialDetails || []).map((material, index) => {
                                                    return (<div id={utility.sanitizeID(material?.["MATNR"]) + "_div"} key={material["MATNR"]}
                                                        data-find={((material?.["MATNR"] || "") + " " + (material?.["MAKTX"] || "")).toUpperCase()}
                                                        className={"card materialitem mb-2 " + (index % 2 ? " bg-secondary-subtle" : "")}>
                                                        <div className='card-header p-2 d-flex flex-row align-items-center justify-content-between'>
                                                            <div className="d-flex flex-column col-6">
                                                                <span className="text-gray-500 text-sm mb-1">
                                                                    Material Code
                                                                </span>
                                                                <span className="fw-bolder text-dark text-md mb-0">
                                                                    {material?.["MATNR"] || "--"}
                                                                </span>
                                                            </div>
                                                            <div className="d-flex flex-column col-6">
                                                                <span className="text-gray-500 text-sm mb-1">
                                                                    Material Description
                                                                </span>
                                                                <span className="fw-bolder text-dark text-md mb-0">
                                                                    {material?.["MAKTX"] || "--"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className='card-body p-2 d-flex flex-column gap-3'>

                                                            <div className='d-flex flex-row'>
                                                                <div className="d-flex flex-column col-3 ">
                                                                    <span className="text-gray-500 text-sm mb-1">
                                                                        Plant
                                                                    </span>
                                                                    <span className="fw-bolder text-dark text-sm mb-0">
                                                                        {material?.["WERKS"] || "--"}
                                                                    </span>
                                                                </div>
                                                                <div className="d-flex flex-column col-3 ">
                                                                    <span className="text-gray-500 text-sm mb-1">
                                                                        Storage Loc
                                                                    </span>
                                                                    <span className="fw-bolder text-dark text-sm mb-0">
                                                                        {material?.["LGORT"] || "--"}
                                                                    </span>
                                                                </div>

                                                                <div className="d-flex flex-column col-3 ">
                                                                    <span className="text-gray-500 text-sm mb-1">
                                                                        Available  Quantity
                                                                    </span>
                                                                    <span className="fw-bolder text-dark text-sm mb-0">
                                                                        {(material?.["LABST"] || 0) - (material?.["TRANSITQTY"] || 0)}
                                                                    </span>
                                                                </div>
                                                                <div className="d-flex flex-column col-3 ">
                                                                    <span className="text-gray-500 text-sm mb-1">
                                                                        MOD Qty
                                                                    </span>
                                                                    <span className="fw-bolder text-dark text-sm mb-0">
                                                                        {material?.["MODQTY"] || 1}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className='d-flex flex-row gap-2'>

                                                                <div className="d-flex flex-column col ">
                                                                    <span className="text-gray-500 text-sm mb-1">
                                                                        Transfer Qty
                                                                    </span>
                                                                    <div className="input-group mb-0">
                                                                        <input
                                                                            id={utility.sanitizeID(material["MATNR"]) + "_qty"}
                                                                            type="number"
                                                                            disabled={material["availablestoragelocations"].length == 0}
                                                                            className="form-control bg-input-user mb-1 form-control-sm rounded fw-bold text-dark"
                                                                            placeholder=""
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="d-flex flex-column col-6">
                                                                    <span className="text-gray-500 text-sm mb-1">
                                                                        Target Storage Loc.
                                                                    </span>
                                                                    <select id={utility.sanitizeID(material?.["MATNR"]) + "select"} className="text-sm rounded form-control form-control-sm mb-0" >

                                                                    </select>
                                                                </div>
                                                            </div>


                                                        </div>

                                                    </div>)
                                                })}

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


export default StockTransfer;

export async function getStaticProps() {
    return {
        props: { module: "STOCKTRANSFER", onlyAdminAccess: false }
    };
}