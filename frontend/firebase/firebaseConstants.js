'use client'
import * as utility from '../libraries/utility'
import * as constants from '../constants/appconstants'


export const getAddedandModifiedDetails = (keyname) => {

    var addedmodifiedobject = {
        [keyname + "_addedbyuseruid"]: utility.get_keyvalue(constants.EMPLOYEE_ID),
        [keyname + "_addedtimestamp"]: utility.getTimestamp(),
        [keyname + "_addeddate"]: utility.getDate(),
        [keyname + "_addedbyuserfullname"]: utility.get_keyvalue(constants.EMPLOYEE_FULLNAME),
        [keyname + "_modifiedbyuseruid"]: utility.get_keyvalue(constants.EMPLOYEE_ID),
        [keyname + "_modifiedtimestamp"]: utility.getTimestamp(),
        [keyname + "_modifieddate"]: utility.getDateandTime(),
        [keyname + "_modifiedbyuserfullname"]: utility.get_keyvalue(constants.EMPLOYEE_FULLNAME),
    };

    return addedmodifiedobject;
}

export const getAddedDetails = (keyname) => {

    var addedobject = {
        [keyname + "_addedtimestamp"]: utility.getTimestamp(),
        [keyname + "_addeddate"]: utility.getDate(),
        [keyname + "_addedbyuserfullname"]: utility.get_keyvalue(constants.EMPLOYEE_FULLNAME),
        [keyname + "_addedbyuseruid"]: utility.get_keyvalue(constants.EMPLOYEE_ID),
    };

    return addedobject;
}
export const getModifiedDetails = (keyname) => {

    var modifiedobject = {
        [keyname + "_modifiedbyuseruid"]: utility.get_keyvalue(constants.EMPLOYEE_ID),
        [keyname + "_modifiedtimestamp"]: utility.getTimestamp(),
        [keyname + "_modifieddate"]: utility.getDate(),
        [keyname + "_modifiedbyuserfullname"]: utility.get_keyvalue(constants.EMPLOYEE_FULLNAME),
    };


    return modifiedobject;
}
export function getSelectedModule() {

    var selectedmodule = utility.get_keyvalue(constants.EMPLOYEE_SELECTEDWEBPORTAL) != "nothingfound" ? utility.get_keyvalue(constants.EMPLOYEE_SELECTEDWEBPORTAL) : "TIMEOFFICE"

    return selectedmodule;
}

export const GROUP_COLLECTION = "ModuleGroups";
export const GROUP_KEY = "group";
export const GROUPDETAILS_UID = "group_uid";
export const GROUPDETAILS_NAME = "group_name"
export const GROUPDETAILS_CODE = "group_code"
export const GROUPDETAILS_MODULES = "group_modules"
export const GROUPDETAILS_EMPLOYEEUIDARRAY = "group_employeeuidarray"


// --------------- EMPLOYEE START---------------------------- EMPLOYEE START---------------------------- EMPLOYEE START------------------


export const EMPLOYEE_SANCTIONAUTHORITYTYPE = {
    INDIVIDUAL: "INDIVIDUAL",
    CELLWISE: "CELLWISE",
    DEPARTMENTWISE: "DEPARTMENTWISE",
};
export const EMPLOYEEMASTER_COLLECTION = "EmployeeMasterDetails";
export const EMPLOYEE_COLLECTION = "EmployeeDetails";
export const EMPLOYEE_KEY = "employee";
export const EMPLOYEEDETAILS_UID = "employee_uid";
export const EMPLOYEEDETAILS_NAME = "employee_name";
export const EMPLOYEEDETAILS_PHONENUMBER = "employee_phonenumber";
export const EMPLOYEEDETAILS_EMAILADDRESS = "employee_emailaddress";
export const EMPLOYEEDETAILS_MODULES = "employee_modules";
export const EMPLOYEEDETAILS_REPORTMODULES = "employee_reportmodules";
export const EMPLOYEEDETAILS_ISADMIN = "employee_isadmin";
export const EMPLOYEEDETAILS_TICKETID = "employee_ticketid";
export const EMPLOYEEDETAILS_WEBPORTALS = "employee_webportals";
export const EMPLOYEEDETAILS_DEPT = "employee_dept";
export const EMPLOYEEDETAILS_CELL = "employee_cell";
export const EMPLOYEEDETAILS_PLANT = "employee_plant";
export const EMPLOYEEDETAILS_STATUS = "employee_status";
export const EMPLOYEEDETAILS_PASSWORD = "employee_password";
export const EMPLOYEEDETAILS_ISSIGNEDUP = "employee_issignedup";
export const EMPLOYEEDETAILS_SESSIONDETAILS = "employee_sessiondetails";

