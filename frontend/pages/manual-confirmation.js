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
import { RequestgetProductionOrder, RequestgetStorageLocationMaterials, RequestproductionOrderConfirmFG } from '../firebase/masterAPIS'
import { arrayUnion, collection, deleteDoc, doc, getDocs, increment, orderBy, query, runTransaction, setDoc, where } from 'firebase/firestore'
import { db } from '../firebase/firebaseconfig'

import Moment from 'moment';
import { extendMoment } from 'moment-range';
const moment = extendMoment(Moment);
const ManualConfirmation = () => {

    const materialnumber = useRef(null);
    const [storagelocationchoices, setstoragelocationchoices] = useState(null);
    const [materialchoices, setmaterialchoices] = useState(null);

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

    async function getFGMaterials() {



        var fgMaterials = utility.get_keyvalue(constants.FG_MATERIALS)
        if (fgMaterials === "nothingfound") {
            utility.showloading()
            utility.updateloadingstatus("Fetching FG Materials")
            var details = await RequestgetStorageLocationMaterials({
                plant: "1000",
                storagelocation: utility.get_keyvalue(constants.EMPLOYEE_STORAGELOCATION),
                materialtype: 'FG',
            });
            console.log(details);
            if (details.status) {
                utility.store_newvalue(constants.FG_MATERIALS, details.data)
            } else {
                var message = 'Failed To Fetch FG Materials, ' + details.message;
                showsnackbar('error', message);
                utility.store_newvalue(constants.FG_MATERIALS, [])
            }

            utility.hideloading()
            fgMaterials = utility.get_keyvalue(constants.FG_MATERIALS)
        }
        var materials = [
            { value: "", label: "Select Materials", placeholder: true, disabled: true, selected: true },

        ]
        fgMaterials.map(material => {
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
    }


    useEffect(() => {

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
        getFGMaterials()
    }, []);
    const checkifDataisCorrect = () => {

        $('.text-sm rounded form-control form-control-sm').removeClass(
            'is-invalid'
        );

        if (materialchoices.getValue(true).length == 0) {
            var message = ("Please Select Material")
            showsnackbar('error', message)
            materialchoices.showDropdown()
            return false;
        } else if (utility.isInputEmpty('materialquantity')) {
            $('#materialquantity').addClass('is-invalid');
            var message = 'Please Add Quantity.';
            utility.showtippy('materialquantity', message, 'danger');
            showsnackbar('error', message);
            return false;
        } else if (utility.getinputValueInNumbers('materialquantity') < 0) {
            $('#materialquantity').addClass('is-invalid');
            var message = 'Please Add Valid Quantity.';
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
    async function getProductionOrder() {
        if (checkifDataisCorrect()) {


            utility.info_alert(
                `Production Confirmation For ${materialchoices.getValue(true)} of ${utility.getinputValueInNumbers('materialquantity')} Quantity?`,
                'Are you sure you want to continue.',
                'CONTINUE',
                'CANCEL',
                async () => {
                    pushData();
                },
                null
            );


            async function pushData() {
                utility.showloading();
                var entryuid = utility.randomstring() + "_" + utility.getTimestamp()
                var data = {
                    entryuid,
                    plant: "1000",
                    storagelocation: storagelocationchoices.getValue(true),
                    materialcode: materialchoices.getValue(true),
                    serialnumber: ""
                }
                var details = await RequestgetProductionOrder(data);

                console.log(details);

                if (details.status) {
                    if (details.data["FOUND"]) {
                        await addtoQueue({
                                    entryuid,
                            ...details.data,
                            materialquantity: utility.getinputValue('materialquantity'),
                        })
                    } else {
                        utility.hideloading();

                        var message = 'Failed To Continue, Production Order Not Found.';
                        showsnackbar('error', message);
                    }
                } else {
                    utility.hideloading();

                    var message = 'Failed To Continue, ' + details.message;
                    showsnackbar('error', message);
                }
            }

        }
    }

    function clearAll() {
        $("#materialnumber").val("")
        $("#serialnumber").val("")
        $("#materialquantity").val("")
        storagelocationchoices.setChoiceByValue(utility.get_keyvalue(constants.EMPLOYEE_STORAGELOCATION))
        materialchoices.setChoiceByValue("")

    }

    async function addtoQueue(data) {

        var sanitizeID = utility.sanitizeID(data["MATERIAL"])
        var dateuid = moment().format("DD/MM/YYYY").replaceAll("/", "")
        var uid = `${dateuid}_${sanitizeID}`


        var updateData = {
            type: "MANUAL",
            isconfirmed: false,
            produid: uid + "_" + data["ORDER_NUMBER"],
            entryuid: data["entryuid"],
            uid: uid,
            dateuid,
            // model: "",
            model: data["MATERIAL"].substring(0, 4),
            plant: data["PRODUCTION_PLANT"],
            storagelocation: data["LGORT"],
            materialcode: data["MATERIAL"],
            materialdescription: data["MATERIAL_TEXT"],
            materialquantity: data["materialquantity"],
            productionordernumber: data["ORDER_NUMBER"],
            materialuom: data["UNIT"],
            targetquantity: data["TARGET_QUANTITY"],
            serialnumbers: [],
            lastserialnumber: "",
            lastscantime: moment().format("DD/MM/YYYY HH:mm"),
            lastscantimestamp: moment().unix(),
            status: "PENDING",
            logs: arrayUnion({
                message: "MANUAL ADDED : " + data["MATERIAL"],
                timestamp: utility.getTimestamp(),
                date: utility.getDate()
            })


        }

        var entryref = doc(collection(db, 'MaterialScanningEntries'), updateData.entryuid)

        await setDoc(entryref, updateData, { merge: true })

        var ref = doc(collection(db, 'PendingProductionConfirmationDetails'), uid + "_" + data["ORDER_NUMBER"])
        await setDoc(ref, updateData, { merge: true })
        await productionConfirm(updateData)

    }




    async function productionConfirm(material) {

        var details = await RequestproductionOrderConfirmFG({ material });
        utility.hideloading();

        console.log(details);

        if (details.status) {

            try {
                let documentnumber = details.data["MBLNR"]
                const pendingref = doc(db, 'PendingProductionConfirmationDetails', material.produid);

                const ref = doc(db, 'ProductionConfirmationDetails', material.uid + "_" + documentnumber);

                var data = {
                    uid: material.uid + "_" + documentnumber,
                    dateuid: material["dateuid"],
                    // model: "",
                    documentnumber,
                    produid: material["produid"],
                    type: material["type"],
                    model: material["model"],
                    plant: material["plant"],
                    storagelocation: material["storagelocation"],
                    materialcode: material["materialcode"],
                    materialdescription: material["materialdescription"],
                    materialquantity: material["materialquantity"],
                    productionordernumber: material["productionordernumber"],
                    materialuom: material["materialuom"],
                    serialnumbers: [],
                    lastserialnumber: "",
                    lastscantime: material["lastscantime"],
                    lastscantimestamp: material["lastscantimestamp"],
                    status: "COMPLETED",
                    logs: arrayUnion({
                        message: "CONFIRMED : " + documentnumber,
                        timestamp: utility.getTimestamp(),
                        date: utility.getDate()
                    }),
                    confirmtimestamp: utility.getTimestamp(),
                    confirmdate: utility.getDate()

                }
                console.log(data);
                await setDoc(ref, data, { merge: true });
                await deleteDoc(pendingref);
                await saveProductionConfirmation(data)

            } catch (error) {
                utility.hideloading();
                errorCallback({
                    message: error.message,
                });
            }


        } else {
            var message = 'Failed To Continue, ' + details.message;
            showsnackbar('error', message);
        }
    }

    async function saveProductionConfirmation(data) {

        utility.showloading();

        try {
            const res = await runTransaction(db, async (transaction) => {

                //7338429822
                const ref = doc(db, 'ConfirmationMaterialDetails', data["documentnumber"].toString());
                let updateData = {
                    CODE: 200,
                    MBLNR: data["documentnumber"],
                    AUFNR: data["productionordernumber"],
                    PLANT: data["plant"],
                    WERKS: data["plant"],
                    SHORT_TEXT: data["materialdescription"],
                    MATERIAL: data["materialcode"],
                    MATNR: data["materialcode"],
                    STORE_LOC: data["storagelocation"],
                    LGORT: data["storagelocation"],
                    MEINS: data["materialuom"],
                    MENGE: Number(data["materialquantity"]),
                    MJAHR: "",
                    STATUS: "PENDING",
                    TIMESTAMP: utility.getTimestamp(),
                    DATE: utility.getDate(),
                    LOGS: arrayUnion({
                        log: data["documentnumber"] + " Created",
                        user: utility.get_keyvalue(constants.EMPLOYEE_FULLNAME),
                        uid: utility.get_keyvalue(constants.EMPLOYEE_ID),
                        date: utility.getDate(),
                        timestamp: utility.getTimestamp(),
                    }),
                }
                console.log(updateData);
                await transaction.set(
                    ref, updateData
                    ,
                    { merge: true }
                );

                return { status: true, message: "#" + data["documentnumber"] + ' Confirmation Number Created.' };
            });

            utility.hideloading();
            if (res.status) {
                var value = utility.get_keyvalue("counter_" + moment().format("DD/MM/YYYY").replaceAll("/", "") + "_MANUALPRODUCTIONCONFIRMATION")
                if (value === "nothingfound") {
                    value = 0
                }
                value++

                utility.store_newvalue("counter_" + moment().format("DD/MM/YYYY").replaceAll("/", "") + "_MANUALPRODUCTIONCONFIRMATION", value)

                utility.hideloading()
                utility.success_alert(
                    "Production Confirmation Complete",
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
            <Head title={"Prod. Confirmation (FG)"} />

            <div id="main" className="layout-navbar">
                <header>
                    <Navbar pagename={"Prod. Confirmation (FG)"} />
                </header>
                <div id="main-content">
                    <div className="page-content">
                        <section className="pc-container m-0 d-flex flex-column p-1">
                            <div className="pcoded-content pb-5 d-flex flex-column flex-grow-1 p-1">


                                <div className='flex-row d-flex h-100'>

                                    <div className="card h-100 border p-1 mb-0 col-lg-4 col-12 mx-auto">
                                        <div className="card-header py-3 px-2">

                                            <div className="d-flex flex-row justify-content-between align-center">
                                                <h5 className="my-auto fs-6 text-dark">Prod. Confirmation (FG)</h5>




                                            </div>


                                        </div>
                                        <div className="card-body p-3">
                                            <div className="row d-flex flex-column gap-2">
                                                <div className="d-flex flex-column mb-2">
                                                    <label htmlFor="storagelocationselect" className="form-label text-muted mb-2 text-sm">Storage Location</label>
                                                    <select id="storagelocationselect" className="text-sm rounded form-control form-control-sm" >

                                                    </select>
                                                </div>
                                                <div className="d-flex flex-column">
                                                    <label htmlFor="materialcodeselect" className="form-label text-muted mb-1 text-sm">Material</label>
                                                    <select id="materialcodeselect" className="text-sm rounded form-control form-control-sm" >

                                                    </select>
                                                </div>
                                                <div className="d-flex flex-column mb-2">
                                                    <label htmlFor="materialquantity" className="form-label text-muted mb-1 text-sm">Material Quantity</label>
                                                    <input id="materialquantity"
                                                        className="mb-0 rounded form-control form-control-sm border-primary bg-input-user text-dark text-sm rounded form-control form-control-sm masterdata fw-bold" />
                                                </div>
                                            </div>
                                            <br />
                                        </div>
                                        <div className="card-footer p-2 d-flex flex-row gap-2 justify-content-end">
                                            <button type="button" className="btn btn-sm btn-light-secondary" onClick={(e) => clearAll()}>Clear</button>
                                            <button type="button" id="saveBtn" className="btn btn-sm  btn-success" onClick={(e) => getProductionOrder()} >CONFIRM MATERIAL</button>

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


export default ManualConfirmation;

export async function getStaticProps() {
    return {
        props: { module: "MANUALPRODUCTIONCONFIRMATION", onlyAdminAccess: false }
    };
}