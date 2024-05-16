
import { DB_APIURL, EMPLOYEE_TOKEN } from "../constants/appconstants";
import { get_keyvalue } from "../libraries/utility";
const axios = require("axios").default;

export const RequestLiveDate = async (isIPCheckRequired) => {
    const getLiveDate = httpsCallable(functions, 'getLiveDate');
    var data = getLiveDate({ isIPCheckRequired })
        .then((result) => {
            // console.log("DATE: " + result.data);
            return result.data;
        })
        .catch((error) => {
            console.error("ERROR : " + JSON.stringify(error));
            return data = {
                status: false,
                data: "na",
                message: error.message
            }
        })

    return data;
}

export const RequestCheckUser = async (username) => {
    return await axios.get(DB_APIURL + "checkuser", {
        params: {
            username
        },
    })
        .then(function (response) {
            return {
                success: true,
                data: response.data,
                message: ""
            }
        })
        .catch(function (error) {
            return {
                success: false,
                data: {},
                message: error.response.data.message
            }
        })

}
export const RequestForgotPassword = async (username) => {
    return await axios.post(DB_APIURL + "password/forgot", {
        params: {
            username
        },
    })
        .then(function (response) {
            return {
                success: true,
                data: {},
                message: ""
            }
        })
        .catch(function (error) {
            return {
                success: false,
                data: {},
                message: error.response.data.message
            }
        })

}
export const RequestLogoutUser = async () => {
    return await axios.get(DB_APIURL + "logout", {
        headers: { Authorization: `Bearer ${get_keyvalue(EMPLOYEE_TOKEN)}` },
    })
        .then(function (response) {
            return {
                success: true,
                data: {},
                message: ""
            }
        })
        .catch(function (error) {
            return {
                success: false,
                data: {},
                message: error?.response?.data?.message || ""
            }
        })

}
export const RequestLoginUser = async (username, password) => {
    return await axios.post(DB_APIURL + "login", {
        username,
        password
    })
        .then(function (response) {
            return {
                success: true,
                data: response.data,
                message: ""
            }
        })
        .catch(function (error) {
            return {
                success: false,
                data: {},
                message: error.response.data.message
            }
        })

}

export const RequestSignupUser = async (username, password) => {
    return await axios.post(DB_APIURL + "signupuser", {
        username,
        password
    })
        .then(function (response) {
            return {
                success: true,
                data: response.data,
                message: ""
            }
        })
        .catch(function (error) {
            return {
                success: false,
                data: {},
                message: error.response.data.message
            }
        })

}
export const RequestGetAllUsers = async () => {
    return await axios
        .get(DB_APIURL + "admin/users", { headers: { "Authorization": `Bearer ${get_keyvalue(EMPLOYEE_TOKEN)}` } })
        // .get(DB_APIURL + "admin/users")
        .then(function (response) {
            console.log(response);
            return {
                success: true,
                data: response.data.users,
                message: ""
            }
        })
        .catch(function (error) {
            console.log(error);
            return {
                success: false,
                data: {},
                message: error.response.data.message
            }
        })

}

export const RequestAddorUpdateUser = async (user, isUpdate = false, selectedUserID = "") => {

    var method = "POST"
    var url = DB_APIURL + 'addUser'
    if (isUpdate) {
        console.log("USER UPDATE");
        method = "PATCH"
        url = DB_APIURL + 'updateuser/' + selectedUserID

    }

    return await axios({
        method, url, data: user,
        headers: { "Authorization": `Bearer ${get_keyvalue(EMPLOYEE_TOKEN)}` }
    })
        .then(function (response) {
            console.log(response);
            return {
                success: true,
                data: {},
                message: ""
            }
        })
        .catch(function (error) {
            console.log(error.response);
            return {
                success: false,
                data: {},
                message: error.response.data.message
            }
        });


}