// --------------- EMPLOYEE END---------------------------- EMPLOYEE END---------------------------- EMPLOYEE END------------------


// ------------ CONSULTANTS ----------------------------------------------------------------




export const CONSULTANT_SANCTIONAUTHORITYTYPE = {
    INDIVIDUAL: "INDIVIDUAL",
    CELLWISE: "CELLWISE",
    DEPARTMENTWISE: "DEPARTMENTWISE",
};
export const CONSULTANT_COLLECTION = "ConsultantDetails";
export const CONSULTANT_KEY = "consultant";
export const CONSULTANT_UID = "consultant_uid";
export const CONSULTANT_NAME = "consultant_name";
export const CONSULTANT_PHONENUMBER = "consultant_phonenumber";
export const CONSULTANT_CONTRACTUPTO = "consultant_contractupto";
export const CONSULTANT_SALARY = "consultant_salary";
export const CONSULTANT_EMAILADDRESS = "consultant_emailaddress";
export const CONSULTANT_PERSONALEMAILADDRESS = "consultant_personalemailaddress";
export const CONSULTANT_MODULES = "consultant_modules";
export const CONSULTANT_REPORTMODULES = "consultant_reportmodules";
export const CONSULTANT_ISADMIN = "consultant_isadmin";
export const CONSULTANT_TICKETNUMBER = "consultant_ticketnumber";
export const CONSULTANT_WEBPORTALS = "consultant_webportals";
export const CONSULTANT_DEPT = "consultant_dept";
export const CONSULTANT_DEFAULTSHIFT = "consultant_defaultshift";
export const CONSULTANT_SANCTIONAUTHORITY = "consultant_sanctionauthority";
export const CONSULTANT_WEEKLYOFF = "consultant_weeklyoff";
export const CONSULTANT_CELL = "consultant_cell";
export const CONSULTANT_PLANT = "consultant_plant";
export const CONSULTANT_STATUS = "consultant_status";
export const CONSULTANT_PASSWORD = "consultant_password";
export const CONSULTANT_ISSIGNEDUP = "consultant_issignedup";
export const CONSULTANT_SESSIONDETAILS = "consultant_sessiondetails";




// --------------- OEM START---------------------------- OEM START---------------------------- EMPLOYEE START------------------

export const OEM_COLLECTION = "OEMDetails";
export const OEM_KEY = "oem";
export const OEM_UID = "oem_uid";
export const OEM_NAME = "oem_name";
export const OEM_CODE = "oem_code";
export const OEM_PAYMENTTERMS = "oem_paymentterms";
export const OEM_TRANSITPERIOD = "oem_transitperiod";
export const OEM_VENDORCODEOFZF = "oem_vendorcodeofzf";
export const OEM_STATUS = "oem_status";
export const OEM_HASGODOWN = "oem_hasgodown";
export const OEM_EMAILADDRESSARRAY = "oem_emailaddressarray";
export const OEM_ZFEMAILADDRESSARRAY = "oem_zfemailaddressarray";
export const OEM_ZFENGGDETAILS = "oem_zfenggdetails";
export const OEM_BUYERDETAILS = "oem_buyerdetails";
export const OEM_ACCOUNTSDETAILS = "oem_accountsdetails";



