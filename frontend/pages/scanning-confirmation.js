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
import { arrayRemove, arrayUnion, collection, deleteDoc, doc, getDocs, increment, orderBy, query, runTransaction, setDoc, where } from 'firebase/firestore'
import { db } from '../firebase/firebaseconfig'
import QrScanner from 'qr-scanner';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
const moment = extendMoment(Moment);
let selectedMaterials = []
let allSerialNumbers = []
let pendingEntryUIDs = []
let idleTimer;
let isProcessing = false
const ScanningConfirmation = () => {

    const materialnumber = useRef(null);
    const serialnumber = useRef(null);
    const [storagelocationchoices, setstoragelocationchoices] = useState(null);
    const [materialchoices, setmaterialchoices] = useState(null);

    const [scanQueue, setscanQueue] = useState([])
    const [errorQueue, seterrorQueue] = useState([])
    const [allScannedMaterials, setallScannedMaterials] = useState({})
    const [qrScanner, setqrScanner] = useState(null)
    const [qrData, setqrData] = useState("")
    const [contentModal, setcontentModal] = useState(null);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const qrinputstring = useRef(null);
    const showsnackbar = (variant, message) => {
        enqueueSnackbar(message, {
            variant: variant,
            anchorOrigin: { horizontal: 'center', vertical: 'top', },
        });
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
        getPending()
    }


    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSearchInput()

        }
    }
    function handleSearchInput() {
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

    async function getPending() {
        const q = query(
            collection(db, "PendingProductionConfirmationDetails"),
            // where("dateuid", "==", moment().format("DD/MM/YYYY").replaceAll("/", "")),
            where("storagelocation", "==", utility.get_keyvalue(constants.EMPLOYEE_STORAGELOCATION)),
            where("type", "==", "SCAN"),
            where("status", "==", "PENDING"),
            orderBy("lastscantimestamp", "desc")
        );
        var data = {}
        const querySnapshot = await getDocs(q);
        utility.hideloading();
        console.log(querySnapshot.size);
        querySnapshot.forEach((doc) => {
            if (doc.data().materialquantity > 0) {

                pendingEntryUIDs.push(...(doc.data().entryuids || []))
                data[doc.id] = doc.data()
            }
        });
        console.log(pendingEntryUIDs);
        setallScannedMaterials(data);
        getErrorEntries()
    }
    async function getErrorEntries() {
        const q = query(
            collection(db, "ErrorMaterialScanningEntries"),
            // where("dateuid", "==", moment().format("DD/MM/YYYY").replaceAll("/", "")),
            where("storagelocation", "==", utility.get_keyvalue(constants.EMPLOYEE_STORAGELOCATION)),
            orderBy("scantimestamp", "desc")
        );
        var data = []
        const querySnapshot = await getDocs(q);
        utility.hideloading();
        console.log(querySnapshot.size);
        querySnapshot.forEach((doc) => {
            data.push(doc.data())
        });

        seterrorQueue(data);
        getScanningEntries()
    }
    async function getScanningEntries() {
        const q = query(
            collection(db, "MaterialScanningEntries"),
            // where("dateuid", "==", moment().format("DD/MM/YYYY").replaceAll("/", "")),
            where("storagelocation", "==", utility.get_keyvalue(constants.EMPLOYEE_STORAGELOCATION)),
            orderBy("scantimestamp", "desc")
        );
        allSerialNumbers = []
        var data = []
        const querySnapshot = await getDocs(q);
        utility.hideloading();
        console.log(querySnapshot.size);
        querySnapshot.forEach((doc) => {
            if (doc.data().status === "PENDING") {
                data.push(doc.data())
                allSerialNumbers.push(doc.data().materialcode.toString().toUpperCase() + "_" + doc.data().serialnumber.toString().toUpperCase())
            }
        });

        setscanQueue(data);
    }
    useEffect(() => {

        $('#qrstring').focus();
        // Force focus
        // $('#qrstring').focusout(function () {
        //     $('#qrstring').focus();
        // });


        window.addEventListener("focus", function (event) {
            $('#qrstring').focus();
        }, false);
        // document.getElementById('qrstring').onblur = function (event) {
        //     var blurEl = this;
        //     setTimeout(function () {
        //         blurEl.focus()
        //     }, 10);
        // };
        const qrScanner = new QrScanner(
            $("#scannerview").get(0),
            result => {
                console.log('decoded qr code:', result)
                qrScanner.stop();

                if (isProcessing) {
                    var message = ("Previous Entry Processing, Please wait.")
                    showsnackbar('error', message)

                    return false;
                }
                setqrData(result.data)

            },
            { /* your options or returnDetailedScanResult: true if you're not specifying any other options */ },
        );

        // qrScanner.start();
        setqrScanner(qrScanner)





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
        document.addEventListener('mousemove', resetIdleTimer);
        document.addEventListener('mousedown', resetIdleTimer);
        document.addEventListener('keypress', resetIdleTimer);
        document.addEventListener('touchstart', resetIdleTimer);
    }, []);
    function resetIdleTimer() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(handleIdle, 3000); // 5 seconds idle threshold
    }

    function handleIdle() {

        console.log("INPUT FOCUSED");
        $('#qrstring').focus();

    }
    function handleCheckboxMaterialSelet(uid, ischecked) {
        if (ischecked) {
            if (!selectedMaterials.includes(uid)) {
                selectedMaterials.push(uid)
            }
        } else {
            selectedMaterials = utility.removeItemAllFromArray(selectedMaterials, uid);
        }

        console.log(selectedMaterials);
    }
    const checkifDataisCorrect = () => {
        $('.text-sm rounded form-control form-control-sm').removeClass(
            'is-invalid'
        );
        $('.form-control').removeClass(
            'is-invalid'
        );


        if (isProcessing) {
            var message = ("Previous Entry Processing, Please wait.")
            showsnackbar('error', message)

            return false;
        }

        console.log(moment("01/" + utility.getinputAllinUppercase('mfgmonthyear'), "DD/MM/YY").isValid());
        if (materialchoices.getValue(true).length == 0) {
            var message = ("Please Select Material")
            showsnackbar('error', message)
            materialchoices.showDropdown()
            return false;
        } else if (utility.isInputEmpty('serialnumber')) {
            $('#serialnumber').addClass('is-invalid');
            var message = 'Please Add Serial Number.';
            utility.showtippy('serialnumber', message, 'danger');
            showsnackbar('error', message);
            return false;
        } else if (allSerialNumbers.includes(materialchoices.getValue(true).toString().toUpperCase() + "_" + utility.getinputValue('serialnumber').toString().toUpperCase())) {
            $('#serialnumber').addClass('is-invalid');
            var message = 'Duplicate Serial Number.';
            utility.showtippy('serialnumber', message, 'danger');
            showsnackbar('error', message);
            return false;
        } else if (utility.isInputEmpty('mfgmonthyear')) {
            $('#mfgmonthyear').addClass('is-invalid');
            var message = 'Please Add Mfg Month Year (MM/YY).';
            utility.showtippy('mfgmonthyear', message, 'danger');
            showsnackbar('error', message);
            return false;
        } else if (utility.getinputAllinUppercase('mfgmonthyear').length != 5) {
            $('#mfgmonthyear').addClass('is-invalid');
            var message = 'Please Add Valid Mfg Month Year (MM/YY).';
            utility.showtippy('mfgmonthyear', message, 'danger');
            showsnackbar('error', message);
            return false;
        } else if (!utility.getinputAllinUppercase('mfgmonthyear').includes("/")) {
            $('#mfgmonthyear').addClass('is-invalid');
            var message = 'Please Add Valid Mfg Month Year (MM/YY).';
            utility.showtippy('mfgmonthyear', message, 'danger');
            showsnackbar('error', message);
            return false;
        } else if (!moment("01/" + utility.getinputAllinUppercase('mfgmonthyear'), "DD/MM/YY").isValid()) {
            $('#mfgmonthyear').addClass('is-invalid');
            var message = 'Please Add Valid Mfg Month Year (MM/YY).';
            utility.showtippy('mfgmonthyear', message, 'danger');
            showsnackbar('error', message);
            return false;
        }
        else if (storagelocationchoices.getValue(true).length == 0) {
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
            isProcessing = true
            var entryuid = utility.randomstring() + "_" + utility.getTimestamp()
            var data = {
                dateuid: moment().format("DD/MM/YYYY").replaceAll("/", ""),
                entryuid,
                plant: "1000",
                model: materialchoices.getValue(true).toString().substring(0, 4),
                storagelocation: storagelocationchoices.getValue(true),
                materialcode: materialchoices.getValue(true),
                serialnumber: utility.getinputValue('serialnumber'),
                mfgmonthyear: utility.getinputValue('mfgmonthyear'),
                materialquantity: 1,
                scantime: moment().format("DD/MM/YYYY HH:mm"),
                scantimestamp: moment().unix(),
            }

            if ((data.serialnumber || "").length == 0) {
                var message = 'Please Add Serial Number.';
                utility.showtippy('serialnumber', message, 'danger');
                showsnackbar('error', message);
                return false;
            }

            utility.showloading();
            var details = await RequestgetProductionOrder(data);
            utility.hideloading();

            console.log(details);

            if (details.status) {
                if (details.data["FOUND"]) {

                    await addtoQueue({
                        entryuid,
                        SERIAL_NUMBER: utility.getinputValue('serialnumber'),
                        mfgmonthyear: utility.getinputValue('mfgmonthyear'),
                        materialquantity: 1,
                        ...details.data
                    })
                } else {

                    isProcessing = false
                    var message = 'Failed To Continue, Production Order Not Found.';
                    showsnackbar('error', message);
                    addToErrorQueue({
                        ...data,
                        error: message
                    })



                }
            } else {

                isProcessing = false
                var message = 'Failed To Continue, ' + details.message;
                showsnackbar('error', message);
                addToErrorQueue({
                    ...data,
                    error: details.message
                })
            }
        }
    }

    async function addToErrorQueue(data) {
        utility.showloading()
        var ref = doc(collection(db, 'ErrorMaterialScanningEntries'), data.entryuid)
        await setDoc(ref, data, { merge: true })
        seterrorQueue(queue => {
            return [{
                ...data
            }, ...queue];
        })
        utility.hideloading()
    }


    async function deleteScanEntry(entryuid) {
        console.log(entryuid);
        var scanData = null
        scanQueue.map(data => {
            if (data.entryuid === entryuid) {
                scanData = data;
            }
        })
        if (scanData != null) {

            utility.info_alert(
                "Remove Scan Entry With Serial Number : " + scanData.serialnumber,
                'Are you sure you want to continue?',
                'OKAY', "CANCEL",
                (async () => {

                    let res = await runTransaction(db, async (transaction) => {
                        const ref = doc(db, 'MaterialScanningEntries', entryuid);
                        const docSnap = await transaction.get(ref);
                        if (docSnap.exists()) {
                            if (docSnap.data()["status"] === "PENDING") {

                                var pendingref = doc(collection(db, 'PendingProductionConfirmationDetails'), docSnap.data().uid + "_" + docSnap.data()["productionordernumber"])

                                const pendingdocSnap = await transaction.get(pendingref);
                                var isDeleted = false
                                if (pendingdocSnap.data().materialquantity == 0) {
                                    isDeleted = true
                                    transaction.delete(pendingref);
                                } else {
                                    transaction.set(
                                        pendingref, {
                                        entryuids: arrayRemove(entryuid),
                                        serialnumbers: arrayRemove(docSnap.data().serialnumber),
                                        materialquantity: increment(-docSnap.data().materialquantity),
                                        logs: arrayUnion({
                                            message: "CANCELLED : " + docSnap.data().serialnumber + ", " + entryuid,
                                            timestamp: utility.getTimestamp(),
                                            date: utility.getDate(),
                                            user: utility.get_keyvalue(constants.EMPLOYEE_FULLNAME),
                                            uid: utility.get_keyvalue(constants.EMPLOYEE_ID),
                                        })
                                    }, { merge: true }
                                    );
                                }



                                transaction.set(
                                    ref, {
                                    status: "CANCELLED",
                                    logs: arrayUnion({
                                        message: "CANCELLED" + isDeleted ? ", Pending Confirmation Deleted." : "",
                                        timestamp: utility.getTimestamp(),
                                        date: utility.getDate(),
                                        user: utility.get_keyvalue(constants.EMPLOYEE_FULLNAME),
                                        uid: utility.get_keyvalue(constants.EMPLOYEE_ID),
                                    })
                                },
                                    { merge: true }
                                );

                                return {
                                    status: true,
                                    message: ""
                                }
                            } else {
                                return {
                                    status: false,
                                    message: "Material Scan Entry Confirmed Already."
                                }
                            }
                        } else {
                            return {
                                status: false,
                                message: "Material Scan Entry Unavailable."
                            }
                        }
                    })

                    if (res.status) {
                        utility.success_alert("Material Scan Entry Removed.", 'Details Added successfully.', 'OKAY', utility.reloadPage, null);

                    } else {
                        utility.error_alert(
                            res.message,
                            'Failed To Add Details.',
                            'OKAY',
                            (() => { }),
                            null
                        );
                    }
                }),
                null
            );



        } else {
            showsnackbar('error', "Material Scan Entry Unavailable.")
        }
    }
    async function retriggerMaterial(entryuid) {
        console.log(entryuid);
        var errorData = null
        errorQueue.map(data => {
            if (data.entryuid === entryuid) {
                errorData = data;
            }
        })
        if (errorData != null) {
            utility.showloading()
            var details = await RequestgetProductionOrder(errorData);
            utility.hideloading();
            console.log(details);
            if (details.status) {
                if (details.data["FOUND"]) {
                    utility.showloading()
                    var ref = doc(collection(db, 'ErrorMaterialScanningEntries'), errorData.entryuid)
                    await deleteDoc(ref)
                    await addtoQueue({
                        ...errorData,
                        ...details.data
                    })
                } else {
                    var message = 'Failed To Continue, Production Order Not Found.';
                    showsnackbar('error', message);
                }
            } else {
                var message = 'Failed To Continue, ' + details.message;
                showsnackbar('error', message);

            }
        }
    }

    useEffect(() => {
        if (qrData.length > 0) {
            let data = qrData


            clearAll()
            console.log({ qrData, data: data.toString().split("#") });
            var materialcode = data.split("#")[0]
            var serialnumber = data.split("#")[1]
            var mfgmonthyear = data.split("#")[2]
            materialchoices.setChoiceByValue(materialcode)
            $("#serialnumber").val(serialnumber)
            $("#mfgmonthyear").val(mfgmonthyear)
            setTimeout(() => {
                if (!allSerialNumbers.includes(materialcode.toString().toUpperCase() + "_" + serialnumber.toString().toUpperCase())) {
                    $("#getprodorderbtn").click()
                } else {
                    showsnackbar('error', "Duplicate Serial Number, Add Unique Serial Number");
                }
            }, 20);

        }
    }, [qrData])

    function clearAll() {

        isProcessing = false
        $("#materialnumber").val("")
        $("#serialnumber").val("")
        $("#mfgmonthyear").val("")
        $("#qrstring").val("")
        storagelocationchoices.setChoiceByValue(utility.get_keyvalue(constants.EMPLOYEE_STORAGELOCATION))
        materialchoices.setChoiceByValue("")
        setqrData("")
        // qrScanner.start();
    }

    function checkIfEntryIsPending(entryuid) {
        console.log(pendingEntryUIDs, entryuid, pendingEntryUIDs.includes(entryuid));
        return pendingEntryUIDs.includes(entryuid)
    }
    async function addtoQueue(data) {

        var sanitizeID = utility.sanitizeID(data["MATERIAL"])
        var dateuid = moment().format("DD/MM/YYYY").replaceAll("/", "")
        var uid = `${dateuid}_${sanitizeID}`

        var produid = uid + "_" + data["ORDER_NUMBER"]

        var updateData = {
            type: "SCAN",
            produid: produid,
            uid: uid,
            dateuid,
            // model: "",
            model: data["MATERIAL"].substring(0, 4),
            plant: data["PRODUCTION_PLANT"] || "0",
            storagelocation: data["LGORT"],
            materialcode: data["MATERIAL"],
            materialdescription: data["MATERIAL_TEXT"],
            materialquantity: increment(data["materialquantity"]),
            targetquantity: data["TARGET_QUANTITY"],
            mfgmonthyear: data["mfgmonthyear"],
            productionordernumber: data["ORDER_NUMBER"],
            materialuom: data["UNIT"],
            serialnumbers: arrayUnion(data["SERIAL_NUMBER"]),
            lastserialnumber: data["SERIAL_NUMBER"],
            lastscantime: moment().format("DD/MM/YYYY HH:mm"),
            lastscantimestamp: moment().unix(),

            status: "PENDING",
            logs: arrayUnion({
                message: "ADDED : " + data["SERIAL_NUMBER"],
                timestamp: utility.getTimestamp(),
                date: utility.getDate(),

                user: utility.get_keyvalue(constants.EMPLOYEE_FULLNAME),
                uid: utility.get_keyvalue(constants.EMPLOYEE_ID),
            }),
            username: utility.get_keyvalue(constants.EMPLOYEE_FULLNAME),
            useruid: utility.get_keyvalue(constants.EMPLOYEE_ID),


        }
        allSerialNumbers.push(data["MATERIAL"].toString().toUpperCase() + "_" + data["SERIAL_NUMBER"])
        var ref = doc(collection(db, 'PendingProductionConfirmationDetails'), uid + "_" + data["ORDER_NUMBER"])
        var queuedata = {
            ...updateData,
            serialnumber: data["SERIAL_NUMBER"],
            scantime: moment().format("DD/MM/YYYY HH:mm"),
            scantimestamp: moment().unix(),
            materialquantity: data["materialquantity"],
        }
        pendingEntryUIDs.push(data.entryuid)
        console.log(pendingEntryUIDs);
        console.log({ queuedata });
        var entryref = doc(collection(db, 'MaterialScanningEntries'), data.entryuid)
        await setDoc(entryref, {
            ...queuedata,
            entryuid: data.entryuid
        }, { merge: true })
        setscanQueue((queue) => {
            return [{
                ...queuedata,
                entryuid: data.entryuid
            }, ...queue];
        })

        await setDoc(ref, {
            ...updateData,
            entryuids: arrayUnion(data["entryuid"]),
        }, { merge: true })
        setallScannedMaterials(oldallmaterials => {
            var allmaterials = JSON.parse(JSON.stringify(oldallmaterials))
            console.log(allmaterials);
            if (allmaterials[produid] == undefined) {
                allmaterials[produid] = JSON.parse(JSON.stringify(updateData))
                delete allmaterials[produid]["materialquantity"]
                delete allmaterials[produid]["serialnumbers"]
                allmaterials[produid]["materialquantity"] = 0
                allmaterials[produid]["serialnumbers"] = []
            }

            allmaterials[produid]["lastscantime"] = updateData['lastscantime']
            allmaterials[produid]["lastserialnumber"] = updateData['lastserialnumber']
            allmaterials[produid]["serialnumbers"].push(allmaterials[produid]["lastserialnumber"])
            allmaterials[produid]["materialquantity"]++
            $("#" + produid + "_quantity").text(allmaterials[produid]["materialquantity"])
            $("#" + produid + "_lastserialnumber").text(allmaterials[produid]["lastserialnumber"])
            $("#" + produid + "_lastscantime").text(allmaterials[produid]["lastscantime"])
            console.log(allmaterials);
            return allmaterials;
        })
        console.log("SCANNED");
        utility.hideloading()
        var message = 'Material Scanned';
        showsnackbar('success', message);
        clearAll()
    }


    async function postDetails() {

        if (Object.keys(selectedMaterials).length > 0) {
            utility.info_alert(
                `Scan Confirmation (FG) ${Object.keys(selectedMaterials).length} Materials.`,
                'Are you sure you want to continue.',
                'CONTINUE',
                'CANCEL',
                (async () => {
                    pushData();
                }),
                null
            );
        } else {
            var message = 'Failed To Continue, No Material Selected.';
            showsnackbar('error', message);
        }

        async function pushData() {
            utility.showloading()
            let res = await runTransaction(db, async (transaction) => {
                var pendingUIDs = []
                for (let key of selectedMaterials) {
                    console.log(key);
                    const ref = doc(db, 'PendingProductionConfirmationDetails', key);
                    const docSnap = await transaction.get(ref);
                    if (docSnap.exists()) {
                        if (
                            docSnap.data()["status"] === "PENDING"
                        ) {
                            pendingUIDs.push(key)
                        }
                    }

                }
                return pendingUIDs;

            })
            console.log(res);
            if (res.length > 0) {
                await productionConfirm(0, res)
            } else {
                utility.hideloading()
                var message = 'Failed To Continue, No Pending Confirmation.';
                showsnackbar('error', message);
            }
        }
    }

    useEffect(() => {
        console.log(allScannedMaterials);
    }, [allScannedMaterials]);

    async function productionConfirm(counter, pendingUIDs) {
        console.log(counter, (pendingUIDs.length));
        if (counter === (pendingUIDs.length)) {
            utility.hideloading()
            utility.success_alert(
                "Scan Confirmation (FG) Complete",
                'Details Added successfully.',
                'OKAY',
                utility.reloadPage,
                null
            );
            return true
        }
        let material = allScannedMaterials[pendingUIDs[counter]]
        var details = await RequestproductionOrderConfirmFG({ material });


        console.log(details);

        if (details.status) {

            try {
                let documentnumber = details.data["MBLNR"]
                const pendingref = doc(db, 'PendingProductionConfirmationDetails', material.produid);

                const ref = doc(db, 'ProductionConfirmationDetails', material.uid + "_" + documentnumber);
                let data = {
                    produid: material["produid"],
                    uid: material.uid + "_" + documentnumber,
                    dateuid: material["dateuid"],
                    // model: "",
                    documentnumber,
                    type: material["type"],
                    model: material["model"],
                    plant: material["plant"],
                    storagelocation: material["storagelocation"],
                    materialcode: material["materialcode"],
                    materialdescription: material["materialdescription"],
                    materialquantity: material["materialquantity"],
                    productionordernumber: material["productionordernumber"],
                    materialuom: material["materialuom"],
                    serialnumbers: arrayUnion(...material["serialnumbers"]),
                    lastserialnumber: material["lastserialnumber"],
                    lastscantime: material["lastscantime"],
                    lastscantimestamp: material["lastscantimestamp"],
                    status: "COMPLETED",
                    logs: arrayUnion({
                        message: "CONFIRMED : " + material["serialnumbers"].length,
                        timestamp: utility.getTimestamp(),
                        user: utility.get_keyvalue(constants.EMPLOYEE_FULLNAME),
                        uid: utility.get_keyvalue(constants.EMPLOYEE_ID),
                        date: utility.getDate()
                    }),
                    confirmtimestamp: utility.getTimestamp(),
                    confirmdate: utility.getDate(),
                    username: utility.get_keyvalue(constants.EMPLOYEE_FULLNAME),
                    useruid: utility.get_keyvalue(constants.EMPLOYEE_ID),

                }
                console.log(data);
                await setDoc(ref, data, { merge: true });
                await deleteDoc(pendingref);
                await saveProductionConfirmation(counter, pendingUIDs, data)

            } catch (error) {
                utility.hideloading();
                errorCallback({
                    message: error.message,
                });
                // errorOccured(counter, pendingUIDs, error.message)
            }


        } else {
            $('#' + pendingUIDs[counter] + "_select").prop('checked', false)
            errorCallback({
                message: details.message,
            });
            errorOccured(counter, pendingUIDs, details.data, details?.message || "Stock Deficit")
        }
    }




    function errorOccured(counter, pendingUIDs, error, errorMsg) {


        let errortable = getErrorTable(error?.["ITEM"] || [])
        console.log(errortable);
        utility.hideloading()
        if (counter < (pendingUIDs.length - 1)) {
            utility.info_alert(
                errorMsg + ', Are you sure you want to continue?',
                errortable,
                'OKAY', "CANCEL",
                (() => {
                    utility.showloading()
                    productionConfirm(counter + 1, pendingUIDs)
                }),
                null,
                true
            );
        } else {
            utility.error_alert(
                errorMsg,
                errortable,
                'OKAY',
                (() => { }),
                null, true
            );
        }

    }



    function getErrorTable(errorData) {
        let errortable = ``
        console.log(errorData);
        errorData.map(material => {
            errortable += `
             <div class="d-flex flex-row border-bottom mb-1">
                                <span class="text-dark w-50 text-wrap text-sm fw-bold m-auto text-start"> ${material["MATNR"]}</br>${material["MAKTX"]} </span>
                                <span class="text-dark w-25 text-sm fw-bold m-auto">  ${material["RLABST"]} </span>
                                <span class="text-dark w-25 text-sm fw-bold m-auto">  ${material["ALABST"]} </span>
                             </div>
            `
        })

        return `<div class="d-flex flex-column mt-3 w-100 border rounded p-2">
                            <div class="d-flex flex-row">
                                <span class="text-muted w-50 text-sm m-auto text-start"> Material </span>
                                <span class="text-muted w-25 text-sm m-auto"> Required </span>
                                <span class="text-muted w-25 text-sm m-auto"> Available </span>
                             </div>
                             ${errortable}
                        </div>`
    }

    async function saveProductionConfirmation(counter, pendingUIDs, data) {

        utility.showloading();

        try {
            const res = await runTransaction(db, async (transaction) => {


                const ref = doc(db, 'ConfirmationMaterialDetails', data["documentnumber"].toString());
                let updatedata = {
                    CODE: 200,
                    MBLNR: data["documentnumber"],
                    AUFNR: data["productionordernumber"],
                    PLANT: data["plant"],
                    WERKS: data["plant"],
                    SHORT_TEXT: data["materialdescription"],
                    MATERIALTYPE: "FG",
                    HASSERIALNUMBER: true,
                    PENDINGSERIALNUMBERS: data["serialnumbers"],
                    ADDEDSERIALNUMBERS: [],
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
                    username: utility.get_keyvalue(constants.EMPLOYEE_FULLNAME),
                    useruid: utility.get_keyvalue(constants.EMPLOYEE_ID),

                }
                console.log(updatedata);
                await transaction.set(
                    ref, updatedata
                    ,
                    { merge: true }
                );


                return { status: true, message: "#" + data["documentnumber"] + ' Confirmation Number Created.' };
            });

            utility.hideloading();
            if (res.status) {
                var value = utility.get_keyvalue("counter_" + moment().format("DD/MM/YYYY").replaceAll("/", "") + "_SCANNINGPRODUCTIONCONFIRMATION")
                if (value === "nothingfound") {
                    value = 0
                }
                value++

                utility.store_newvalue("counter_" + moment().format("DD/MM/YYYY").replaceAll("/", "") + "_SCANNINGPRODUCTIONCONFIRMATION", value)


                utility.updateloadingstatus(counter + "/" + pendingUIDs.length + " Done.");

                productionConfirm(counter + 1, pendingUIDs)

            } else {
                $('#' + pendingUIDs[counter] + "_select").prop('checked', false)
                errorOccured(counter, pendingUIDs, details.message)
            }
        } catch (e) {
            $('#' + pendingUIDs[counter] + "_select").prop('checked', false)
            errorOccured(counter, pendingUIDs, details.message)
        }
    }

    return (



        < main className='d-flex flex-column min-vh-100' >
            <Head title={"Scan Confirmation (FG)"} />

            <div id="main" className="layout-navbar">
                <header>
                    <Navbar pagename={"Scan Confirmation (FG)"} />
                </header>
                <div id="main-content">
                    <div className="page-content">
                        <section className="pc-container m-0 d-flex flex-column p-1">
                            <div className="pcoded-content pb-5 d-flex flex-column flex-grow-1 p-1">


                                <div className='flex-column flex-md-row d-flex h-100 gap-2 p-2' style={{ overflow: 'scroll' }}>

                                    <div className="card h-100 border p-1 mb-0 col-12 col-lg-3 mx-auto">
                                        <div className="card-header py-3 px-2">

                                            <div className="d-flex flex-row justify-content-between align-center">
                                                <h5 className="my-auto fs-6 text-dark">Scan Confirmation (FG)</h5>




                                            </div>


                                        </div>
                                        <div className="card-body p-2" style={{
                                            overflowY: "auto",
                                            overflowX: "hidden"
                                        }}>
                                            <div className="row d-flex flex-column gap-2">
                                                <div className="d-flex flex-column bg-light-success rounded p-3">
                                                    {/* <div className="form-check">
                                                        <input className="form-check-input" type="checkbox" value="" id="flexCheckIndeterminate" />
                                                        <label className="form-check-label" for="flexCheckIndeterminate">
                                                            Show Camera
                                                        </label>
                                                    </div> */}
                                                    <div className="d-flex flex-column">
                                                        <input id="qrstring" placeholder="QR String"
                                                            onKeyDown={(e) => handleKeyDown(e)} ref={qrinputstring}
                                                            className="mb-0 rounded form-control form-control-sm border-success bg-input-user text-dark text-sm rounded form-control form-control-sm masterdata fw-bold" />
                                                    </div>


                                                    <video className='d-none w-100' style={{ height: "150px" }} id="scannerview"></video>
                                                </div>
                                                <div className="d-flex flex-column">
                                                    <label htmlFor="storagelocationselect" className="form-label text-muted mb-2 text-sm">Storage Location</label>
                                                    <select id="storagelocationselect" className="text-sm rounded form-control form-control-sm" >

                                                    </select>
                                                </div>
                                                <div className="d-flex flex-column">
                                                    <label htmlFor="materialcodeselect" className="form-label text-muted mb-1 text-sm">Material</label>
                                                    <select id="materialcodeselect" className="text-sm rounded form-control form-control-sm" >

                                                    </select>
                                                </div>
                                                <div className="d-flex flex-column">
                                                    <label htmlFor="serialnumber" className="form-label text-muted mb-1 text-sm">Serial Number</label>
                                                    <input id="serialnumber"
                                                        ref={serialnumber} className="mb-0 rounded form-control form-control-sm border-primary bg-input-user text-dark text-sm rounded form-control form-control-sm masterdata fw-bold" />
                                                </div>
                                                <div className="d-flex flex-column">
                                                    <label htmlFor="mfgmonthyear" className="form-label text-muted mb-1 text-sm">MFG MM/YY</label>
                                                    <input id="mfgmonthyear"
                                                        className="mb-0 rounded form-control form-control-sm border-primary bg-input-user text-dark text-sm rounded form-control form-control-sm masterdata fw-bold" />
                                                </div>
                                            </div>
                                            <br />
                                        </div>
                                        <div className="card-footer p-2 d-flex flex-row gap-2 justify-content-end">
                                            <button type="button" className="btn btn-sm btn-light-secondary" onClick={(e) => clearAll()}>Clear</button>
                                            <button type="button" id="getprodorderbtn" className="btn btn-sm  btn-outline-success" onClick={(e) => getProductionOrder()} >Fetch Details</button>

                                        </div>
                                    </div>
                                    <div className="d-flex flex-column mb-0 flex-grow-1 mx-auto mw-100 mt-2 mt-md-0">

                                        <div className="h-auto col-md-8">
                                            <ul className="nav nav-pills flex-nowrap mb-2 w-100" id="items-pills-tab" role="tablist">
                                                <li className="nav-item border rounded me-2 bg-light " role="presentation">
                                                    <button
                                                        className="nav-link active btn-sm text-sm px-2 py-1"
                                                        id="pills-scanning-tab"
                                                        data-bs-toggle="pill"
                                                        data-bs-target="#pills-scanning"
                                                        type="button"
                                                        role="tab"
                                                        aria-controls="pills-scanning"
                                                        aria-selected="true"
                                                    >
                                                        SCANNING
                                                    </button>
                                                </li>
                                                <li className="nav-item border rounded me-2 bg-light " role="presentation">
                                                    <button
                                                        className="nav-link btn-sm text-sm px-2 py-1"
                                                        id="pills-error-tab"
                                                        data-bs-toggle="pill"
                                                        data-bs-target="#pills-error"
                                                        type="button"
                                                        role="tab"
                                                        aria-controls="pills-error"
                                                        aria-selected="true"
                                                    >
                                                        ERROR
                                                    </button>
                                                </li>
                                                <li className="nav-item border rounded me-2 bg-light " role="presentation">
                                                    <button
                                                        className="nav-link btn-sm text-sm px-2 py-1"
                                                        id="pills-confirmation-tab"
                                                        data-bs-toggle="pill"
                                                        data-bs-target="#pills-confirmation"
                                                        type="button"
                                                        role="tab"
                                                        aria-controls="pills-confirmation"
                                                        aria-selected="true"
                                                    >
                                                        CONFIRMATION
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="tab-content w-100 flex-grow-1 mh-100 flex-fill" id="items-pills-tabContent">
                                            <div className="tab-pane show active  w-100 h-100 "
                                                id="pills-scanning"
                                                role="tabpanel"
                                                aria-labelledby="pills-scanning-tab"
                                            >
                                                <div className="card h-100">
                                                    <div className="card-header p-2">

                                                        <div className="d-flex flex-row justify-content-between align-center">
                                                            <h6 className="my-auto text-md fw-bold  text-dark">Scanned Materials</h6>




                                                        </div>


                                                    </div>
                                                    <div className="card-body p-1" style={{ overflowY: "scroll" }}>

                                                        <div className='tablediv'>
                                                            <table className="table  table-sm display compact nowrap table-hover table-bordered w-100" id="scantable">
                                                                <thead>
                                                                    <tr>
                                                                        <th className="text-xs p-1">#</th>
                                                                        <th className="text-xs p-1">Model</th>
                                                                        <th className="text-xs p-1">ZF Part Number</th>
                                                                        <th className="text-xs p-1">Production Order Number</th>
                                                                        <th className="text-xs p-1">Serial No.</th>
                                                                        <th className="text-xs p-1">Scan Time</th>
                                                                        <th className="text-xs p-1">Quantity</th>
                                                                        <th className="text-xs p-1">Action</th>

                                                                    </tr>
                                                                </thead>
                                                                <tbody id="scantablebody">

                                                                    {
                                                                        scanQueue.map((material, index) => {

                                                                            return (<tr id={material.entryuid} key={index}>
                                                                                <td className="text-sm fw-bolder align-middle col">
                                                                                    {index + 1}.
                                                                                </td>

                                                                                <td className="text-sm fw-bolder align-middle col-1">
                                                                                    {material.model || ""}
                                                                                </td>
                                                                                <td className="text-sm fw-bolder align-middle col-1">
                                                                                    {material.materialcode || ""}
                                                                                </td>
                                                                                <td className="text-sm fw-bolder align-middle">
                                                                                    {material.productionordernumber || ""}
                                                                                </td>

                                                                                <td className="text-sm fw-bolder align-middle col-1">
                                                                                    {material.serialnumber || ""}
                                                                                </td>
                                                                                <td className="text-sm fw-bolder align-middle col-1">
                                                                                    {material.scantime || ""}
                                                                                </td>
                                                                                <td className="text-sm fw-bolder align-middle col-1">
                                                                                    {material.materialquantity || ""}
                                                                                </td>
                                                                                <td className="text-sm fw-bolder align-middle col-1">

                                                                                    {
                                                                                        checkIfEntryIsPending(material.entryuid) ? <>
                                                                                            <button type="button"
                                                                                                className="btn btn-sm  text-sm btn-outline-danger"
                                                                                                onClick={(e) => deleteScanEntry(material.entryuid)}>Delete</button>

                                                                                        </> : <></>
                                                                                    }



                                                                                </td>

                                                                            </tr>)

                                                                        })
                                                                    }


                                                                </tbody>

                                                            </table>
                                                        </div>

                                                    </div>

                                                </div>
                                            </div>
                                            <div className="tab-pane  w-100 h-100 "
                                                id="pills-error"
                                                role="tabpanel"
                                                aria-labelledby="pills-error-tab"
                                            >
                                                <div className="card h-100">
                                                    <div className="card-header p-2">

                                                        <div className="d-flex flex-row justify-content-between align-center">
                                                            <h6 className="my-auto text-md fw-bold  text-dark">Error Materials</h6>




                                                        </div>


                                                    </div>
                                                    <div className="card-body p-1" style={{ overflowY: "scroll" }}>

                                                        <div className='tablediv'>
                                                            <table className="table  table-sm display compact nowrap table-hover table-bordered w-100" id="scantable">
                                                                <thead>
                                                                    <tr>
                                                                        <th className="text-xs p-1">#</th>
                                                                        <th className="text-xs p-1">Model</th>
                                                                        <th className="text-xs p-1">ZF Part Number</th>
                                                                        <th className="text-xs p-1">Error</th>
                                                                        <th className="text-xs p-1">Serial No.</th>
                                                                        <th className="text-xs p-1">Scan Time</th>
                                                                        <th className="text-xs p-1">Quantity</th>
                                                                        <th className="text-xs p-1">Action</th>

                                                                    </tr>
                                                                </thead>
                                                                <tbody id="scantablebody">

                                                                    {
                                                                        errorQueue.map((material, index) => {

                                                                            return (<tr key={index}>
                                                                                <td className="text-sm fw-bolder align-middle col">
                                                                                    {index + 1}.
                                                                                </td>

                                                                                <td className="text-sm fw-bolder align-middle col-1">
                                                                                    {material.model || ""}
                                                                                </td>
                                                                                <td className="text-sm fw-bolder align-middle col-1">
                                                                                    {material.materialcode || ""}
                                                                                </td>
                                                                                <td className="text-sm fw-bolder align-middle">
                                                                                    {material.error || ""}
                                                                                </td>

                                                                                <td className="text-sm fw-bolder align-middle col-1">
                                                                                    {material.serialnumber || ""}
                                                                                </td>
                                                                                <td className="text-sm fw-bolder align-middle col-1">
                                                                                    {material.scantime || ""}
                                                                                </td>
                                                                                <td className="text-sm fw-bolder align-middle col-1">
                                                                                    {material.materialquantity || ""}
                                                                                </td>
                                                                                <td className="text-sm fw-bolder align-middle col-1">
                                                                                    <button type="button"
                                                                                        className="btn btn-sm  text-sm btn-success"
                                                                                        onClick={(e) => retriggerMaterial(material.entryuid)}>Re-Trigger</button>
                                                                                </td>

                                                                            </tr>)

                                                                        })
                                                                    }


                                                                </tbody>

                                                            </table>
                                                        </div>

                                                    </div>

                                                </div>
                                            </div>
                                            <div className="tab-pane show w-100 h-100 "
                                                id="pills-confirmation"
                                                role="tabpanel"
                                                aria-labelledby="pills-confirmation-tab"
                                            > <div className="card h-100">
                                                    <div className="card-header p-2">

                                                        <div className="d-flex flex-row justify-content-between align-center">
                                                            <h6 className="my-auto text-md fw-bold  text-dark">Pending Scan Confirmation (FG)</h6>




                                                        </div>


                                                    </div>
                                                    <div className="card-body p-1" style={{ overflowY: "scroll" }}>

                                                        <div className='tablediv'>
                                                            <table className="table  table-sm display compact nowrap table-hover table-bordered w-100" id="employeestable">
                                                                <thead>
                                                                    <tr>
                                                                        <th className="text-xs p-1">#</th>
                                                                        <th className="text-xs p-1">Model</th>
                                                                        <th className="text-xs p-1">ZF Part Number</th>
                                                                        <th className="text-xs p-1">Production Order Number</th>
                                                                        {/* <th className="text-xs p-1">Last Serial No.</th>
                                                                        <th className="text-xs p-1">Last Scan Time</th> */}
                                                                        <th className="text-xs p-1">Total Quantity</th>
                                                                        <th className="text-xs p-1">Select</th>

                                                                    </tr>
                                                                </thead>
                                                                <tbody id="employeestablebody">

                                                                    {
                                                                        Object.keys(allScannedMaterials).map((key, index) => {

                                                                            return (<tr key={index}>
                                                                                <td className="text-sm fw-bolder align-middle col">
                                                                                    {index + 1}.
                                                                                </td>

                                                                                <td className="text-sm fw-bolder align-middle col-1">
                                                                                    {allScannedMaterials[key].model || ""}
                                                                                </td>
                                                                                <td className="text-sm fw-bolder align-middle col-1">
                                                                                    {allScannedMaterials[key].materialcode || ""}
                                                                                </td>
                                                                                <td className="text-sm fw-bolder align-middle">
                                                                                    {allScannedMaterials[key].productionordernumber || ""}
                                                                                </td>

                                                                                {/* <td id={key + "_lastserialnumber"} className="text-sm fw-bolder align-middle col-1">
                                                                                    {allScannedMaterials[key].lastserialnumber || ""}
                                                                                </td>
                                                                                <td id={key + "_lastscantime"} className="text-sm fw-bolder align-middle col-1">
                                                                                    {allScannedMaterials[key].lastscantime || ""}
                                                                                </td> */}
                                                                                <td id={key + "_quantity"} className="text-sm fw-bolder align-middle col-1">
                                                                                    {allScannedMaterials[key].materialquantity || ""}
                                                                                </td>
                                                                                <td className="text-sm fw-bolder align-middle col-1">
                                                                                    <div className="d-flex flex-row p-1">
                                                                                        <div className="d-flex flex-row px-2 rounded py-0 bg-light-primary text-dark">
                                                                                            <div className="form-check d-flex flex-row align-items-center">
                                                                                                <input
                                                                                                    id={key + "_select"}
                                                                                                    className="form-check-input selectmaterial"
                                                                                                    type="checkbox"
                                                                                                    onChange={(e) => {
                                                                                                        handleCheckboxMaterialSelet(e.target.id.toString().replaceAll("_select", ""), e.target.checked,)
                                                                                                    }}
                                                                                                    value={key}
                                                                                                />
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </td>

                                                                            </tr>)

                                                                        })
                                                                    }


                                                                </tbody>

                                                            </table>
                                                        </div>

                                                    </div>
                                                    <div className="card-footer p-2 d-flex flex-row gap-2 justify-content-end">
                                                        <button type="button" id="saveBtn" className="btn btn-sm  btn-success" onClick={(e) => postDetails()} >CONFIRM MATERIAL</button>

                                                    </div>
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


export default ScanningConfirmation;

export async function getStaticProps() {
    return {
        props: { module: "SCANNINGPRODUCTIONCONFIRMATION", onlyAdminAccess: false }
    };
}