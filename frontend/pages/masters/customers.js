import { useState, useEffect } from 'react'
import * as utility from '../../libraries/utility'
import * as constants from '../../constants/appconstants'
import * as fbc from '../../firebase/firebaseConstants'
import Sidebar from '../../components/sidebar'
import Navbar from '../../components/navbar'
import Head from '../../components/head'
import $ from 'jquery'
import { DataTable } from "datatables.net-bs5"
import "datatables.net-colreorderwithresize-npm";
import "datatables.net-buttons-dt";
import "datatables.net-buttons/js/buttons.html5.js";
import "datatables.net-fixedheader-bs5/js/fixedHeader.bootstrap5.js"
import "datatables.net-select-bs5/js/select.bootstrap5"
import { useSnackbar } from 'notistack'
import { db } from '../../firebase/firebaseconfig'
import { arrayUnion, collection, doc, getDocs, orderBy, query, setDoc } from 'firebase/firestore'
const selectedCustomerUID = ""
const selectedCustomerDoc = null

const Customers = ({ module }) => {

    const [allCustomerDocs, setCustomerDocs] = useState([])
    const [selectedModules, setselectedModules] = useState([])
    const [contentModal, setcontentModal] = useState(null);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const showsnackbar = (variant, message) => {
        enqueueSnackbar(message, {
            variant: variant,
            anchorOrigin: { horizontal: 'right', vertical: 'top' },
        });
    }

    useEffect(() => {
        if (allCustomerDocs.length > 0) {
            allCustomerDocs.map((customer, index) => {
                var status = `<span class="badge bg-success p-2">ACTIVE</span>`

                if (!customer.isactive) {
                    status = `<span class="badge bg-danger p-2">IN-ACTIVE</span>`
                }



                var rowitem = `<tr>
                                <td class="text-sm f-w-500">${index + 1}.</td>
                                <td class="text-sm f-w-500">${customer.customername}</td>
                                <td class="text-sm f-w-500">${customer.customerbarcodetemplate}</td>
                                <td class="text-sm f-w-500">${customer.vendorcode}</td>
                                <td class="text-sm f-w-500">${customer.vendorname}</td>
                                 <td class="align-middle">
                                <button
                                    id=${customer.customeruid}
                                    class="btn btn-sm text-xs btn-outline-primary  w-100"
                                >
                                    EDIT
                                </button>
                                </td> </tr>`


                $("#customerstablebody").append(rowitem)
                $("#" + customer.customeruid).on("click", function () {
                    modifyCustomer(this.id);
                });
            })



            var datatable = $("#customerstable").DataTable({
                info: false,
                dom: "Rlfrtip",
                autoWidth: false,
                orderCellsTop: true,
                scrollY: ($(window).height() * 0.75) + "px",
                scrollCollapse: true,
                paging: false,
                scrollX: true,
                fixedHeader: {
                    header: true,
                    footer: true
                },
                columnDefs: [
                    { width: "2%", targets: [0, 5] },
                    { width: "5%", targets: [1, 3, 2] },
                    // { width: "15%", targets: [4] },
                ]
            }
            );

            $("#searchbox").keyup(function () {
                datatable.search(this.value).draw();
            });
            $(".dataTables_filter").addClass('d-none')
        }

    }, [allCustomerDocs])



    const modifyCustomer = (uid) => {
        console.log(uid);
        allCustomerDocs.map(customer => {
            if (customer.customeruid == uid) {
                toggleModal()
                selectedCustomerDoc = customer;
                selectedCustomerUID = uid


                $("#customername").val(customer.customername)
                $("#vendorname").val(customer.vendorname)
                $("#vendorcode").val(customer.vendorcode)
                $("#customeraddress").val(customer.customeraddress)
                $("#shippinglocation").val(customer.shippinglocation)
                $("#customerbarcodetemplate").val(customer.customerbarcodetemplate)
                $("#zfbarcodetemplate").val(customer.zfbarcodetemplate)
                $("#remark").val(customer.remark)
                $("#dateformat").val(customer.dateformat)
                $("#stringseprator").val(customer.stringseprator)
                $("#labelcopycount").val(customer.labelcopycount)


            }
        })

    }



    useEffect(() => {




        loadData()

    }, [])


    function addModule(moduleName, moduleObject) {

        var subModules = ``
        Object.keys(moduleObject).map(key => {
            var moduleDetails = moduleObject[key]
            var moduleItems = ``
            Object.keys(moduleDetails.modules).map(moduleKey => {
                var module = moduleDetails.modules[moduleKey]
                if (!$('#' + moduleKey + "_div").length) {
                    moduleItems += ` 
                <div id="${moduleKey}_div" class="p-2 bg-light border rounded me-2 mt-2">
                <div class="form-check mb-0">
                                                <input class="form-check-input input-success adminallowed modules me-3" value="${moduleKey}" type="checkbox" id="${moduleKey}" />
                                                <label class="form-check-label mb-0 me-3" for="${moduleKey}">
                                                ${module.label}
                                                </label>
                                            </div>
                                            </div>
                                            `
                }

            })
            if (moduleItems.length > 0) {

                var subMenu = `<div class="form-group mt-3 mx-0 mb-0">
                                    <label class="form-label text-sm">${moduleName} ${moduleDetails.label}</label>
                                    
                                    <div class="d-flex flex-wrap">
                                    ${moduleItems}
                                     </div>
                                </div>`

                subModules += subMenu
            }


        })



        var modulediv = ` <div class="form-group mt-3 mx-0 border rounded p-2 ">
                                    <span class="text-md fw-bold">${moduleName} Modules</span>
                                    <br />
                                    <div class="d-flex flex-column">
                                        ${subModules}
                                    </div>
                                </div>`

        $("#modulesdiv").append(modulediv)
    }


    async function getAllCustomers() {
        utility.showloading()
        const q = query(
            collection(db, "CustomersDetails"),
            orderBy("customername", "desc")
        );
        var data = []
        const querySnapshot = await getDocs(q);
        utility.hideloading();
        console.log(querySnapshot.size);
        querySnapshot.forEach((doc) => {
            data.push(doc.data())
        });
        setCustomerDocs(data)
        utility.store_newvalue("counter_" + module, data.length)
        utility.hideloading()

    }




    async function loadData() {


        getAllCustomers()
        setcontentModal(
            bootstrap.Modal.getOrCreateInstance($("#contentModal"), {
                keyboard: false,
            })
        );

        utility.hideloading();


    }


    function clearAll() {
        $(".form-control").val("")
        $(".form-control form-control-sm").val("")
        selectedCustomerUID = ""
        selectedCustomerDoc = null
        utility.enableinput("vendorcode")
        $("#customerstatusswitch").prop('checked', false).trigger('change');
        $("#adminstatusswitch").prop('checked', false).trigger('change');
        $(".adminallowed").prop('disabled', false);
        $(".adminallowed").prop('checked', false).trigger('change');
        $("#dateformat").val("DD.MM.YYYY")
        $("#stringseprator").val("#")
    }


    const addnewCustomer = () => {
        toggleModal()
    }



    const toggleModal = () => {
        clearAll()
        $(".text-sm rounded form-control form-control-sm").removeClass("is-invalid");

        if (contentModal != undefined) {
            contentModal.toggle()
        }

    }






    const checkifDataisCorrect = () => {
        $(".text-sm rounded form-control form-control-sm").removeClass("is-invalid");

        if (utility.isInputEmpty('customername')) {
            $("#customername").addClass("is-invalid");
            var message = ("Please Add Customer Name")
            utility.showtippy('customername', message, 'danger');
            showsnackbar('error', message)
            return false;
        }
        else if (utility.isInputEmpty('vendorname')) {
            $("#vendorname").addClass("is-invalid");
            var message = ("Please Add Password")
            utility.showtippy('vendorname', message, 'danger');
            showsnackbar('error', message)
            return false;
        } else if (utility.isInputEmpty('vendorcode')) {
            $("#vendorcode").addClass("is-invalid");
            var message = ("Please Add Vendor Code")
            utility.showtippy('vendorcode', message, 'danger');
            showsnackbar('error', message)
            return false;
        }
        else if (utility.isInputEmpty('customeraddress')) {
            $("#customeraddress").addClass("is-invalid");
            var message = ("Please Add Customer Address")
            utility.showtippy('customeraddress', message, 'danger');
            showsnackbar('error', message)
            return false;
        }
        else if (utility.isInputEmpty('shippinglocation')) {
            $("#shippinglocation").addClass("is-invalid");
            var message = ("Please Add Shipping Location")
            utility.showtippy('shippinglocation', message, 'danger');
            showsnackbar('error', message)
            return false;
        }

        else if (utility.isInputEmpty('customerbarcodetemplate')) {
            $("#customerbarcodetemplate").addClass("is-invalid");
            var message = ("Please Add Customer Barcode Template")
            utility.showtippy('customerbarcodetemplate', message, 'danger');
            showsnackbar('error', message)
            return false;
        }

        else if (utility.isInputEmpty('zfbarcodetemplate')) {
            $("#zfbarcodetemplate").addClass("is-invalid");
            var message = ("Please Add ZF Barcode Template")
            utility.showtippy('zfbarcodetemplate', message, 'danger');
            showsnackbar('error', message)
            return false;
        }

        else if (utility.isInputEmpty('labelcopycount')) {
            $("#labelcopycount").addClass("is-invalid");
            var message = ("Please Add Label Copy Count")
            utility.showtippy('labelcopycount', message, 'danger');
            showsnackbar('error', message)
            return false;
        }
        else if (utility.getinputValueInNumbers('labelcopycount') < 1) {
            $("#labelcopycount").addClass("is-invalid");
            var message = ("Please Label Copy Count Can not be less than 1")
            utility.showtippy('labelcopycount', message, 'danger');
            showsnackbar('error', message)
            return false;
        } else if (utility.isInputEmpty('dateformat')) {
            $("#dateformat").addClass("is-invalid");
            var message = ("Please Add Date Format")
            utility.showtippy('dateformat', message, 'danger');
            showsnackbar('error', message)
            return false;
        }

        else {
            return true;
        }
    }

    const errorCallback = (err) => {
        utility.hideloading();
        showsnackbar("error", err.message)
    }


    const addorUpdateCustomer = async () => {
        if (checkifDataisCorrect()) {


            utility.showloading()
            var customeruid = selectedCustomerUID.length > 0 ? selectedCustomerUID : utility.randomstring() + "_" + utility.getTimestamp()

            var log = {
                log: selectedCustomerUID.length > 0 ? "Customer Updated." : "Customer Added.",
                name: utility.get_keyvalue(constants.EMPLOYEE_FULLNAME),
                username: utility.get_keyvalue(constants.EMPLOYEE_USERNAME),
                date: utility.getDateandTime(),
                timestamp: utility.getTimestamp(),
            }

            var customerObject = {
                customeruid,
                "customername": (utility.getinputValue("customername")).toUpperCase(),
                "vendorcode": (utility.getinputValue("vendorcode")).toUpperCase(),
                "vendorname": (utility.getinputValue("vendorname")).toUpperCase(),
                "customeraddress": (utility.getinputValue("customeraddress")).toUpperCase(),
                "shippinglocation": utility.getinputValue("shippinglocation"),
                "customerbarcodetemplate": utility.getinputValue("customerbarcodetemplate"),
                "zfbarcodetemplate": utility.getinputValue("zfbarcodetemplate"),
                "stringseprator": utility.getinputValue("stringseprator"),
                "dateformat": utility.getinputValue("dateformat"),
                "remark": utility.getinputValue("remark"),
                "labelcopycount": utility.getinputValueInNumbers("labelcopycount"),
                "log": arrayUnion(log),
            }

            console.log(customerObject);

            utility.showloading();

            var ref = doc(collection(db, 'CustomersDetails'), customerObject.customeruid)


            try {
                utility.hideloading()
                await setDoc(ref, customerObject, { merge: true })
                utility.success_alert('Customer ' + (selectedCustomerUID.length > 0 ? "Updated" : "Added"), 'Details Added successfully.', 'OKAY', utility.reloadPage, null);
                toggleModal()
            } catch (error) {
                var message = ("Failed To Add Customer, " + error.message)
                showsnackbar('error', message)
            }

        }
    }



    return (




        < main className='d-flex flex-column min-vh-100' >
            <Head title={"Customers"} />

            <div id="main" className="layout-navbar">
                <header>
                    <Navbar pagename={"Customers"} />
                </header>
                <div id="main-content">
                    <div className="page-content">
                        <section className="pc-container m-0 d-flex flex-column p-1">
                            <div className="pcoded-content pb-5 d-flex flex-column flex-grow-1 p-1">
                                <div className="card flex-grow-1  border p-1 mb-0">
                                    <div className="card-header p-1">

                                        <div className="d-flex flex-row justify-content-between align-center">
                                            <h5 className="my-auto ms-2 fs-6 text-dark">Customers</h5>


                                            <div className="d-flex flex-row">
                                                <div className="form-group h-auto mb-0 me-2 border border-2 rounded border-primary">

                                                    <div className="input-group">
                                                        <input
                                                            type="text"
                                                            className="mb-0 text-sm rounded form-control form-control-sm border-0 bg-input-user text-dark"
                                                            id="searchbox"
                                                            placeholder="Search Customer"
                                                        />
                                                    </div>


                                                </div>

                                                <button type="button"
                                                    onClick={(e) => addnewCustomer()} className="fs-10 rounded btn btn-sm btn-success ">Add New Customer</button>

                                            </div>

                                        </div>


                                    </div>
                                    <div className="card-body px-1 py-2">
                                        <div className='tablediv'>
                                            <table className="table  table-sm display compact nowrap table-hover table-bordered w-100" id="customerstable">
                                                <thead>
                                                    <tr>
                                                        <th className="text-xs p-1">#</th>
                                                        <th className="text-xs p-1">Customer Name</th>
                                                        <th className="text-xs p-1">Customer Barcode Template</th>
                                                        <th className="text-xs p-1">Vendor Code</th>
                                                        <th className="text-xs p-1">Vendor Name</th>
                                                        <th className="text-xs p-1">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="customerstablebody">



                                                </tbody>

                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>


            <div id="contentModal" className="modal fade" data-bs-backdrop="static" data-bs-keyboard="false" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                <div className="modal-dialog modal-dialog-scrollable modal-xl" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="contentModalTitle">Add / Modify Customer</h5>
                            <button type="button" className="btn-close" onClick={(e) => toggleModal()} aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="needs-validation">
                                <div className="row mb-3">
                                    <div className="col-md-6 d-flex flex-column">
                                        <label htmlFor="customername" className="form-label text-muted mb-1 text-sm">Customer Name</label>
                                        <input id="customername" className="mb-0 bg-input-user  text-sm rounded form-control form-control-sm masterdata fw-bold" />
                                    </div>
                                    <div className="col-md-3 d-flex flex-column">
                                        <label htmlFor="vendorcode" className="form-label text-muted mb-1 text-sm">Vendor Code</label>
                                        <input id="vendorcode" className="mb-0 bg-input-user  text-sm rounded form-control form-control-sm masterdata fw-bold" />
                                    </div>
                                    <div className="col-md-3 d-flex flex-column">
                                        <label htmlFor="vendorname" className="form-label text-muted mb-1 text-sm">Vendor Name</label>
                                        <input id="vendorname" className="mb-0 bg-input-user  text-sm rounded form-control form-control-sm masterdata fw-bold" />
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-12 d-flex flex-column  mb-3">
                                        <label htmlFor="customeraddress" className="form-label text-muted mb-1 text-sm">Customer Address</label>
                                        <input id="customeraddress" className="mb-0 bg-input-user  text-sm rounded form-control form-control-sm masterdata fw-bold" />
                                    </div>
                                    <div className="col-md-12 d-flex flex-column  mb-3">
                                        <label htmlFor="shippinglocation" className="form-label text-muted mb-1 text-sm">Shipping Location</label>
                                        <input id="shippinglocation" className="mb-0 bg-input-user  text-sm rounded form-control form-control-sm masterdata fw-bold" />
                                    </div>
                                    <div className="col-md-12 d-flex flex-column  mb-3">
                                        <label htmlFor="customerbarcodetemplate" className="form-label text-muted mb-1 text-sm">Customer Barcode Template</label>
                                        <input id="customerbarcodetemplate" className="mb-0 bg-input-user  text-sm rounded form-control form-control-sm masterdata fw-bold" />
                                        <small className="text-muted">vendorcode, vendorname, customerpartnumber, serialnumber, mfgdate, revisionnumber, partdescription</small>
                                    </div>
                                    <div className="col-md-12 d-flex flex-column  mb-3">
                                        <label htmlFor="zfbarcodetemplate" className="form-label text-muted mb-1 text-sm">ZF Barcode Template</label>
                                        <input id="zfbarcodetemplate" className="mb-0 bg-input-user  text-sm rounded form-control form-control-sm masterdata fw-bold" />
                                    </div>
                                    <div className="col-md-3 d-flex flex-column">
                                        <label htmlFor="labelcopycount" className="form-label text-muted mb-1 text-sm">Label Copies</label>
                                        <input id="labelcopycount" className="mb-0 bg-input-user  text-sm rounded form-control form-control-sm masterdata fw-bold" />
                                    </div>
                                    <div className="col-md-3 d-flex flex-column">
                                        <label htmlFor="dateformat" className="form-label text-muted mb-1 text-sm">Date Format</label>
                                        <input id="dateformat" defaultValue="DD.MM.YYYY" className="mb-0 bg-input-user  text-sm rounded form-control form-control-sm masterdata fw-bold" />
                                        <small className="text-muted">DD.MM.YYYY = 18.04.2024</small>

                                    </div>
                                    <div className="col-md-3 d-flex flex-column">
                                        <label htmlFor="stringseprator" className="form-label text-muted mb-1 text-sm">String Seprator In Customer QR</label>
                                        <input id="stringseprator" defaultValue="$" className="mb-0 bg-input-user  text-sm rounded form-control form-control-sm masterdata fw-bold" />
                                       

                                    </div>
                                    <div className="col-md-3 d-flex flex-column">
                                        <label htmlFor="remark" className="form-label text-muted mb-1 text-sm">Remark</label>
                                        <input id="remark" className="mb-0 bg-input-user  text-sm rounded form-control form-control-sm masterdata fw-bold" />
                                    </div>
                                </div>


                            </div>




                        </div>
                        <div className="modal-footer p-2">
                            <button type="button" className="btn btn-sm btn-light-secondary" onClick={(e) => toggleModal()}>Close</button>
                            <button type="button" id="saveBtn" className="btn btn-sm  btn-success" onClick={(e) => addorUpdateCustomer()} >Save changes</button>
                        </div>
                    </div>
                </div>
            </div>
        </main >


    );
}


export default Customers;

export async function getStaticProps() {
    return {
        props: { module: "CUSTOMERMASTER", onlyAdminAccess: false }
    };
}