// --------------- Uploads START---------------------------- OEM START---------------------------- EMPLOYEE START------------------

export const UPLOADS_COLLECTION = "UploadDetails";
export const OEMDISPATCHUPLOADSTATUSTYPE = {
    REQUESTED: "REQUESTED",
    INITIATED: "INITIATED",
    COMPLETED: "COMPLETED"
}
export const SPDDISPATCHUPLOADSTATUSTYPE = {
    REQUESTED: "REQUESTED",
    INITIATED: "INITIATED",
    COMPLETED: "COMPLETED"
}
export const INVOICES_COLLECTION = "Invoices";
export const INVOICESTATUSTYPE = {
    GENERATED: "GENERATED",  // invoice created     
    TRANSIT: "TRANSIT",     // in transit uplaoded by dispatch not yet updated by engg
    GODOWN: "GODOWN",       // reached godown no grn done
    GRN: "GRN",             //  grn done
    TOBEDUE: "TOBEDUE",     // under credit period / payment terms
    OVERDUE: "OVERDUE",             // overdue in outstanding report and is grn done
    CLEARED: "CLEARED",         // removed from outstanding report
    CANCELLED: "CANCELLED",         // cancelled donot show anywhere
}
export const OUTSTANDINGUPLOADSTATUSTYPE = {
    REQUESTED: "REQUESTED",
    INITIATED: "INITIATED",
    COMPLETED: "COMPLETED"
}
export const GSTUPLOADSTATUSTYPE = {
    REQUESTED: "REQUESTED",
    INITIATED: "INITIATED",
    COMPLETED: "COMPLETED"
}
export const SPDPENDINGSOUPLOADSTATUSTYPE = {
    REQUESTED: "REQUESTED",
    INITIATED: "INITIATED",
    COMPLETED: "COMPLETED"
}
export const SPDTARGETUPLOADSTATUSTYPE = {
    REQUESTED: "REQUESTED",
    INITIATED: "INITIATED",
    COMPLETED: "COMPLETED"
}
export const ATTENDNACELOGSUPLOADSTATUSTYPE = {
    REQUESTED: "REQUESTED",
    INITIATED: "INITIATED",
    COMPLETED: "COMPLETED"
}
export const GRNSTATUSTYPE = {
    PENDING: "PENDING",
    COMPLETED: "COMPLETED"
}
export const CREDITNOTEUPLOADSTATUSTYPE = {
    REQUESTED: "REQUESTED",
    INITIATED: "INITIATED",
    COMPLETED: "COMPLETED"
}
export const SALESDETAILSUPLOADSTATUSTYPE = {
    REQUESTED: "REQUESTED",
    INITIATED: "INITIATED",
    COMPLETED: "COMPLETED"
}
// --------------- OEM START---------------------------- OEM START---------------------------- EMPLOYEE START------------------
export const SPDTYPE = {
    "12": "DEALER",
    "13": "DISTRIBUTOR",
    "11": "OEM SPARE PART",
    "14": "PUBLIC SECTOR",
    "10": "EXPORT",
    "15": "DEEMED EXPORTER",
}
export const SPD_COLLECTION = "SPDDetails";
export const SPD_KEY = "spd";
export const SPD_UID = "spd_uid";
export const SPD_NAME = "spd_name";
export const SPD_CODE = "spd_code";
export const SPD_CONTACTPERSONNAMEARRAY = "spd_contactpersonnamearray";
export const SPD_PAYMENTTERMS = "spd_paymentterms";
export const SPD_TYPE = "spd_type";
export const SPD_STATUS = "spd_status";
export const SPD_HASGODOWN = "spd_hasgodown";
export const SPD_EMAILADDRESSARRAY = "spd_emailaddressarray";
export const SPD_ZFEMAILADDRESSARRAY = "spd_zfemailaddressarray";
export const SPD_ZFENGGDETAILS = "spd_zfenggdetails";
export const SPD_CONTACTNUMBERARRAY = "spd_contactnumberarray";



