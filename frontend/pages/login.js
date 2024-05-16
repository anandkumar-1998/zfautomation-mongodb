
import { useState, useEffect, forwardRef, useRef } from 'react'
import * as utility from '../libraries/utility'
import Head from '../components/head'
import * as constants from '../constants/appconstants'
import { useSnackbar } from 'notistack'
import { collection, getDocs, limit, query, where } from 'firebase/firestore'
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth'
import { auth, db } from '../firebase/firebaseconfig'
import { RequestgetAllStorageLocations, RequestgetStorageLocationMaterials } from '../firebase/masterAPIS'
const LOGINTYPE = {
    NEW: "NEW",
    CHECK: "CHECK",
    LOGIN: "LOGIN",
}

var issignedup = false;
const Login = () => {

    const password = useRef(null)
    const loginid = useRef(null)
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()
    const [
        signin,
        signinuser,
        signinloading,
        signinerror,
    ] = useSignInWithEmailAndPassword(auth);
    const showsnackbar = (variant, message) => {
        enqueueSnackbar(message, {
            variant: variant,
            anchorOrigin: { horizontal: 'right', vertical: 'top' },
        });
    }
    const errorCallback = (err) => {
        utility.hideloading();
        showsnackbar("error", err.message)
    }
    const [userDoc, setUserDoc] = useState(null)


    useEffect(() => {
        utility.clear_allvalues()
        utility.hideloading()
    }, [])

    useEffect(() => {
        if (userDoc != null) {
            console.log(userDoc);
            signin(userDoc.username + "_emp@zfindia.com", userDoc.username + "00_emp")
        }

    }, [userDoc])



    async function getEmployeeDetails() {

        const q = query(
            collection(db, "UsersDetails"),
            where("username", "==", utility.getinputValue('loginid').toString()),
            where("password", "==", utility.getinputValue('password')),
            limit(1)
        );
        const querySnapshot = await getDocs(q);
        utility.hideloading();

        if (querySnapshot.size === 0) {
            var message = 'No User Found, Please check Username or Password';
            showsnackbar('error', message);
            return;
        } else {
            var userData = null
            querySnapshot.forEach((doc) => {
                userData = (doc.data());
            });

            if (userData != null) {
                if (userData.isactive) {
                    setUserDoc(userData);

                } else {
                    var message = 'User Account Disabled, Contact Admistrator';
                    showsnackbar('error', message);
                }
            } else {
                var message = 'No User Found, Please check Username or Password';
                showsnackbar('error', message);
            }
        }




    }
    if (signinerror) {
        password.current.value = "";
        errorCallback(signinerror)
    }
    if (signinloading) {
        utility.showloading()
        console.log("signinloading");
    }
    if (signinuser) {
        getAllStorageLocations(userDoc)
    }




    const loginUser = async () => {

        $(".form-control").removeClass("is-invalid");
        if (utility.isInputEmpty('loginid')) {
            $("#loginid").addClass("is-invalid");
            var message = ("Please Enter A Valid Login ID")
            utility.showtippy('loginid', message, 'danger');
            showsnackbar('error', message)
            return false;
        } else if (utility.isInputEmpty('password') || utility.getinputValue("password").length < 6) {
            $("#password").addClass("is-invalid");
            var message = ("Please Enter A Valid Password, Minimum 6 Characters.")
            utility.showtippy('password', message, 'danger');
            showsnackbar('error', message)
            return false;
        }
        else {
            getEmployeeDetails()
        }

    }
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            loginUser()

        }
    }

    async function loadEmployeeData(user) {
        utility.store_newvalue(constants.EMPLOYEE_ID, user.useruid)
        utility.store_newvalue(constants.EMPLOYEE_PLANT, user.plant || "1000")
        utility.store_newvalue(constants.EMPLOYEE_FULLNAME, user.name)
        utility.store_newvalue(constants.EMPLOYEE_DESIGNATION, "Employee")
        utility.store_newvalue(constants.EMPLOYEE_STORAGELOCATION, user.storagelocation)
        utility.store_newvalue(constants.EMPLOYEE_USERNAME, user.username)
        utility.store_newvalue(constants.EMPLOYEE_ALLMODULES, ["HOME", ...user.accessmodules])
        utility.store_newvalue(constants.EMPLOYEE_ISADMIN, user.isadmin)
        utility.store_newvalue(constants.EMPLOYEE_TYPE, "USER")
        window.history.replaceState(null, null, "/home");
        window.location = "/home";
        utility.hideloading()
    }


    async function getAllStorageLocations(user) {
        utility.showloading()
        // utility.updateloadingstatus("Fetching FG Materials")
        var details = await RequestgetAllStorageLocations({
            plant: "1000"
        });
        console.log(details);
        if (details.status) {
            let storageLocations = {}
            details.data.map(data => {
                storageLocations[data["LGORT"]] = data["LGOBE"]
            })
            utility.store_newvalue(constants.ALL_STORAGELOCATIONS, storageLocations)
        } else {
            var message = 'Failed To Fetch Storage Location, ' + details.message;
            showsnackbar('error', message);
            utility.store_newvalue(constants.FG_MATERIALS, [])
        }
        loadEmployeeData(user)
    }
    async function getFGMaterials(user) {
        utility.showloading()
        utility.updateloadingstatus("Fetching FG Materials")
        var details = await RequestgetStorageLocationMaterials({
            plant: "1000",
            storagelocation: user.storagelocation,
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
        getSFGMaterials(user)
    }
    async function getSFGMaterials(user) {
        utility.updateloadingstatus("Fetching SFG Materials")
        var details = await RequestgetStorageLocationMaterials({
            plant: "1000",
            storagelocation: user.storagelocation,
            materialtype: 'SFG',
        });
        utility.hideloading();
        console.log(details);
        if (details.status) {

            utility.store_newvalue(constants.SFG_MATERIALS, details.data)
        } else {
            var message = 'Failed To SFG Materials, ' + details.message;
            showsnackbar('error', message);
            utility.store_newvalue(constants.SFG_MATERIALS, [])
        }

    }

    return (

        <main className='d-flex flex-column min-vh-100'>
            <Head title={"Login"} />
            <div className="bg"></div>
            <div className="bg bg2"></div>
            <div className="bg bg3 vectorbg"></div>
            <div className="auth-wrapper ">
                <div className="auth-content">
                    <div className="card shadow-lg  rounded-3 ">
                        <div className="row align-items-center text-center">
                            <div className="col-md-12 px-1">

                                <div className="card-header py-2 px-3 p-lg-3">
                                    <div className=" d-flex flex-row align-items-center w-100 ">
                                        <img src="../assets/images/loginlogo.svg" alt="" className="img-fluid " />
                                        <div className="d-flex flex-column w-100 align-items-start ps-2 border-start ms-2">
                                            <span className="text-dark text-start fw-bolder">{constants.COMPANYNAME}</span>
                                            <span className=" text-sm fs-md-6 text-secondary">{constants.WEBAPPTITLE}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body d-flex flex-column py-2 px-3  py-lg-4">


                                    <h3 className="fs-6 mt-0 mb-2 text-start f-w-500">Sign in to continue.</h3>
                                    <h6 className="text-start mb-2  text-muted f-w-400 text-capitalize">Please Enter the credentials provided.</h6>




                                    <div className="input-group mt-2">
                                        <span className="input-group-text"><i className="ri-user-smile-fill fs-5"></i></span>
                                        <input onKeyDown={(e) => handleKeyDown(e)} type="text" ref={loginid} id="loginid" className="form-control  fs-6  mb-0" placeholder="Login ID" />
                                    </div>
                                    <div id="passworddiv" className="input-group mt-2">
                                        <span className="input-group-text"><i className="ri-lock-password-fill fs-5"></i></span>
                                        <input onKeyDown={(e) => handleKeyDown(e)} type="password" ref={password} defaultValue="" id="password" className="form-control fs-6   mb-0" placeholder="Password" />
                                    </div>



                                </div>
                                <div className="card-footer  pt-3 pb-2 px-3 p-lg-3" id="loginfooter">
                                    <button id="loginbtn" onClick={(e) => loginUser()} className="btn btn-block btn-primary mb-2 w-100">Login</button>

                                    <span className="mb-0 text-muted text-sm text-capitalize">{constants.COMPANYNAME} </span>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </main>


    );
}


export default Login;
export async function getStaticProps() {
    return {
        props: { accesstype: ["CP", "ADMIN"], onlyAdminAccess: false }
    };
}