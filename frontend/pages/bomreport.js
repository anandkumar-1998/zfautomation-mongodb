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
import { RequestgetProductionOrder, RequestgetBOMReport, RequestgetStorageLocationMaterials, RequestproductionOrderConfirmFG } from '../firebase/masterAPIS'
import { arrayUnion, collection, deleteDoc, doc, getDocs, increment, orderBy, query, runTransaction, setDoc, where } from 'firebase/firestore'
import { db } from '../firebase/firebaseconfig'

import Moment from 'moment';
import { extendMoment } from 'moment-range';
const moment = extendMoment(Moment);
const BOMReport = () => {

    const [plantchoices, setplantchoices] = useState(null);
    const [storagelocationchoices, setstoragelocationchoices] = useState(null);
    const [materialchoices, setmaterialchoices] = useState(null);
    const [reportData, setreportData] = useState(null);

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
        $("#tablediv").empty()
        if (reportData == null) {
            var storagelocation = [
                // { value: "", label: "Select Storage Location", placeholder: true, disabled: true, selected: true },
            ]
            Object.keys(fbc.STORAGELOCATION).map(key => {
                storagelocation.push({
                    value: key,
                    // selected: key === utility.get_keyvalue(constants.EMPLOYEE_STORAGELOCATION),
                    label: key + " | " + fbc.STORAGELOCATION[key]
                })
            })

            let choiceElem = new Choices($("#storagelocationselect")[0], {
                // addItems: true,
                placeholder: true,
                removeItemButton: true,
                position: "bottom",
                resetScrollPosition: false,
                classNames: {
                    containerInner: "choices__inner bg-input-user h-auto text-dark fw-bold text-sm h-auto",
                    item: "choices__item pe-2 text-xs",
                    inputCloned: 'choices__input--cloned w-auto text-dark fw-bold text-sm',
                    button: 'choices__button  ms-1 me-0',
                },
                choices: storagelocation,
            })
            var plantArray = [
                // { value: "", label: "Select Storage Location", placeholder: true, disabled: true, selected: true },
            ]
            console.log(utility.get_keyvalue(constants.EMPLOYEE_PLANT));
            Object.keys(fbc.PLANTS).map(key => {
                plantArray.push({
                    value: key,
                    selected: key === utility.get_keyvalue(constants.EMPLOYEE_PLANT),
                    label: key + " | " + fbc.PLANTS[key]
                })
            })

            let plantchoiceElem = new Choices($("#plantselect")[0], {
                // addItems: true,
                placeholder: true,
                removeItemButton: true,
                position: "bottom",
                resetScrollPosition: false,
                classNames: {
                    containerInner: "choices__inner bg-input-user h-auto text-dark fw-bold text-sm h-auto",
                    item: "choices__item pe-2 text-xs",
                    inputCloned: 'choices__input--cloned w-auto text-dark fw-bold text-sm',
                    button: 'choices__button  ms-1 me-0',
                },
                choices: plantArray,
            })
            plantchoiceElem.disable()
            setstoragelocationchoices(choiceElem)

            // setmaterialchoices(new Choices($("#materialcodeselect")[0], {
            //     removeItemButton: true,
            //     allowHTML: true,
            //     editItems: true,
            //     allowHTML: true, addItemFilter: function (value) { return true },
            //     classNames: {
            //         containerInner: "choices__inner bg-input-user h-auto text-dark fw-bold text-sm h-auto",
            //         item: "choices__item pe-2 text-xs",
            //         inputCloned: 'choices__input--cloned w-auto text-dark fw-bold text-sm',
            //         button: 'choices__button  ms-1 me-0',
            //     },
            // }))
            utility.hideloading();
        } else {
            utility.hideloading();
            createTable(reportData)
        }

    }, [reportData]);
    const checkifDataisCorrect = () => {

        $('.text-sm rounded form-control form-control-sm').removeClass(
            'is-invalid'
        );

        // if (materialchoices.getValue(true).length == 0) {
        //     var message = ("Please Select Material")
        //     showsnackbar('error', message)
        //     materialchoices.showDropdown()
        //     return false;
        // } else
        if (utility.isInputEmpty('materialcode')) {
            $('#materialcode').addClass('is-invalid');
            var message = 'Please Add Material Code.';
            utility.showtippy('materialcode', message, 'danger');
            showsnackbar('error', message);
            return false;
        } else {
            return true;
        }
    };
    async function getProductionOrder() {

        if (checkifDataisCorrect()) {


            utility.showloading();
            var data = {
                plant: "1000",
                // storagelocations: storagelocationchoices.getValue(true),
                materialcode: utility.getinputValue('materialcode')
            }
            var details = await RequestgetBOMReport(data);

            setreportData(null)
            console.log(details);

            if (details.status) {
                var value = utility.get_keyvalue("counter_" + moment().format("DD/MM/YYYY").replaceAll("/", "") + "_STOCKREPORT")
                if (value === "nothingfound") {
                    value = 0
                }
                value++
                utility.store_newvalue("counter_" + moment().format("DD/MM/YYYY").replaceAll("/", "") + "_STOCKREPORT", value)

                setreportData(details.data)
            } else {
                utility.hideloading();
                var message = 'Failed To Continue, ' + details.message;
                showsnackbar('error', message);
            }

        }
    }

    function clearAll() {
        $("#tablediv").empty()
        storagelocationchoices.setChoiceByValue("")
        $(".form-control").val("")
        setreportData(null);
    }


    function createTable(data) {

        let tableID = utility.randomstring()

        let table = `
        <div class="d-flex flex-wrap gap-2">
         <div class="d-flex flex-column border rounded bg-light p-2 ">
            <span class="text-muted text-sm mb-1">Plant </span>
            <span class="text-dark fw-bold text-md"> ${data[0]["WERKS"]}</span>
         </div>
         <div class="d-flex flex-column border rounded bg-light p-2 ">
            <span class="text-muted text-sm mb-1"> Material Code </span>
            <span class="text-dark fw-bold text-md"> ${data[0]["MATNR"]}</span>
         </div>
           <div class="d-flex flex-column border  rounded bg-light p-2 ">
            <span class="text-muted text-sm mb-1"> Material Description </span>
            <span class="text-dark fw-bold text-md"> ${data[0]["MAKTX"]}</span>
         </div>
        </div>
        <hr class="my-2 text-muted"/>
        
        <table class="table  table-sm display compact nowrap table-hover table-bordered w-100" id="${tableID}table">
                                                            <thead>
                                                                <tr>
                                                                    <th class="text-xs p-1">#</th>
                                                                    <th class="text-xs p-1">Item</th>
                                                                    <th class="text-xs p-1">ICt</th>
                                                                    <th class="text-xs p-1">Component Code</th>
                                                                    <th class="text-xs p-1">Component Description</th>
                                                                    <th class="text-xs p-1">Quantity</th>
                                                                    <th class="text-xs p-1">Unit</th>
                                                                    <th class="text-xs p-1">Storage Location</th>
                                                                    <th class="text-xs p-1">Material Type</th>
                                                                    <th class="text-xs p-1">Material Group</th>
                                                                    <th class="text-xs p-1">Profit Center</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody id="${tableID}tablebody">
                                                               


                                                            </tbody>

                                                        </table>`

        $("#tablediv").empty().append(table)
        data.map((material, index) => {
            $("#" + `${tableID}tablebody`).append(`<tr>
                <td class="text-sm f-w-500">${index + 1}.</td>
                <td class="text-sm f-w-500">${material["POSNR"]}</td>
                <td class="text-sm f-w-500">${material["POSTP"]}</td>
                <td class="text-sm f-w-500">${material["IDNRK"]}</td>
                <td class="text-sm f-w-500">${material["OJTXP"]}</td>
                <td class="text-sm f-w-500">${material["MENGE"]}</td>
                <td class="text-sm f-w-500">${material["MEINS"]}</td>
                <td class="text-sm f-w-500">${material["LGORT"]}-${fbc.STORAGELOCATION[material["LGORT"]]}</td>
                <td class="text-sm f-w-500">${material["MTART"]}</td>
                <td class="text-sm f-w-500">${material["MATKL"]}</td>
                <td class="text-sm f-w-500">${material["PRCTR"]}</td>
            </tr>`)
        })

        var datatable = $("#" + `${tableID}table`).DataTable({
            info: false,
            dom: "Rlfrtip",
            autoWidth: false,
            orderCellsTop: true,
            scrollY: ($(".tablediv").height() - 10) + "px",
            scrollCollapse: true,
            paging: false,
            scrollX: true,
            fixedHeader: {
                header: true,
                footer: true
            },
            columnDefs: [
                { width: "2%", targets: [0] },
                { width: "5%", targets: [0, 1, 3, 5, 2, 6, 8, 9, 10] },
                { width: "10%", targets: [7] },
                // { width: "15%", targets: [4] },
            ]
        }
        );
    }


    return (



        < main className='d-flex flex-column min-vh-100' >
            <Head title={"BOM Report"} />

            <div id="main" className="layout-navbar">
                <header>
                    <Navbar pagename={"BOM Report"} />
                </header>
                <div id="main-content">
                    <div className="page-content">
                        <section className="pc-container m-0 d-flex flex-column p-1">
                            <div className="pcoded-content pb-5 d-flex flex-column flex-grow-1 p-1">


                                <div className='flex-row d-flex h-100'>

                                    {
                                        reportData == null ? <>
                                            <div className="card h-100 border p-1 mb-0 col-lg-4 col-12 mx-auto">
                                                <div className="card-header py-3 px-2">

                                                    <div className="d-flex flex-row justify-content-between align-center">
                                                        <h5 className="my-auto fs-6 text-dark">BOM Report</h5>




                                                    </div>


                                                </div>
                                                <div className="card-body p-3">
                                                    <div className="row d-flex flex-column gap-2">
                                                        <div className="d-flex flex-column mb-2">
                                                            <label htmlFor="plantselect" className="form-label text-muted mb-2 text-sm">Plant</label>
                                                            <select multiple={true} id="plantselect" className="text-sm rounded form-control form-control-sm" >

                                                            </select>
                                                        </div>
                                                        <div className="d-flex flex-column mb-2 d-none">
                                                            <label htmlFor="storagelocationselect" className="form-label text-muted mb-2 text-sm">Storage Location</label>
                                                            <select multiple={true} id="storagelocationselect" className="text-sm rounded form-control form-control-sm" >

                                                            </select>
                                                        </div>
                                                        <div className="d-flex flex-column">
                                                            <label htmlFor="materialcode" className="form-label text-muted mb-1 text-sm">Material Code</label>
                                                            <input id="materialcode" className="text-sm rounded bg-input-user text-dark fw-bold form-control form-control-sm" >

                                                            </input>
                                                        </div>

                                                    </div>
                                                    <br />
                                                </div>
                                                <div className="card-footer p-2 d-flex flex-row gap-2 justify-content-end">
                                                    <button type="button" className="btn btn-sm btn-light-secondary" onClick={(e) => clearAll()}>Clear</button>
                                                    <button type="button" id="saveBtn" className="btn btn-sm  btn-success" onClick={(e) => getProductionOrder()} >GET REPORT</button>

                                                </div>
                                            </div>
                                        </> : <>
                                            <div className="card flex-grow-1  border p-1 mb-0">
                                                <div className="card-header p-1">

                                                    <div className="d-flex flex-row justify-content-between align-center">
                                                        <h5 className="my-auto ms-2 fs-6 text-dark">BOM Report</h5>


                                                        <div className="d-flex flex-row">


                                                            <button type="button"
                                                                onClick={(e) => clearAll()} className="fs-10 rounded btn btn-sm btn-outline-secondary ">CLEAR</button>

                                                        </div>

                                                    </div>


                                                </div>
                                                <div className="card-body px-1 py-2" style={{ overflow: "scroll" }}>
                                                    <div id="tablediv" className="tablediv">

                                                    </div>
                                                </div>
                                            </div>

                                        </>
                                    }




                                </div>

                            </div>
                        </section>
                    </div>
                </div>
            </div >



        </main >


    );
}


export default BOMReport;

export async function getStaticProps() {
    return {
        props: { module: "BOMREPORT", onlyAdminAccess: false }
    };
}