export const SALARY_COLLECTION = "SalaryDetails";

export const RESIGNATIONS_COLLECTION = "ResignationDetails"
export const RESIGNATIONSTATUSTYPE = {
    "APPLIED": "APPLIED",
    "ACCEPTED": "ACCEPTED",
    "WITHDRAWN": "WITHDRAWN",
    "CANCELLED": "CANCELLED",
    "REJECTED": "REJECTED",
    "LEFT": "LEFT",
}

export const CONTRACTOR_COLLECTION = "ContractorDetails";
export const CONTRACTOREMPLOYEE_COLLECTION = "ContractEmployeeDetails";
export const CONTRACTOREMPLOYEE_SANCTIONAUTHORITY = "employee_sanctionauthority";
export const CONTRACTOREMPLOYEE_LOGS = "employee_logs";

export const CONTRACTOR_NAME = "contractor_name";
export const CONTRACTOR_CODE = "contractor_code";
export const CONTRACTOR_RANGE = "contractor_range";
export const CONTRACTOR_PLANT = "contractor_plant";
export const CONTRACTOR_STATUS = "contractor_status";
export const CONTRACTOR_LEAVESAPPLICABLE = "contractor_leavesapplicable";
export const CONTRACTOR_UID = "contractor_uid";
export const CONTRACTOR_EMPLOYEEUIDARRAY = "contractor_employeeuidarray";


export const PD_COLLECTION = "PunchingDevicesDetails";
export const PD_KEY = "pd";
export const PD_UID = "pd_uid";
export const PD_NAME = "pd_name";
export const PD_SERIALNUMBER = "pd_serialnumber";
export const PD_PLANT = "pd_plant";
export const PD_STATUS = "pd_status";
export const PD_TYPE = "pd_type";
export const PD_LOG = "pd_log";


export const DEPT_COLLECTION = "DepartmentMasterDetails";
export const DEPT_KEY = "dept";
export const DEPT_CODE = "dept_code";
export const DEPT_UID = "dept_uid";
export const DEPT_NAME = "dept_name";
export const DEPT_ISROTATIONAL = "dept_isrotational";
export const DEPT_PLANTS = "dept_plants";
export const DEPT_SANCTIONAUTHORITY = "dept_sanctionauthority";
export const DEPT_CELLCODESARRAY = "dept_cellcodesarray";
export const DEPT_CELLDETAILS = "dept_celldetails";
export const DEPT_STATUS = "dept_status";
export const DEPT_TYPE = "dept_type";
export const DEPT_LOGS = "dept_logs";

export const SHIFT_COLLECTION = "ShiftDetails";
export const SHIFT_PLANT = "shift_plant";
export const SHIFT_DEPT = "shift_dept";
export const SHIFT_SHIFT1EMPLOYEEARRAY = "shift_shift1employeearray";
export const SHIFT_SHIFT2EMPLOYEEARRAY = "shift_shift2employeearray";
export const SHIFT_SHIFT3EMPLOYEEARRAY = "shift_shift3employeearray";
export const SHIFT_LOG = "shift_log";

export const LEAVEBALANCE_COLLECTION = "LeaveBalances"
export const LEAVEBALANCE_UID = "leavebalance_uid"
export const LEAVEBALANCE_CREDITLOGS = "leavebalance_creditlogs"
export const LEAVEBALANCE_BALANCES = "leavebalance_balances"
export const LEAVEBALANCE_POSTED = "leavebalance_posted"
export const LEAVEBALANCE_LEAVEDATES = "leavebalance_leavedates"
export const LEAVEBALANCE_APPLIEDLEAVEDATES = "leavebalance_appliedleavedates"
export const LEAVEBALANCE_LEAVEUIDS = "leavebalance_leaveuids"
export const LEAVEBALANCE_CONSUMPTION = "leavebalance_consumption"

