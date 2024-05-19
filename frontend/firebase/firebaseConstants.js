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
export const MASTERMODULE = {
    label: "Masters",
    modules:
    {
        "EMPLOYEEMASTER": { label: "Employees", path: "../../masters/employees", },
    },
}
export const PLANTCODES = {
    "1000": "PUNE PLANT",
}