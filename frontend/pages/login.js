
import { useState, useEffect, forwardRef, useRef } from 'react'
import * as utility from '../libraries/utility'
import Head from '../components/head'
import * as constants from '../constants/appconstants'
import { useSnackbar } from 'notistack'
import { RequestCheckUser, RequestForgotPassword, RequestLoginUser, RequestSignupUser } from '../apis/masterAPIS'
const LOGINTYPE = {
    NEW: "NEW",
    CHECK: "CHECK",
    LOGIN: "LOGIN",
}

var issignedup = false;
const Login = () => {

    const renterpassword = useRef(null)
    const password = useRef(null)
    const loginid = useRef(null)
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

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
    const [userWebPortals, setuserWebPortals] = useState([])
    const [selectedWebPortal, setselectedWebPortal] = useState(null)
    const [loginDetails, setloginDetails] = useState({
        type: LOGINTYPE.CHECK,
        name: "",
        username: "",
    })

    useEffect(() => {
        utility.clear_allvalues()
        utility.hideloading()
    }, [])

    useEffect(() => {
        switch (loginDetails.type) {

            case LOGINTYPE.CHECK:
                loginid.current.value = "";
                loginid.current.focus();
                break;
            case LOGINTYPE.NEW:

                password.current.value = "";
                password.current.focus();
                break;

            case LOGINTYPE.LOGIN:
                password.current.value = "";
                password.current.focus();
                break;
            default:
                break; null;
        }


    }, [loginDetails])
    const handleKeyDown = (event, id) => {
        if (event.key === 'Enter') {
            switch (id) {
                case 'loginid':
                    checkUser()
                    break;
                case 'password':
                    if (loginDetails.type === LOGINTYPE.LOGIN) {
                        loginUser()
                    }
                    break;
                case 'renterpassword':
                    if (loginDetails.type === LOGINTYPE.NEW) {
                        signUpUser()
                    }
                    break;

                default:
                    break;
            }


        }
    }



    const checkUser = () => {

        $(".form-control").removeClass("is-invalid");
        if (utility.isInputEmpty('loginid')) {
            $("#loginid").addClass("is-invalid");
            var message = ("Please Enter Login ID.")
            utility.showtippy('loginid', message, 'danger');
            showsnackbar('error', message)
            return false;
        } else {
            utility.showloading()
            getEmployeeDetails()
        }

    }




    async function getEmployeeDetails() {
        var fetchCheckUser = await RequestCheckUser(utility.getinputAllinLowercase('loginid'))

        if (fetchCheckUser.success) {
            console.log(fetchCheckUser.data);
            processEmployeeData(fetchCheckUser.data)
        } else {
            utility.hideloading()
            console.log('Unsuccessful returned error', fetchCheckUser.message);
            errorCallback({
                message: fetchCheckUser.message
            })
        }


    }


    async function processEmployeeData(data) {
        if (data.isactive) {
            utility.hideloading()
            if (data.issignedup) {
                setloginDetails({
                    type: LOGINTYPE.LOGIN,
                    name: data.name,
                    username: data.username,
                })
            } else {
                setloginDetails({
                    type: LOGINTYPE.NEW,
                    name: data.name,
                    username: data.username,
                })
            }
        } else {
            utility.hideloading()
            errorCallback({ message: "Account Blocked, Please contact administrator." })
        }
    }






    const loginUser = async () => {

        $(".form-control").removeClass("is-invalid");
        if (utility.isInputEmpty('password') || utility.getinputValue("password").length < 6) {
            $("#password").addClass("is-invalid");
            var message = ("Please Enter A Valid Password, Minimum 6 Characters.")
            utility.showtippy('password', message, 'danger');
            showsnackbar('error', message)
            return false;
        }
        else {

            utility.showloading()
            var fetchLoginUser = await RequestLoginUser(loginDetails.username, utility.getinputValue("password"))

            if (fetchLoginUser.success) {

                var user = fetchLoginUser.data.user;
                var token = fetchLoginUser.data.token;
                loadEmployeeData(user, token);

            } else {
                utility.hideloading()
                console.log('Unsuccessful returned error', fetchLoginUser.message);
                errorCallback({
                    message: fetchLoginUser.message
                })
            }

        }

    }




    const forgotPassword = async () => {

        $(".form-control").removeClass("is-invalid");
        if (userDoc == null) {
            var message = ("Please Enter Login ID.")
            showsnackbar('error', message)
            return;
        }
        utility.showloading()


        var fetchRequestForgotPassword = await RequestForgotPassword(loginDetails.username)

        if (fetchRequestForgotPassword.success) {
            utility.hideloading()
            utility.success_alert("Password Reset Requested", 'Contact Adminstrator For New Password.', 'OKAY', utility.reloadPage, null);

        } else {
            utility.hideloading()
            console.log('Unsuccessful returned error', fetchRequestForgotPassword.message);
            errorCallback({
                message: fetchRequestForgotPassword.message
            })
        }


    }

    const signUpUser = async () => {

        $(".form-control").removeClass("is-invalid");
        if (utility.isInputEmpty('password') || utility.getinputValue("password").length < 6) {
            $("#password").addClass("is-invalid");
            var message = ("Please Enter A Valid Password, Minimum 6 Characters.")
            utility.showtippy('password', message, 'danger');
            showsnackbar('error', message)
            return false;
        }
        if (utility.isInputEmpty('renterpassword') || utility.getinputValue("renterpassword").length < 6) {
            $("#renterpassword").addClass("is-invalid");
            var message = ("Please Enter A Valid Password, Minimum 6 Characters.")
            utility.showtippy('renterpassword', message, 'danger');
            showsnackbar('error', message)
            return false;
        }
        else if (utility.getinputValue("renterpassword") !== utility.getinputValue("password")) {
            $("#password").addClass("is-invalid");
            $("#renterpassword").addClass("is-invalid");
            var message = ("Password Doesn't Match.")
            utility.showtippy('password', message, 'danger');
            utility.showtippy('renterpassword', message, 'danger');
            showsnackbar('error', message)
            return false;
        }

        else {

            utility.showloading()
            console.log(loginDetails);
            var fetchSignupUser = await RequestSignupUser(loginDetails.username, utility.getinputValue("password"))

            if (fetchSignupUser.success) {

                var user = fetchSignupUser.data.user;
                var token = fetchSignupUser.data.token;
                loadEmployeeData(user, token);

            } else {
                utility.hideloading()
                console.log('Unsuccessful returned error', fetchSignupUser.message);
                errorCallback({
                    message: fetchSignupUser.message
                })
            }

        }

    }




    async function loadEmployeeData(user, token) {


        utility.store_newvalue(constants.EMPLOYEE_TOKEN, token)
        utility.store_newvalue(constants.EMPLOYEE_ID, user._id)
        utility.store_newvalue(constants.EMPLOYEE_FULLNAME, user.name)
        utility.store_newvalue(constants.EMPLOYEE_PHONENUMBER, user.phonenumber)
        utility.store_newvalue(constants.EMPLOYEE_DESIGNATION, "JVS Comatsco")
        utility.store_newvalue(constants.EMPLOYEE_PLANTS, [user.plant])
        utility.store_newvalue(constants.EMPLOYEE_USERNAME, user.username)
        utility.store_newvalue(constants.EMPLOYEE_ALLMODULES, ["HOME", user.accessmodules])
        utility.store_newvalue(constants.EMPLOYEE_ISADMIN, user.isadmin)
        utility.store_newvalue(constants.EMPLOYEE_TYPE, "USER")
        window.history.replaceState(null, null, "/home");
        window.location = "/home";
        utility.hideloading()

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
                                        <img src="../assets/images/brandlogo.svg" alt="" className="img-fluid  border w-25 border-3  rounded-circle p-2" />
                                        <div className="d-flex flex-column w-100 align-items-start ps-3 border-start ms-4">
                                            <span className="fs-4  text-dark fw-bolder">{constants.COMPANYNAME}</span>
                                            <span className=" text-sm fs-md-6 text-secondary">{constants.WEBAPPTITLE}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body d-flex flex-column py-2 px-3  py-lg-4">


                                    {(() => {


                                        switch (loginDetails.type) {

                                            case LOGINTYPE.CHECK:
                                                return <>

                                                    <h3 className="fs-5 mt-0 mb-2 text-start f-w-500">Sign in to continue.</h3>
                                                    <h6 className="text-start mb-2  text-muted f-w-400 text-capitalize">Please Enter the credentials provided.</h6>

                                                </>
                                            case LOGINTYPE.NEW:
                                                return <>

                                                    <h3 className="fs-5  mt-0 mb-2 text-start f-w-500">Welcome {loginDetails.name}.</h3>
                                                    <h6 className="text-start  mb-2  text-muted f-w-400 text-capitalize">Please Create Your Password and Continue.</h6>


                                                </>

                                            case LOGINTYPE.LOGIN:
                                                return <>
                                                    <h3 className="fs-5 mt-0 mb-2 text-start f-w-500">Welcome {loginDetails.name}.</h3>
                                                    <h6 className="text-start  mb-2  text-muted f-w-400 text-capitalize">Please Enter Your Password and Continue.</h6>

                                                </>
                                            default:
                                                return null;
                                        }
                                    })()}




                                    {(() => {


                                        switch (loginDetails.type) {

                                            case LOGINTYPE.CHECK:
                                                return <>

                                                    <div className="input-group mt-2">
                                                        <span className="input-group-text"><i className="ri-user-smile-fill fs-5"></i></span>
                                                        <input type="text" ref={loginid} id="loginid" onKeyDown={(e) => handleKeyDown(e, e.target.id)} disabled={loginDetails.type != LOGINTYPE.CHECK} className="form-control  fs-6  mb-0" placeholder="Login ID" />
                                                    </div>
                                                </>
                                            case LOGINTYPE.NEW:
                                                return <>


                                                    <label className="form-check-label text-md  mb-3 text-warning text-start w-100">Create Password Minimum 6 Characters</label>
                                                    <div id="passworddiv" className="input-group">
                                                        <span className="input-group-text"><i className="ri-lock-password-fill fs-5"></i></span>
                                                        <input type="password" ref={password} defaultValue="" id="password" onKeyDown={(e) => handleKeyDown(e, e.target.id)} className="form-control fs-6   mb-0" placeholder="Password" />
                                                    </div>
                                                    <div id="reenterpassworddiv" className="input-group mt-4">
                                                        <span className="input-group-text"><i className="ri-lock-password-fill fs-5"></i></span>
                                                        <input type="password" ref={renterpassword} defaultValue="" id="renterpassword" onKeyDown={(e) => handleKeyDown(e, e.target.id)} className="form-control  fs-6   mb-0" placeholder="Re-Enter Password" />
                                                    </div>
                                                </>

                                            case LOGINTYPE.LOGIN:
                                                return <>
                                                    <div id="passworddiv" className="input-group mt-4">
                                                        <span className="input-group-text"><i className="ri-lock-password-fill fs-5"></i></span>
                                                        <input type="password" ref={password} defaultValue="" id="password" onKeyDown={(e) => handleKeyDown(e, e.target.id)} className="form-control fs-6   mb-0" placeholder="Password" />
                                                    </div>
                                                </>
                                            default:
                                                return null;
                                        }
                                    })()}




                                </div>
                                <div className="card-footer  pt-3 pb-2 px-3 p-lg-3" id="loginfooter">
                                    {(() => {
                                        switch (loginDetails.type) {
                                            case LOGINTYPE.CHECK:
                                                return <button id="nextbtn" onClick={(e) => checkUser()} className="btn btn-block btn-primary mb-4 w-100 ">NEXT</button>
                                            case LOGINTYPE.NEW:
                                                return <>
                                                    <button id="signupbtn" onClick={(e) => signUpUser()} className="btn btn-block btn-primary mb-2 w-100">Sign Up</button>
                                                    <button id="cancelbtn" onClick={(e) => utility.reloadPage()} className="btn btn-block btn-outline-secondary mb-4 w-100">Cancel</button>
                                                </>
                                            case LOGINTYPE.LOGIN:
                                                return <>
                                                    <button id="loginbtn" onClick={(e) => loginUser()} className="btn btn-block btn-primary mb-2 w-100">Login</button>

                                                    <button onClick={(e) => forgotPassword()} className="btn btn-block btn-outline-primary mb-2 w-100">Forgot Password</button>
                                                    <button id="cancelbtn" onClick={(e) => utility.reloadPage()} className="btn btn-block btn-outline-secondary mb-2 w-100">Cancel</button>
                                                </>
                                            default:
                                                return null;
                                        }
                                    })()}


                                    <span className="mb-0 text-muted text-sm text-capitalize">{constants.COMPANYNAME}</span>

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