export const COFFSTATUS = {
    "GENERATED": "GENERATED", //* Step 1 - Generated via Attendnace
    "REQUESTED": "REQUESTED", //* Step 2 - Confirmed By HR
    "AVAILABLE": "AVAILABLE", //* Step 3 - Confirmed By Sanc. Auth, Available to Use
    "REJECTED": "REJECTED",   //* Step 3 - Rejected By Sanc. Auth
    "CONSUMED": "CONSUMED",    //* Step 4 - Used By Employee
}

export const LEAVEAPPLICATIONSTATUS = {
    "REQUESTED": "REQUESTED",
    "SANCTIONED": "SANCTIONED",
    "ELAPSED": "ELAPSED",
    "REJECTED": "REJECTED",
    "CANCELLED": "CANCELLED",
}

export const LEAVERECREDITSTATUS = {
    "PENDING": "PENDING",
    "APPROVED": "APPROVED",
    "REJECTED": "REJECTED",
}

export const LEAVEAPPL_COLLECTION = "LeaveApplications"
export const LEAVEAPPL_UID = "leaveappl_uid"
export const LEAVEAPPL_EMPLOYEE = "leaveappl_employee"
export const LEAVEAPPL_ISLOCKED = "leaveappl_islocked"
export const LEAVEAPPL_LEAVEDETAILS = "leaveappl_leavedetails"
export const LEAVEAPPL_STATUS = "leaveappl_status"
export const LEAVEAPPL_LOGS = "leaveappl_logs"
export const LEAVEAPPL_REQUESTEDDATE = "leaveappl_requesteddate"
export const LEAVEAPPL_REQUESTEDTIMESTAMP = "leaveappl_requestedtimestamp"
export const LEAVEAPPL_SANCTIONEDDATE = "leaveappl_sanctioneddate"
export const LEAVEAPPL_SANCTIONEDTIMESTAMP = "leaveappl_sanctionedtimestamp"


export const MISSPUNCHSTATUS = {
    "REQUESTED": "REQUESTED",
    "SANCTIONED": "SANCTIONED",
    "ELAPSED": "ELAPSED",
    "REJECTED": "REJECTED",
    "CANCELLED": "CANCELLED",
}
export const MISSPUNCH_COLLECTION = "MissPunchApplications"
export const MISSPUNCH_UID = "misspunch_uid"
export const MISSPUNCH_EMPLOYEE = "misspunch_employee"
export const MISSPUNCH_ISLOCKED = "misspunch_islocked"
export const MISSPUNCH_MISSEDTYPE = "misspunch_missedtype"
export const MISSPUNCH_SHIFTDATEMONTHYEAR = "misspunch_shiftdatemonthyear"
export const MISSPUNCH_SHIFTDATE = "misspunch_shiftdate"
export const MISSPUNCH_SHIFTTIMESTAMP = "misspunch_shifttimestamp"
export const MISSPUNCH_STATUS = "misspunch_status"
export const MISSPUNCH_APPLIED = "misspunch_applied"
export const MISSPUNCH_APPLIEDREMARK = "misspunch_appliedremark"
export const MISSPUNCH_LOGS = "misspunch_logs"
export const MISSPUNCH_MISSDATETIME = "misspunch_missdatetime"
export const MISSPUNCH_MISSTIME = "misspunch_misstime"
export const MISSPUNCH_MISSTIMESTAMP = "misspunch_misstimestamp"
export const MISSPUNCH_REQUESTEDDATE = "misspunch_requesteddate"
export const MISSPUNCH_REQUESTEDTIMESTAMP = "misspunch_requestedtimestamp"
export const MISSPUNCH_ELAPSEDDATE = "misspunch_elapseddate"
export const MISSPUNCH_ELAPSEDTIMESTAMP = "misspunch_elapsedtimestamp"
export const MISSPUNCH_SANCTIONEDDATE = "misspunch_sanctioneddate"
export const MISSPUNCH_SANCTIONEDTIMESTAMP = "misspunch_sanctionedtimestamp"


