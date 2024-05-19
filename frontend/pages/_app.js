import "../styles/scss/app.scss";
import "tippy.js/dist/tippy.css";
import "tippy.js/dist/backdrop.css";
import "tippy.js/animations/shift-away.css";
import "react-perfect-scrollbar/dist/css/styles.css";
import "notyf/notyf.min.css";
import 'bootstrap/dist/css/bootstrap.min.css'
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "remixicon/fonts/remixicon.css";
import $ from "jquery";
import jQuery from "jquery";
import { useEffect, useState, useRef } from "react";
import { appendScript } from "../libraries/appendScript";
import { useRouter } from "next/router";
import * as utility from "../libraries/utility";
import { EMPLOYEE_ID, EMPLOYEE_ISADMIN, EMPLOYEE_ALLMODULES, EMPLOYEE_USERNAME } from "../constants/appconstants";
import LoadingBox from "../components/loading";
import AccessForbidden from "../components/accessforbidden";
import SystemError from "../components/SystemError";
import { SnackbarProvider } from "notistack";
import { RequestLiveDate } from "../apis/masterAPIS.js";

const ACCESS = {
  ALLOWED: "ALLOWED",
  FORBIDDEN: "FORBIDDEN",
  LOADING: "LOADING",
  ERROR: "ERROR",
};
var isLoadingDate = false
var errorMessage = ""
function MyApp({ Component, pageProps }) {
  let wasUserLoggedIn = useRef();
  const [user, setUser] = useState(utility.get_keyvalue(EMPLOYEE_ID));

  const [access, setAccess] = useState(ACCESS.LOADING);
  const router = useRouter();
  useEffect(() => {
    window.$ = $;
    window.jQuery = jQuery
    let Choices = require("choices.js");
    window.Choices = Choices;

    appendScript("../../../assets/themejs/jquery.js");
    appendScript("../../../assets/themejs/plugins/popper.min.js");
    appendScript("../../../assets/themejs/plugins/bootstrap.js");
    appendScript("../../../assets/themejs/plugins/tableexport.js");
    appendScript("../../../assets/libraries/datatables.js");
    appendScript("../../../assets/libraries/dataTables.fixedHeader.js");
    appendScript("../../../assets/libraries/dataTables.fixedColumns.js");
    appendScript("../../../assets/libraries/jszip.js");
    appendScript("../../../assets/themejs/plugins/perfect-scrollbar.min.js");
    appendScript("../../../assets/themejs/plugins/feather.min.js");
    appendScript("../../../assets/themejs/plugins/choices.min.js");
    import("@lottiefiles/lottie-player");
    appendScript("../../../assets/themejs/vendor-all.min.js");
    appendScript("../../../assets/themejs/pcoded.min.js");
    appendScript("../../../assets/themejs/bootstrap-datepickerv2.js");
    appendScript("../../../assets/themejs/plugins/inputmask.js");
    appendScript("../../../assets/themejs/plugins/jquery.inputmask.js");
    document.body.classList.add("minimenu");

    var tc = document.querySelectorAll(".pc-navbar li .pc-submenu");
    for (var t = 0; t < tc.length; t++) {
      var c = tc[t];
      c.removeAttribute("style");
    }

    let multiselect = require('../libraries/jquery.multiselectv2.js');
    window.multiselect = multiselect;

    window.bootstrap = require('bootstrap')
    document.addEventListener("wheel", function (event) {
      if (document.activeElement.type === "number") {
        document.activeElement.blur();
      }
    });


  }, []);

  async function fetchLiveDate() {
    if (isLoadingDate) {
      console.log('LDDT');
      return;
    }

    isLoadingDate = true;
    utility.showloading()
    var isIPCheckRequired = process.env.NEXT_PUBLIC_MODULETYPE !== 'MAILACTIONS'
    //  isIPCheckRequired = false  //<- only for akkshay
    var fetchLiveDate = await RequestLiveDate(isIPCheckRequired)

    if (fetchLiveDate.success) {
      var dateuid = fetchLiveDate.data
      // console.log("dateuid " + dateuid + " " + utility.getDateUID("MMM DD YYYY"));
      if (dateuid !== utility.getDateUID('MMM DD YYYY')) {
        errorMessage = ("Failed To Validate Request, Please Check Your System Date and Time")
        setAccess(ACCESS.ERROR)
      } else {
        if (router.pathname !== "/") {
          setAccess(ACCESS.ALLOWED);
        } else {
          checkUserData();
        }
      }

    } else {
      utility.hideloading()
      errorMessage = (fetchLiveDate.message)
      setAccess(ACCESS.ERROR)
    }
  }



  useEffect(() => {

    document.body.classList.add("minimenu");
    var tc = document.querySelectorAll(".pc-navbar li .pc-submenu");
    for (var t = 0; t < tc.length; t++) {
      var c = tc[t];
      c.removeAttribute("style");
    }
    console.log({ user });
    // setAccess(ACCESS.ALLOWED);
    if (user == "nothingfound" && router.pathname !== "/login") {
      utility.directSignout();
    } else {
      fetchLiveDate()
    }
  }, [user]);

  useEffect(() => {
    appendScript("../../../assets/themejs/pcoded.min.js");
    appendScript("../../../assets/libraries/daterangepicker.js");


    if (access == ACCESS.ALLOWED && user !== "nothingfound") {
      console.log("IDLE ACTIVATED");
      document.onclick = function () {
        utility.store_newvalue("_idleSecondsCounter", 0);
      };
      document.onmousemove = function () {
        utility.store_newvalue("_idleSecondsCounter", 0);
      };
      document.onkeypress = function () {
        utility.store_newvalue("_idleSecondsCounter", 0);
      };
      window.setInterval(CheckIdleTime, 5000);
    }

  }, [access]);


  var IDLE_TIMEOUT = 12 * 30; //15 minutes
  var _idleSecondsCounter = 0;


  function CheckIdleTime() {
    setUser(utility.get_keyvalue(EMPLOYEE_ID))

    _idleSecondsCounter = utility.get_keyvalue("_idleSecondsCounter");
    _idleSecondsCounter++;
    // console.log("counter :  " + _idleSecondsCounter);
    if (_idleSecondsCounter >= IDLE_TIMEOUT) {
      utility.directSignout();
    } else {
      // console.log("timeout " + (IDLE_TIMEOUT - _idleSecondsCounter));
      utility.store_newvalue("_idleSecondsCounter", _idleSecondsCounter);
    }
  }


  function checkUserData() {

    if (user == "nothingfound") {
      // user has not logged in, current page is not login page, then navigate to login page
      wasUserLoggedIn = false;
      if (router.pathname !== "/login") {
        utility.directSignout();
      } else {
        // access forbidden
        setAccess(ACCESS.ALLOWED);
      }
    } else if (user != "nothingfound") {

      // console.log("MODULES : ", utility.get_keyvalue(EMPLOYEE_ALLMODULES), pageProps.module);
      wasUserLoggedIn = true;
      if (utility.get_keyvalue(EMPLOYEE_ID) !== "nothingfound") {
        if (router.pathname !== "/login" && router.pathname !== "/") {
          if (utility.get_keyvalue(EMPLOYEE_ISADMIN)) {
            setAccess(ACCESS.ALLOWED);
          }
          else {
            if (utility.get_keyvalue(EMPLOYEE_ALLMODULES).includes(pageProps.module)) {
              setAccess(ACCESS.ALLOWED);
            } else if (pageProps.onlyAdminAccess) {
              // access forbidden

              setAccess(ACCESS.FORBIDDEN);
            } else {
              // access forbidden

              setAccess(ACCESS.FORBIDDEN);
            }
          }
        }
        else if (router.pathname === "/") {
          utility.directSignout();
        }

        else {
          setAccess(ACCESS.ALLOWED);
        }
      } else {
        //  user details unavailable, force logout
        utility.directSignout();
      }
    }
  }

  return (
    <SnackbarProvider>
      {(() => {
        // console.log({ access });
        switch (access) {
          case ACCESS.LOADING:
            return <LoadingBox message={"Please Wait"} />;
          case ACCESS.ALLOWED:
            return (
              <>
                <Component {...pageProps} />
              </>
            );
          case ACCESS.FORBIDDEN:
            return <AccessForbidden />;
          case ACCESS.ERROR:
            return <SystemError message={errorMessage} />;
          default:
            return null;
        }
      })()}
    </SnackbarProvider>
  );
}

export default MyApp;
