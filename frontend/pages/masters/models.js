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
import { arrayUnion, collection, doc, getDocs, orderBy, query, setDoc, where } from 'firebase/firestore'
const selectedModelUID = ""
const selectedModelDoc = null

const Customers = ({ module }) => {
    const [customerchoices, setcustomerchoices] = useState(null);
    const [allModelDocs, setModelDocs] = useState([])
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
        if (allModelDocs.length > 0) {

            allModelDocs.map((model, index) => {
                var rowitem = `<tr>
                                <td class="text-sm f-w-500">${index + 1}.</td>
                                <td class="text-sm f-w-500">${model.modelnumber}</td>
                                <td class="text-sm f-w-500">${model.customer.name}</td>
                                <td class="text-sm f-w-500">${model.customerpartnumber}</td>
                                <td class="text-sm f-w-500">${model.partdescription}</td>
                                 <td class="align-middle">
                                <button
                                    id=${model.modeluid}
                                    class="btn btn-sm text-xs btn-outline-primary  w-100"
                                >
                                    EDIT
                                </button>
                                </td> </tr>`


                $("#modeltablebody").append(rowitem)
                $("#" + model.modeluid).on("click", function () {
                    modifyModel(this.id);
                });
            })



            var datatable = $("#modeltable").DataTable({
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
                    { width: "5%", targets: [1, 3,] },
                    // { width: "15%", targets: [4] },
                ]
            }
            );

            $("#searchbox").keyup(function () {
                datatable.search(this.value).draw();
            });
            $(".dataTables_filter").addClass('d-none')
        }



    }, [allModelDocs])

    useEffect(() => {
        if (allCustomerDocs.length > 0) {
            var customers = [{ value: "", label: "Select Customers", placeholder: true, disabled: true, selected: true },]

            allCustomerDocs.map((customer, index) => {
                customers.push({
                    value: customer.customeruid,
                    label: customer.customername,
                    customProperties: customer
                })
            })

            setcustomerchoices(
                new Choices($("#customerselect")[0], {
                    addItems: true,
                    placeholderValue: "Select Customer",
                    removeItemButton: false,
                    position: "bottom",
                    resetScrollPosition: false,
                    placeholderValue: "",
                    classNames: {
                        containerInner: "choices__inner bg-input-user text-dark fw-bold text-sm",
                        item: "choices__item pe-2 text-sm",
                    },
                    choices: customers,
                })
            );
        }
    }, [allCustomerDocs])



    const modifyModel = (uid) => {
        console.log(uid);
        allModelDocs.map(model => {
            if (model.modeluid == uid) {
                toggleModal()
                selectedModelDoc = model;
                selectedModelUID = uid


                $("#modelnumber").val(model.modelnumber)
                customerchoices.setChoiceByValue(model.customer.uid)
                $("#customerpartnumber").val(model.customerpartnumber)
                $("#partdescription").val(model.partdescription)
                $("#revisionnumber").val(model.revisionnumber)
                $("#modelperbox").val(model.modelperbox)
                $("#remark").val(model.remark)

                utility.disableinput("modelnumber")

            }
        })

    }


    useEffect(() => {

        if (customerchoices != null) {

            getAllModels()
        }

    }, [customerchoices])

    useEffect(() => {




        loadData()

    }, [])

    async function getAllModels() {
        utility.showloading()
        const q = query(
            collection(db, "ModelDetails"),
            orderBy("modelnumber", "desc")
        );
        var data = []
        const querySnapshot = await getDocs(q);
        utility.hideloading();
        console.log(querySnapshot.size);
        querySnapshot.forEach((doc) => {
            data.push(doc.data())
        });
        setModelDocs(data)
        utility.store_newvalue("counter_" + module, data.length)
        utility.hideloading()


    }

    async function getAllCustomers() {
        utility.showloading()
        const q = query(
            collection(db, "CustomersDetails"),
            orderBy("customername", "asc")
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
        customerchoices.setChoiceByValue("")
        $(".form-control form-control-sm").val("")
        selectedModelUID = ""
        selectedModelDoc = null
        utility.enableinput("modelnumber")
    }


    const addnewModel = () => {
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

        if (utility.isInputEmpty('modelnumber')) {
            $("#modelnumber").addClass("is-invalid");
            var message = ("Please Add Customer Name")
            utility.showtippy('modelnumber', message, 'danger');
            showsnackbar('error', message)
            return false;
        }
        else if (customerchoices.getValue(true).length == 0) {
            $("#customerselect").addClass("is-invalid");
            var message = ("Please Select Customer")
            utility.showtippy('customerselect', message, 'danger');
            showsnackbar('error', message)
            return false;
        } else if (utility.isInputEmpty('customerpartnumber')) {
            $("#customerpartnumber").addClass("is-invalid");
            var message = ("Please Add Vendor Code")
            utility.showtippy('customerpartnumber', message, 'danger');
            showsnackbar('error', message)
            return false;
        }

        else if (utility.isInputEmpty('grossweight')) {
            $("#grossweight").addClass("is-invalid");
            var message = ("Please Add Gross Weight")
            utility.showtippy('grossweight', message, 'danger');
            showsnackbar('error', message)
            return false;
        }
        else if (utility.getinputValueInNumbers('grossweight') < 0) {
            $("#grossweight").addClass("is-invalid");
            var message = ("Gross Weight Can not be less than 0")
            utility.showtippy('grossweight', message, 'danger');
            showsnackbar('error', message)
            return false;
        } else if (utility.isInputEmpty('modelperbox')) {
            $("#modelperbox").addClass("is-invalid");
            var message = ("Please Add Model Per Box")
            utility.showtippy('modelperbox', message, 'danger');
            showsnackbar('error', message)
            return false;
        } else if (utility.getinputValueInNumbers('modelperbox') < 1) {
            $("#modelperbox").addClass("is-invalid");
            var message = ("Model Per Box Can not be less than 1")
            utility.showtippy('modelperbox', message, 'danger');
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


            var modeluid = selectedModelUID.length > 0 ? selectedModelUID : utility.randomstring() + "_" + utility.getTimestamp()


            utility.showloading()
            const queryRef = collection(db, "ModelDetails");

            const q = query(queryRef, where("modelnumber", "==", (utility.getinputValue("modelnumber")).toUpperCase()));

            let errorMessage = ""
            let hasValid = true;
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {

                if (hasValid && selectedModelUID.length > 0 && doc.id != selectedModelUID) {
                    hasValid = false;
                    errorMessage = "Model Number Already Exists For : " + doc.data().customer.name + ", part number : " + doc.data().customerpartnumber
                }
                else if (hasValid && selectedModelUID.length == 0) {
                    hasValid = false;
                    errorMessage = "Model Number Already Exists For : " + doc.data().customer.name + ", part number : " + doc.data().customerpartnumber
                }
            });

            if (!hasValid) {
                utility.hideloading()
                utility.showtippy('modelnumber', errorMessage, 'danger');
                showsnackbar('error', errorMessage)
                return;
            }


            var log = {
                log: selectedModelUID.length > 0 ? "Model Updated." : "Model Added.",
                name: utility.get_keyvalue(constants.EMPLOYEE_FULLNAME),
                username: utility.get_keyvalue(constants.EMPLOYEE_USERNAME),
                date: utility.getDateandTime(),
                timestamp: utility.getTimestamp(),
            }

            var modelObject = {
                modeluid,
                "customerpartnumber": (utility.getinputValue("customerpartnumber")).toUpperCase(),
                "customer": {
                    uid: customerchoices.getValue().customProperties.customeruid,
                    name: customerchoices.getValue().customProperties.customername,
                },
                "partdescription": utility.getinputValue("partdescription"),
                "revisionnumber": utility.getinputValue("revisionnumber"),
                "modelperbox": utility.getinputValueInNumbers("modelperbox"),
                "remark": utility.getinputValue("remark"),
                "grossweight": utility.getinputValueInNumbers("grossweight"),
                "log": arrayUnion(log),
            }

            if (selectedModelUID.length == 0) {
                modelObject["modelnumber"] = (utility.getinputValue("modelnumber")).toUpperCase()
            }
            console.log(modelObject);

            utility.showloading();

            var ref = doc(collection(db, 'ModelDetails'), modelObject.modeluid)


            try {
                utility.hideloading()
                await setDoc(ref, modelObject, { merge: true })
                utility.success_alert('Model ' + (selectedModelUID.length > 0 ? "Updated" : "Added"), 'Details Added successfully.', 'OKAY', utility.reloadPage, null);
                toggleModal()
            } catch (error) {
                var message = ("Failed To Add Model, " + error.message)
                showsnackbar('error', message)
            }

        }
    }



    return (




        < main className='d-flex flex-column min-vh-100' >
            <Head title={"Models"} />

            <div id="main" className="layout-navbar">
                <header>
                    <Navbar pagename={"Models"} />
                </header>
                <div id="main-content">
                    <div className="page-content">
                        <section className="pc-container m-0 d-flex flex-column p-1">
                            <div className="pcoded-content pb-5 d-flex flex-column flex-grow-1 p-1">
                                <div className="card flex-grow-1  border p-1 mb-0">
                                    <div className="card-header p-1">

                                        <div className="d-flex flex-row justify-content-between align-center">
                                            <h5 className="my-auto ms-2 fs-6 text-dark">Model</h5>


                                            <div className="d-flex flex-row">
                                                <div className="form-group h-auto mb-0 me-2 border border-2 rounded border-primary">

                                                    <div className="input-group">
                                                        <input
                                                            type="text"
                                                            className="mb-0 text-sm rounded form-control form-control-sm border-0 bg-input-user text-dark"
                                                            id="searchbox"
                                                            placeholder="Search Model"
                                                        />
                                                    </div>


                                                </div>

                                                <button type="button"
                                                    onClick={(e) => addnewModel()} className="fs-10 rounded btn btn-sm btn-success ">Add New Model</button>

                                            </div>

                                        </div>


                                    </div>
                                    <div className="card-body px-1 py-2">
                                        <div className='tablediv'>
                                            <table className="table  table-sm display compact nowrap table-hover table-bordered w-100" id="modeltable">
                                                <thead>
                                                    <tr>
                                                        <th className="text-xs p-1">#</th>
                                                        <th className="text-xs p-1">Model Number</th>
                                                        <th className="text-xs p-1">Customer Name</th>
                                                        <th className="text-xs p-1">Customer Part Number</th>
                                                        <th className="text-xs p-1">Part Description</th>
                                                        <th className="text-xs p-1">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="modeltablebody">



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
                            <h5 className="modal-title" id="contentModalTitle">Add / Modify Model</h5>
                            <button type="button" className="btn-close" onClick={(e) => toggleModal()} aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="needs-validation">
                                <div className="row mb-3">
                                    <div className="col-md-12 d-flex flex-column">
                                        <label htmlFor="modelnumber" className="form-label text-muted mb-1 text-sm">Model Number</label>
                                        <input id="modelnumber" className="mb-0 bg-input-user  text-sm rounded form-control form-control-sm masterdata fw-bold" />
                                    </div>


                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-12 position-relative ">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="customerselect">Customer</label>
                                            <select id="customerselect"></select>
                                        </div>
                                    </div>
                                    <div className="col-md-12 d-flex flex-column mb-3">
                                        <label htmlFor="customerpartnumber" className="form-label text-muted mb-1 text-sm">Customers Part No.</label>
                                        <input id="customerpartnumber" className="mb-0 bg-input-user  text-sm rounded form-control form-control-sm masterdata fw-bold" />
                                    </div>
                                    <div className="col-md-12 d-flex flex-column  mb-3">
                                        <label htmlFor="partdescription" className="form-label text-muted mb-1 text-sm">Part Description</label>
                                        <input id="partdescription" className="mb-0 bg-input-user  text-sm rounded form-control form-control-sm masterdata fw-bold" />
                                    </div>
                                    <div className="col-md-12 d-flex flex-column  mb-3">
                                        <label htmlFor="revisionnumber" className="form-label text-muted mb-1 text-sm">Revision Number</label>
                                        <input id="revisionnumber" className="mb-0 bg-input-user  text-sm rounded form-control form-control-sm masterdata fw-bold" />
                                    </div>

                                    <div className="col-md-12 d-flex flex-column   mb-3">
                                        <label htmlFor="grossweight" className="form-label text-muted mb-1 text-sm">Gross Weight (KG)</label>
                                        <input id="grossweight" className="mb-0 bg-input-user  text-sm rounded form-control form-control-sm masterdata fw-bold" />
                                    </div>
                                    <div className="col-md-12 d-flex flex-column  mb-3">
                                        <label htmlFor="modelperbox" className="form-label text-muted mb-1 text-sm">Model Per Box</label>
                                        <input id="modelperbox" className="mb-0 bg-input-user  text-sm rounded form-control form-control-sm masterdata fw-bold" />
                                    </div>
                                    <div className="col-md-12 d-flex flex-column">
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
        props: { module: "MODELMASTER", onlyAdminAccess: false }
    };
}