export const HOLIDAY_COLLECTION = "HolidayDetails"
export const HOLIDAY_UID = "holiday_uid"
export const HOLIDAY_DATE = "holiday_date"
export const HOLIDAY_TIMESTAMP = "holiday_timestamp"
export const HOLIDAY_MONTH = "holiday_month"
export const HOLIDAY_YEAR = "holiday_year"
export const HOLIDAY_PLANTS = "holiday_plants"
export const HOLIDAY_PLANT = "holiday_plant"
export const HOLIDAY_ISHOURLY = "holiday_ishourly"
export const HOLIDAY_HOURLYTYPE = "holiday_hourlytype"
export const HOLIDAY_HOURS = "holiday_hours"
export const HOLIDAY_ADJUSTEDAGAINSTLEAVE = "holiday_adjustedagainstleave"
export const HOLIDAY_ADJUSTEDAGAINSTWOFF = "holiday_adjustedagainstwoff"
export const HOLIDAY_ADJUSTEDAGAINSTWOFFDATE = "holiday_adjustedagainstwoffdate"
export const HOLIDAY_DESCRIPTION = "holiday_description"
export const HOLIDAY_LOGS = "holiday_logs"
export const HOLIDAY_ASSIGNED = "holiday_assigned"

export const WOFFADJST_COLLECTION = "WeeklyOffAdjustmentDetails"
export const WOFFADJST_UID = "woffadjst_uid"
export const WOFFADJST_DATE = "woffadjst_date"
export const WOFFADJST_TIMESTAMP = "woffadjst_timestamp"
export const WOFFADJST_MONTH = "woffadjst_month"
export const WOFFADJST_YEAR = "woffadjst_year"
export const WOFFADJST_PLANTS = "woffadjst_plants"
export const WOFFADJST_PLANT = "woffadjst_plant"
export const WOFFADJST_ADJUSTEDDATE = "woffadjst_adjusteddate"
export const WOFFADJST_ADJUSTEDDESCRIPTION = "woffadjst_adjusteddescription"
export const WOFFADJST_LOGS = "woffadjst_logs"


export const SHIFTALLOCATION_COLLECTION = "ShiftAllocationDetails"
export const SHIFTALLOCATION_UID = "sa_uid"
export const SHIFTALLOCATION_DEPT = "sa_dept"
export const SHIFTALLOCATION_CELL = "sa_cell"
export const SHIFTALLOCATION_EMPLOYEES = "sa_employees"
export const SHIFTALLOCATION_LOGS = "sa_logs"



export const QLCSTATUS = {
    "PENDING": "PENDING",
    "CREDITTED": "CREDITTED",
    "REVERSED": "REVERSED",
}
export const QUARTERLYLEAVECREDITS_COLLECTION = "QuarterlyLeaveCreditsDetails"
export const QUARTERLYLEAVECREDITS_UID = "qlc_uid"
export const QUARTERLYLEAVECREDITS_EMPLOYEE = "qlc_employee"
export const QUARTERLYLEAVECREDITS_QUARTER = "qlc_quarter"
export const QUARTERLYLEAVECREDITS_YEAR = "qlc_year"
export const QUARTERLYLEAVECREDITS_ATTENDANCE = "qlc_attendance"
export const QUARTERLYLEAVECREDITS_PRESENTDAYS = "qlc_presentdays"
export const QUARTERLYLEAVECREDITS_MINDAYS = "qlc_mindays"
export const QUARTERLYLEAVECREDITS_CREDITS = "qlc_credits"
export const QUARTERLYLEAVECREDITS_LOGS = "qlc_logs"
export const QUARTERLYLEAVECREDITS_STATUS = "qlc_status"

