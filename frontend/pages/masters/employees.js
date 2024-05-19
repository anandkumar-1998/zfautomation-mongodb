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
import { RequestAddorUpdateUser, RequestGetAllUsers } from '../../apis/masterAPIS'
const selectedEmployeeUID = ""
const selectedEmployeeDoc = null

const Employees = () => {

    const [plantchoices, setplantchoices] = useState(null);
    const [allEmployeeDocs, setEmployeeDocs] = useState([])
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
        if (allEmployeeDocs.length > 0) {
            allEmployeeDocs.map((employee, index) => {
                var status = `<span class="badge bg-success p-2">ACTIVE</span>`

                if (!employee.isactive) {
                    status = `<span class="badge bg-danger p-2">IN-ACTIVE</span>`
                }

                var rowitem = `<tr>
                                <td class="text-sm f-w-500">${index + 1}.</td>
                                <td class="text-sm f-w-500">${employee.username}</td>
                                <td class="text-sm f-w-500">${employee.name}</td>
                                <td class="text-sm f-w-500">${employee.phonenumber}</td>
                                <td class="text-sm f-w-500">${status}</td>
                                 <td class="align-middle">
                                <button
                                    id=${employee._id}
                                    class="btn btn-sm text-xs btn-outline-primary  w-100"
                                >
                                    EDIT
                                </button>
                                </td> </tr>`


                $("#employeestablebody").append(rowitem)
                $("#" + employee._id).on("click", function () {
                    modifyEmployee(this.id);
                });
            })



            var datatable = $("#employeestable").DataTable({
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
                    { width: "2%", targets: [0, 5] },
                    { width: "5%", targets: [1, 4] },
                    { width: "15%", targets: [3] },
                ]
            }
            );

            $("#searchbox").keyup(function () {
                datatable.search(this.value).draw();
            });
            $(".dataTables_filter").addClass('d-none')
        }

    }, [allEmployeeDocs])



    const modifyEmployee = (uid) => {
        console.log(uid);
        allEmployeeDocs.map(employee => {
            if (employee._id == uid) {
                toggleModal()
                selectedEmployeeDoc = employee;
                selectedEmployeeUID = uid

                if (plantchoices != null) {
                    plantchoices.setChoiceByValue(employee.plant)
                }
                $("#fullname").val(employee.name)
                $("#phonenumber").val(employee.phonenumber)
                $("#loginid").val(employee.username)
                utility.disableinput("loginid")
                $("#employeestatusswitch").prop('checked', employee.isactive).trigger('change');
                $("#adminstatusswitch").prop('checked', employee.isadmin).trigger('change');

                var accessModules = employee.accessmodules


                $('.modules').each(function () {
                    var $this = $(this);
                    $this.prop('checked', accessModules.includes($this.val())).trigger('change');
                });
            }
        })

    }



    useEffect(() => {


        Object.keys(fbc.MASTERMODULE.modules).map(key => {
            $("#uploadcheckboxdiv").append(` <div class="p-2 bg-light border rounded me-2 mt-2">
                                            <div class="form-check mb-0">
                                                <input class="form-check-input input-success modules me-3" value="${key}" type="checkbox" id="${key.toLowerCase()}" />
                                                <label class="form-check-label mb-0 me-3" for="${key.toLowerCase()}">
                                                    ${fbc.MASTERMODULE.modules[key].label}
                                                </label>
                                            </div>
                                        </div>`)
        })


        // addModule("Masters", fbc.TIMEOFFICE_HRREPORTS)

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


    async function getAllEmployees() {
        utility.showloading()
        var fetchAllUsers = await RequestGetAllUsers()
        if (fetchAllUsers.success) {
            console.log(fetchAllUsers.data);
            setEmployeeDocs(fetchAllUsers.data)
        } else {
            utility.hideloading()
            console.log('Unsuccessful returned error', fetchAllUsers.message);
            errorCallback({
                message: fetchAllUsers.message
            })
        }

        utility.hideloading()

    }




    async function loadData() {

        var plant = [{ value: "", label: "Select Plant", placeholder: true, disabled: true, selected: true },]
        Object.keys(fbc.PLANTCODES).map(key => {
            plant.push({ value: key, label: fbc.PLANTCODES[key] })
        })


        setplantchoices(
            new Choices($("#plantselect")[0], {
                addItems: true,
                placeholderValue: "Select Plants",
                removeItemButton: true,
                resetScrollPosition: false,
                placeholderValue: "",
                classNames: {
                    containerInner: "choices__inner bg-input-user text-dark fw-bold text-sm",
                    item: "choices__item pe-2 text-sm",
                },
                choices: plant,
            })
        );
        $("#employeestatusswitch").change(function () {
            if (this.checked) {
                $("#employeestatus_text").text("Employee Active");
            } else {
                $("#employeestatus_text").text("Employee In-Active");
            }
        });

        $("#adminstatusswitch").change(function () {

            $(".adminallowed").prop('disabled', this.checked);
            $(".adminallowed").prop('checked', this.checked).trigger('change');

            $(".reportadminallowed").prop('disabled', this.checked);
            $(".reportadminallowed").prop('checked', this.checked).trigger('change');

            if (this.checked) {
                $("#adminstatus_text").text("Admin Access Enabled");
            } else {
                $("#adminstatus_text").text("Admin Access Disabled");
            }
        });

        $(".adminallowed").change(function () {

            // console.log("value : " + this.value + " " + this.checked);
            setselectedModules((modules) => {
                // console.log("modules ", modules);
                var array = modules
                if (this.checked) {
                    if (!array.includes(this.value)) {
                        array.push(this.value);
                    }
                    return array;
                } else {
                    return (utility.removeItemAllFromArray(array, this.value))
                }
            })

            // console.log("selectedModules : " + selectedModules);
        });

        $(".modules").change(function () {

            // console.log("value : " + this.value + " " + this.checked);
            setselectedModules((modules) => {
                // console.log("modules ", modules);
                var array = modules
                if (this.checked) {
                    if (!array.includes(this.value)) {
                        array.push(this.value);
                    }
                    return array;
                } else {
                    return (utility.removeItemAllFromArray(array, this.value))
                }
            })

            // console.log("selectedModules : " + selectedModules);
        });

        $(".webportal").change(function () {
            setselectedWebportal((webportal) => {
                var array = webportal
                if (this.checked) {
                    if (!array.includes(this.value)) {
                        array.push(this.value);
                    }
                    return array;
                } else {
                    return (utility.removeItemAllFromArray(array, this.value))
                }
            })
        });





        getAllEmployees()
        setcontentModal(
            bootstrap.Modal.getOrCreateInstance($("#contentModal"), {
                keyboard: false,
            })
        );

        utility.hideloading();


    }


    function clearAll() {
        $(".form-control form-control-sm").val("")
        selectedEmployeeUID = ""
        selectedEmployeeDoc = null
        plantchoices.setChoiceByValue("")
        utility.enableinput("loginid")
        $("#employeestatusswitch").prop('checked', false).trigger('change');
        $("#adminstatusswitch").prop('checked', false).trigger('change');
        $(".adminallowed").prop('disabled', false);
        $(".adminallowed").prop('checked', false).trigger('change');
    }


    const addnewEmployee = () => {
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

        console.log(plantchoices.getValue(true));
        if (utility.isInputEmpty('fullname')) {
            $("#fullname").addClass("is-invalid");
            var message = ("Please Add Full Name")
            utility.showtippy('fullname', message, 'danger');
            showsnackbar('error', message)
            return false;
        }
        else if (utility.isInputEmpty('phonenumber')) {
            $("#phonenumber").addClass("is-invalid");
            var message = ("Please Add Phone Number")
            utility.showtippy('phonenumber', message, 'danger');
            showsnackbar('error', message)
            return false;
        } else if (utility.isInputEmpty('loginid')) {
            $("#loginid").addClass("is-invalid");
            var message = ("Please Add Login ID")
            utility.showtippy('loginid', message, 'danger');
            showsnackbar('error', message)
            return false;
        }
        else if (plantchoices.getValue(true) === "") {
            var message = ("Please Select Valid Plant")
            plantchoices.showDropdown()
            showsnackbar('error', message)
            return false;
        }
        else if (selectedModules.length === 0) {
            var message = ("Please Select At Least 01 Access")
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


    const addorUpdateEmployee = async () => {
        if (checkifDataisCorrect()) {


            var log = {
                log: "Employee Added",
                name: utility.get_keyvalue(constants.EMPLOYEE_FULLNAME),
                username: utility.get_keyvalue(constants.EMPLOYEE_USERNAME),
                date: utility.getDateandTime(),
                timestamp: utility.getTimestamp(),
            }

            var userObject = {
                "name": (utility.getinputValue("fullname")).toLowerCase(),
                "phonenumber": utility.getinputValue("phonenumber"),
                "isactive": $('#employeestatusswitch').is(':checked'),
                "isadmin": $('#adminstatusswitch').is(':checked'),
                "plant": plantchoices.getValue(true),
                "accessmodules": selectedModules,
                log,
            }

            if (selectedEmployeeUID.length == 0) {
                userObject["username"] = utility.getinputValue("loginid")
            }
            console.log(userObject);

            utility.showloading();
            var addorUpdateEmployee = await RequestAddorUpdateUser(userObject, selectedEmployeeUID.length > 0, selectedEmployeeUID)
            utility.hideloading();
            console.log(addorUpdateEmployee);
            if (addorUpdateEmployee.success) {
                utility.success_alert('Employee ' + (selectedEmployeeUID.length > 0 ? "Updated" : "Added"), 'Details Added successfully.', 'OKAY', utility.reloadPage, null);
                toggleModal()
            } else {
                var message = ("Failed To Add Employee, " + addorUpdateEmployee.message)
                showsnackbar('error', message)
            }
        }
    }



    return (



        < main className='d-flex flex-column min-vh-100' >
            <Head title={"Employee Access"} />
            <Sidebar />

            <div id="main" className="layout-navbar">
                <header>
                    <Navbar pagename={"Employee Access"} />
                </header>
                <div id="main-content">
                    <div className="page-content">
                        <section className="pc-container d-flex flex-column p-1">
                            <div className="pcoded-content  d-flex flex-column flex-grow-1 p-1">
                                <div className="card flex-grow-1  border p-1 mb-0">
                                    <div className="card-header p-1">

                                        <div className="d-flex flex-row justify-content-between align-center">
                                            <h5 className="my-auto ms-2 fs-6 text-dark">Employee Access</h5>


                                            <div className="d-flex flex-row">
                                                <div className="form-group h-auto mb-0 me-2 border border-2 rounded border-primary">

                                                    <div className="input-group">
                                                        <input
                                                            type="text"
                                                            className="mb-0 text-sm rounded form-control form-control-sm border-0 bg-input-user text-dark"
                                                            id="searchbox"
                                                            placeholder="Search Employee"
                                                        />
                                                    </div>


                                                </div>

                                                <button type="button"
                                                    onClick={(e) => addnewEmployee()} className="fs-10 rounded btn btn-sm btn-light-primary ">Add New Employee</button>

                                            </div>

                                        </div>


                                    </div>
                                    <div className="card-body px-1 py-2">
                                        <div className='tablediv'>
                                            <table className="table  table-sm display compact nowrap table-hover table-bordered w-100" id="employeestable">
                                                <thead>
                                                    <tr>
                                                        <th className="text-xs p-1">#</th>
                                                        <th className="text-xs p-1">Login ID</th>
                                                        <th className="text-xs p-1">Full Name</th>
                                                        <th className="text-xs p-1">Phone Number</th>
                                                        <th className="text-xs p-1">Status</th>
                                                        <th className="text-xs p-1">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="employeestablebody">



                                                </tbody>
                                                <tfoot>
                                                    <tr>
                                                        <th className="text-xs p-1">#</th>
                                                        <th className="text-xs p-1">Login ID</th>
                                                        <th className="text-xs p-1">Full Name</th>
                                                        <th className="text-xs p-1">Phone Number</th>
                                                        <th className="text-xs p-1">Status</th>
                                                        <th className="text-xs p-1">Action</th>
                                                    </tr>
                                                </tfoot>
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
                            <h5 className="modal-title" id="contentModalTitle">Add / Modify Employee Access</h5>
                            <button type="button" className="btn-close" onClick={(e) => toggleModal()} aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="needs-validation">
                                <div className="row mb-3">
                                    <div className="col-md-3 d-flex flex-column">
                                        <label htmlFor="fullname" className="form-label text-muted mb-1 text-sm">Full Name</label>
                                        <input id="fullname" className="mb-0 bg-input-user  text-sm rounded form-control form-control-sm masterdata fw-bold" />
                                    </div>
                                    <div className="col-md-3 d-flex flex-column">
                                        <label htmlFor="phonenumber" className="form-label text-muted mb-1 text-sm">Phone Number</label>
                                        <input id="phonenumber" className="mb-0 bg-input-user  text-sm rounded form-control form-control-sm masterdata fw-bold" />
                                    </div>
                                    <div className="col-md-3 d-flex flex-column">
                                        <label htmlFor="loginid" className="form-label text-muted mb-1 text-sm">Login Username</label>
                                        <input id="loginid" className="mb-0 bg-input-user  text-sm rounded form-control form-control-sm masterdata fw-bold" />
                                    </div>

                                </div>
                                <br />

                                <div className="row">
                                    <div className="col-md-12 position-relative">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="plantselect">Plant</label>
                                            <select id="plantselect"></select>
                                        </div>
                                    </div>

                                </div>

                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="form-check form-switch switch-lg  ps-3 d-flex flex-row bg-light rounded border shadow-md mb-3">
                                            <input type="checkbox" className="form-check-input ms-0 input-light-success my-auto" id="employeestatusswitch" />
                                            <div className="d-flex flex-column ms-3 py-0 border-start ps-3 my-2">
                                                <label className="form-check-label fs-6 mb-0" htmlFor="employeestatusswitch">Employee Status</label>
                                                <label id="employeestatus_text" className="form-check-label text-muted mb-0" htmlFor="employeestatusswitch">Employee In-Active</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-check form-switch switch-lg  ps-3 d-flex flex-row bg-light rounded border shadow-md mb-3">
                                            <input type="checkbox" className="form-check-input ms-0 input-light-success my-auto" id="adminstatusswitch" />
                                            <div className="d-flex flex-column ms-3 py-0 border-start ps-3 my-2">
                                                <label className="form-check-label fs-6 mb-0" htmlFor="adminstatusswitch">Employee is Admin?</label>
                                                <label id="adminstatus_text" className="form-check-label text-muted mb-0" htmlFor="adminstatusswitch">Admin Access Disabled</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group mt-3 mx-0 border rounded p-2 ">
                                    <label className="form-label">Access For Web Apps </label>
                                    <br />
                                    <div id="accesscheckboxdiv" className="d-flex flex-wrap flex-row">


                                    </div>
                                </div>
                                <div className="form-group mt-3 mx-0 border rounded p-2 ">
                                    <label className="form-label">Access to Masters</label>
                                    <br />
                                    <div id="uploadcheckboxdiv" className="d-flex flex-wrap flex-row">


                                    </div>
                                </div>
                                <div id="modulesdiv">



                                </div>

                            </div>




                        </div>
                        <div className="modal-footer p-2">
                            <button type="button" className="btn btn-sm btn-light-secondary" onClick={(e) => toggleModal()}>Close</button>
                            <button type="button" id="saveBtn" className="btn btn-sm  btn-success" onClick={(e) => addorUpdateEmployee()} >Save changes</button>
                        </div>
                    </div>
                </div>
            </div>
        </main >


    );
}


export default Employees;

export async function getStaticProps() {
    return {
        props: { module: "EMPLOYEEMASTER", onlyAdminAccess: false }
    };
}