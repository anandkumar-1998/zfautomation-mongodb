import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import $ from "jquery";
import * as constants from "../constants/appconstants";
import * as utility from "../libraries/utility";
import * as fbc from '../firebase/firebaseConstants'

const Sidebar = () => {
  const [userModules, setuserModules] = useState([]);
  const [isadmin, setisadmin] = useState(false);
  const [username, setusername] = useState("");
  useEffect(() => {
    if (utility.get_keyvalue(constants.EMPLOYEE_ISADMIN) !== "nothingfound") {
      setisadmin(utility.get_keyvalue(constants.EMPLOYEE_ISADMIN));
    }
    setusername(utility.get_keyvalue(constants.EMPLOYEE_FULLNAME));
    setuserModules(utility.get_keyvalue(constants.EMPLOYEE_ALLMODULES));
  }, []);


  useEffect(() => {
    // if (userModules.length === 0) { return; }

    // if (utility.get_keyvalue(constants.EMPLOYEE_FULLNAME) == "nothingfound") {
    //   return
    // }


    addModuleSidebar("Masters", fbc.MASTERMODULE, "ri-settings-4-fill")

  }, [userModules])

  function findCommonElements(arr1, arr2) {
    return arr1.some(item => arr2.includes(item))
  }
  function addModuleSidebar(menuName, moduleObject, icon, forAllUsers = false) {

    var isMainModuleApplicable = false
    var subMenus = ``
    Object.keys(moduleObject).map(key => {

      if (key === "modules") {
        var moduleDetails = moduleObject[key]
        // console.log({ moduleDetails });
        Object.keys(moduleDetails).map(moduleKey => {
          var module = moduleDetails[moduleKey]
          if (userModules.includes(moduleKey) || isadmin || userModules.includes(module.modulekey)) {

            isMainModuleApplicable = true;
            // console.log({ moduleKey, module });
            subMenus += ` <li class="pc-item">
                                    <a class="pc-link " href="${module.path}">
                                      ${module.label}
                                    </a>
                                  </li>`
          }
        })
      } else {
        var moduleDetails = moduleObject[key]
        var moduleItems = ``

        if (moduleDetails.modules != undefined) {
          Object.keys(moduleDetails.modules).map(moduleKey => {
            var module = moduleDetails.modules[moduleKey]
            // console.log({ moduleKey, module });
            if (userModules.includes(moduleKey) || isadmin || userModules.includes(module.modulekey)) {

              moduleItems += ` <li class="pc-item">
                                    <a class="pc-link " href="${module.path}">
                                      ${module.label}
                                    </a>
                                  </li>`
            }
          })

          var subMenu = `  <li class="pc-item pc-hasmenu">
                            <a href="#!" class="pc-link">${moduleDetails.label}</a>
                            <ul class="pc-submenu hidescrollbarfordiv">
                            ${moduleItems}
                            </ul>
                          </li>`

          if (moduleItems.length > 0) {
            isMainModuleApplicable = true
            subMenus += subMenu
          }
        } else {
          if (moduleDetails.path !== undefined) {
            isMainModuleApplicable = true;
            subMenus += `<li class="pc-item">
                          <a class="pc-link " href="${moduleDetails.path}">
                            ${moduleDetails.label}
                          </a>
                        </li>`;
          }

        }
      }



    })

    var mainenu = `  <li class="pc-item pc-caption">
                    <label>${menuName}</label>
                    <span class="text-truncate">${menuName}</span>
                  </li>
                  <li class="pc-item pc-hasmenu">
                    <a class="pc-link  ">
                      <span class="pc-micon ${icon}"></span>
                      <span class="pc-mtext">${menuName}</span>
                      <span class="pc-arrow">
                        <i data-feather="chevron-right"></i>
                      </span>
                    </a>
                    <ul class="pc-submenu ">
                    ${subMenus}
                    </ul>
                  </li>`;

    if (isMainModuleApplicable) {
      $(".pc-navbar").append(mainenu)
    }




  }



  return (
    <nav className="pc-sidebar  light-sidebar">
      <div className="navbar-wrapper">
        <div className="m-header">
          <a className="sidebar-brand logo-lg" href="../../../home">
            <div className=" d-flex flex-row align-items-center">
              <img src="../../../assets/images/brandlogo.svg" alt="" className=" me-3 ms-0 my-0" />
              <div className="d-flex flex-column">
                <span className="align-middle text-lg  text-white fw-bold">ZF India</span>
                <span className="align-middle text-sm text-secondary">REPORTING WEB CONSOLE</span>
              </div>
            </div>
          </a>
          <a className="b-brand m-auto" href="../../home">
            <img src="../../../assets/images/brandlogo.svg" alt="" className="logo m-0 logo-sm" />
          </a>
        </div>
        <div className="navbar-content d-flex flex-column">
          <ul className="pc-navbar">




          </ul>
          <div className="pc-item mb-0 mt-auto ">
            <a onClick={() => utility.signOutUser()} className="pc-link ">
              <span className="pc-micon ri-user-smile-fill my-auto"></span>
              <span className="pc-mtext">{username}<br></br> <span className="text-sm">LOGOUT</span></span>
            </a>


          </div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
