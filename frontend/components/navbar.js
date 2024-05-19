import { useEffect, useState, useRef } from "react";
import { appendScript } from "../libraries/appendScript";
import * as utility from "../libraries/utility";
import * as constants from '../constants/appconstants'
import { useSnackbar } from 'notistack'
import { left } from "@popperjs/core";
const Navbar = ({ pagename, employeename, employeedesignation, collapseSidebarInput }) => {
  const navbtn = useRef(null);

  const [collapseSidebar, setCollapseSidebar] = useState(false);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const showsnackbar = (variant, message) => {
    enqueueSnackbar(message, {
      variant: variant,
      anchorOrigin: { horizontal: 'right', vertical: 'top' },
    });
  }
  useEffect(() => {
    setCollapseSidebar(collapseSidebarInput);
  }, []);
  useEffect(() => {
    if (collapseSidebar) {
      navbtn.current.click();
    }
  }, [collapseSidebar]);



  return (
    <div>
      <div className="pc-mob-header pc-header">
        <div className="pcm-logo">
          <img src="../assets/images/logo.svg" alt="" className="logo logo-lg" />
        </div>
        <div className="pcm-toolbar">
          <a href="#!" className="pc-head-link" id="mobile-collapse">
            <div className="hamburger hamburger--arrowturn">
              <div className="hamburger-box">
                <div className="hamburger-inner"></div>
              </div>
            </div>
          </a>
          <a href="#!" className="pc-head-link" id="headerdrp-collapse">
            <i data-feather="align-right"></i>
          </a>
          <a href="#!" className="pc-head-link" id="header-collapse">
            <i data-feather="more-vertical"></i>
          </a>
        </div>
      </div>

      <header className="pc-header d-flex flex-fill flex-grow-1 row ps-4 pe-2">
        <div className="col-6 d-flex px-0">
          <div className="page-header-title my-auto">
            <span className="text-dark text-md f-w-800 text-capitalize">{process.env.NEXT_PUBLIC_ENVTYPE === "dev" ? "dev : " + pagename : "" + pagename}</span>
          </div>
        </div>
        <div className="col-6 d-flex flex-row align-items-center justify-content-end">
          <ul className="list-unstyled">
            <li className="dropdown pc-h-item">
              <a
                className="pc-head-link dropdown-toggle arrow-none me-0 p-2 "
                data-bs-toggle="dropdown"
                href="#"
                role="button"
                aria-haspopup="false"
                aria-expanded="false"
              >
                <div className="d-flex flex-column">
                  <span className="text-sm text-dark f-w-800 mb-0 text-capitalize">{utility.get_keyvalue(constants.EMPLOYEE_FULLNAME)}</span>
                </div>
              </a>
              <div className="dropdown-menu dropdown-menu-end pc-h-dropdown">
                <a onClick={() => utility.signOutUser()} className="dropdown-item d-flex align-items-center py-2">
                  <i className="ri-logout-box-line mt-0 fs-6"></i>
                  <span>Logout</span>
                </a>
                {/* <hr className="m-2 text-muted" />
                <a onClick={() => openUserManual()} className="dropdown-item d-flex align-items-center py-2">
                  <i className="ri-question-fill mt-0 fs-6"></i>
                  <span>User Manual</span>
                </a> */}
              </div>
            </li>
          </ul>
        </div>
      </header>
    </div>
  );
};

export default Navbar;
