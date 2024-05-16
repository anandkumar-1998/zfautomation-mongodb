
import { useEffect, useRef } from "react";
import { getSelectedModule } from "../firebase/firebaseConstants";

const AccessForbidden = ({ message }) => {
    const ref = useRef(null);
    useEffect(() => {
        import("@lottiefiles/lottie-player");
    }, []);
    return (
        <div className="auth-wrapper">
            <div className="auth-content">
                <div className="card shadow-lg  rounded-3 ">
                    <div className="row align-items-center text-center">
                        <div className="col-md-12 px-1">
                            <div className="card-header px-3 py-1">
                                <div className=" d-flex flex-row align-items-center w-100 ">
                                    <img src="../assets/images/loginlogo.svg" style={{ height: "75px" }} className="img-fluid shadow-md rounded  w-25 p-0" />
                                    <div className="d-flex flex-column w-100 align-items-start ps-2 border-start ms-2">
                                        <span className="fs-5 mb-1 text-dark fw-bolder">ZF Steering Gear (India)</span>
                                        {/* <span className="fs-8  fw-semibold text-muted"> {process.env.NEXT_PUBLIC_MODULETYPE === 'TIMEOFFICE' ? "TIME OFFICE WEB CONSOLE" : "REPORTING WEB CONSOLE"}</span> */}
                                    </div>
                                </div>

                            </div>
                            <div className="card-body py-3 px-2">
                                <h3 className="mt-2 mb-2 text-center w-100 f-w-400 fw-bold fs-3">Access Forbidden</h3>
                                <h6 className="text-start text-center w-100 f-w-400 text-capitalize">Please contact administrator to get access to this page.</h6>
                                <br />
                                <span className="mb-0 text-muted text-sm text-capitalize">ZF Steering Gear (India) Limited </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AccessForbidden;