export const YEARLYQUARTER = {
    "1Q": ["01", "02", "03"],
    "2Q": ["04", "05", "06"],
    "3Q": ["07", "08", "09"],
    // "3Q": ["08"],
    "4Q": ["10", "11", "12"],
};
export const RESIGNATIONREASONS = {
    "1": "Better Prospects and Growth",
    "2": "Salary Package Insufficient",
    "3": "No Co-Opertaion From Collegues",
    "4": "No Co-Opertaion From Boss",
    "5": "Personal Reason",
}

export const FAMILYHOLDINGSCLIENTCODE = {
    "GROUP1": [
        "IN30112715730454",
        "IN30133020581014",
        "1201130001341339",
        "IN30133019783229",
        "1201130001295097",
        "IN30133020547794",
        "1201130001295090",
        "1201130001341330",
    ],

    "GROUP2": [
        "IN30133021164290",
        "IN30133020571043",
        "IN30133020571050",
    ],
    "GROUP3": [
        "1201130000671550",
        "IN30002010976633",
        "1201130001002700",
        "IN30002010976684",
        "IN30002010976658",
        "1201130000742229",
        "IN30002011119102",
        "IN30002011123827",
        "1201130000679102",
        "1201130000742220"
    ],
    "GROUP4": [
        "1201130000513690",
        "1201130000514370",
        "1201130000513710",
        "1201130000649670",
        "1201130000522890",
    ],
}

export const MODULES = {
    modules:
    {
        "STOCKISSUE": { label: "Stock Issue", counterrequired: true, path: "../../stockissue", },
        "STOCKRECEIVE": { label: "Stock Receive", counterrequired: true, path: "../../stockreceive", },
        "STOCKTRANSFER": { label: "Stock Transfer", counterrequired: true, path: "../../stocktransfer-v2", },
        "PRODUCTIONCONFIRMATION": { label: "Prod. Confirmation (SFG)", counterrequired: true, path: "../../production-confirmation", },
        "MANUALPRODUCTIONCONFIRMATION": { label: "Prod. Confirmation (FG)", counterrequired: true, path: "../../manual-confirmation", },
        "SCANNINGPRODUCTIONCONFIRMATION": { label: "Scan Confirmation (FG)", counterrequired: true, path: "../../scanning-confirmation", },
        "STOCKREPORT": { label: "Stock Report", counterrequired: false, path: "../../stockreport", },
        "BOMREPORT": { label: "BOM Report", counterrequired: false, path: "../../bomreport", },
        "PARTLABELPRINT": { label: "Part Label", counterrequired: false, path: "../../part-label-print", },
        "PACKINGLABELPRINT": { label: "Packing Label", counterrequired: false, path: "../../packing-label-print", },
        "USERMASTER": { label: "Users", counterrequired: true, path: "../../masters/users", },
        "CUSTOMERMASTER": { label: "Customers", counterrequired: true, path: "../../masters/customers", },
        "MODELMASTER": { label: "Models", counterrequired: true, path: "../../masters/models", },
    },
}


// export const STORAGELOCATION = {
//     "1010": "MAIN STORE",
//     "1085": "NON MOVING ITEMS",
//     "2190": "POW MO33-8033 HS",
//     "2250": "POW ASSEM",
//     "2290": "POW 8043 HSG",
//     "2310": "POW 8046 HSG",
//     "3020": "DISPATCH LOCATIO",
//     "4010": "READY TO DISPATCH",
//     "4030": "UNBOND KIT ASSY",
// }
export const STORAGELOCATION = utility.get_keyvalue(constants.ALL_STORAGELOCATIONS)

export const PLANTS = {
    "1000": "PUNE PLANT",
    "2000": "INDORE PLANT",
   
}
