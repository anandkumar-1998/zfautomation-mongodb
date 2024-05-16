import $ from 'jquery'
import { extract } from "../libraries/keyword_extractor"
import * as constants from '../constants/appconstants'
import swal from 'sweetalert';
import { Notyf } from 'notyf';
import SecureLS from 'secure-ls';
import tippy, { animateFill } from 'tippy.js';
import { RequestLogoutUser } from '../apis/masterAPIS';
var moment = require('moment');

const delay = ms => new Promise(res => setTimeout(res, ms));
function randomstring(lengthprovided) {
  let length = lengthprovided !== undefined ? lengthprovided : 8;
  let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var result = "";

  for (var i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];

  return result;
}
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function getTimestamp() {
  return Math.round(new Date().getTime() / 1000);
}
function getTime(format = "hh:mm a") {
  return moment().format(format);
}
function getDate(format = "DD/MM/YYYY") {
  return moment().format(format);
}
function getTimestampfromDate(date, format) {
  return moment(date, format) / 1000
}
function getDatefromTimestamp(timestamp, format = "DD/MM/YYYY") {
  if (timestamp > 0) {
    return moment.unix(timestamp).format(format);
  }
  else {
    return "--"
  }
}
function getFinancialYear(momentDate) {
  var quarter = moment(momentDate, 'DD/MM/YYYY').quarter();

  if (quarter > 1) {
    return moment(momentDate, 'DD/MM/YYYY').year();
  } else {
    return moment(momentDate, 'DD/MM/YYYY').year() - 1;
  }
}
function getTimefromTimestamp(timestamp, format = "hh:mm a") {
  // console.log("timestamp :" + timestamp);
  if (timestamp > 0) {
    return moment.unix(timestamp).format(format);
  }
  else {
    return "--"
  }
}
function getDateUID(format = "DD/MM/YYYY") {
  return (moment().format(format)).replaceAll(" ", "").toLowerCase();
}

function isNumeric(str) {

  return /^\d+$/.test(str);

  // if (typeof str != "string") return false // we only process strings!  
  // return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
  // !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}


function getNumberToAmount(value, fixeddecimal = 2) {

  if (value.toString().length == 0) return "0"

  var x = Number(value).toFixed(fixeddecimal);
  x = x.toString();
  var afterPoint = '';
  if (x.indexOf('.') > 0)
    afterPoint = x.substring(x.indexOf('.'), x.length);
  x = Math.floor(x);
  x = x.toString();
  var lastThree = x.substring(x.length - 3);
  var otherNumbers = x.substring(0, x.length - 3);
  if (otherNumbers != '')
    lastThree = ',' + lastThree;
  var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;

  if (Math.round(res) == 0) {
    res = 0
  }

  return res
}

function liveTime(id) {
  const timeDisplay = document.getElementById(id);
  const dateString = new Date().toLocaleString();
  // const formattedString = moment().format("hh:mm:ss A, DD/MM/YYYY");
  const formattedString = moment().format("hh:mm A, MMM DD YYYY");
  timeDisplay.textContent = formattedString;
}

function getDateFromDateUID(dateuid) {

  var month = dateuid.substring(0, 3);
  var date = dateuid.substring(3, 5);
  var year = dateuid.substring(5, 9);


  var finaldate = date + " " + month + " " + year

  return moment(finaldate, 'DD MMM YYYY').format("MMM DD YYYY, ddd")
}
function getUniqueTimeID() {
  return (randomstring(2) + getTimestamp().toString(36));
}


function textEllipsis(cutoff, wordbreak, escapeHtml) {
  var esc = function (t) {
    return t
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  return function (d, type, row) {
    // Order, search and type get the original data
    if (type !== 'display') {
      return d;
    }

    if (typeof d !== 'number' && typeof d !== 'string') {
      return d;
    }

    d = d.toString(); // cast numbers

    if (d.length <= cutoff) {
      return d;
    }

    var shortened = d.substr(0, cutoff - 1);

    // Find the last white space character in the string
    if (wordbreak) {
      shortened = shortened.replace(/\s([^\s]*)$/, '');
    }

    // Protect against uncontrolled HTML input
    if (escapeHtml) {
      shortened = esc(shortened);
    }

    return shortened + '&#8230;';
  };
};

function getDateandTime() {
  return moment().format("MMM DD YYYY hh:mm a");
}

function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}
function isvalidusername(username) {
  var re = /^[a-z][a-z0-9]*([._-][a-z0-9]+)*$/;
  return re.test(username);

}
function isvalidcode(code) {
  var re = /^[A-z][A-Z0-9]*([._-][A-Z0-9]+)*$/;
  return re.test(code);

}


function hastwoarrayscommonitem(array1, array2) {

  // Loop for array1
  for (let i = 0; i < array1.length; i++) {

    // Loop for array2
    for (let j = 0; j < array2.length; j++) {

      // Compare the element of each and
      // every element from both of the
      // arrays
      if (array1[i] === array2[j]) {

        // Return if common element found
        return true;
      }
    }
  }

  // Return if no common element exist
  return false;
}


function showaccessForbidden() {


  $("body").empty().append(getLoadingItem("Please Wait"))
}



function getLoadingItem(message) {
  var loadingDiv = ` <div
      id="loadingbox"
      class="justify-content-center align-items-center  align-content-center d-flex flex-row w-100 h-100"
      style="
        position: fixed;
        top: 0;
        z-index: 100000;
        left: 0;
        background-color: rgba(00, 00, 00, 0.70);
        width: 100%;
        height: 100% !important;
      "
    >
      <div class="d-flex flex-column justify-content-center align-items-center mb-5 pb-5"style="margin-top:-70px;">

      <lottie-player
          id="firstLottie"
        
          autoplay
          
          loop
          mode="normal"
          src="../../../assets/loadingAnim.json"
          style=" width: 200px; height: 200px;"
        ></lottie-player>

        <div class="spinner-border text-light d-none" role="status">
          <span class="sr-only"></span>
        </div>
        <div class="d-flex flex-row align-items-end" style="margin-top:-60px;">
          <h5 id="loadingupdatetext" class="my-3 text-xl  text-white">${message}  </h5>
          <h5 class="text-xl  loader__dot ml-2 my-3 text-white">.</h5>
          <h5 class="text-xl  loader__dot my-3 text-white">.</h5>
          <h5 class="text-xl  loader__dot my-3 text-white">.</h5>
        </div>
      </div>
    </div>`
  return loadingDiv
}
function excelDateToJSDate(serial) {
  var utc_days = Math.floor(serial - 25569);
  var utc_value = utc_days * 86400;
  var date_info = new Date(utc_value * 1000);

  var fractional_day = serial - Math.floor(serial) + 0.0000001;

  var total_seconds = Math.floor(86400 * fractional_day);

  var seconds = total_seconds % 60;

  total_seconds -= seconds;

  var hours = Math.floor(total_seconds / (60 * 60));
  var minutes = Math.floor(total_seconds / 60) % 60;

  return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
}
function showloading() {

  var loadingDivExists = !!document.getElementsByName("loadingbox");

  if (loadingDivExists) {

    $("#loadingbox").remove()
  }



  $("body").append(getLoadingItem("Please Wait"))
}


function sanitizeID(id) {
  return id.toString().replaceAll("/", "")
}

function updateloadingstatus(text) {
  $("#loadingupdatetext").text(text);
}

function hideloading() {
  // $("#loadingbox").addClass("d-none");
  $("#loadingbox").remove();
}
function truncate(message, count) {
  if (message === undefined || message === null) {
    return "n/a"
  }
  else {
    if (count === undefined) {
      count = 80;
    }
    if (message.length > count) {
      message = message.slice(0, count);
      message = message.slice(0, message.lastIndexOf(' ')) + '...';
    }
    return message.toString();
  }

}

function goback() {
  window.history.back();
}


function getDateOfISOWeek(w, y) {
  var simple = new Date(y, 0, 1 + (w - 1) * 7);
  var dow = simple.getDay();
  var ISOweekStart = simple;
  if (dow <= 4)
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  return ISOweekStart;
}

function store_newvalue(key, value) {
  var ls = new SecureLS({ encodingType: "aes", encryptionSecret: process.env.NEXT_PUBLIC_ENCRYPTIONKEY });
  ls.set(key, { data: value }); // set key1
}


function remove_keyvalue(key, value) {
  var ls = new SecureLS({ encodingType: "aes", encryptionSecret: process.env.NEXT_PUBLIC_ENCRYPTIONKEY });
  ls.remove(key);
}
function get_keyvalue(key) {
  if (typeof window == 'undefined') {
    console.log("WINDOW UNAVAILABLE");
    return "nothingfound";
  }
  var ls = new SecureLS({ encodingType: "aes", encryptionSecret: process.env.NEXT_PUBLIC_ENCRYPTIONKEY });

  try {
    var value = ls.get(key).data;
    if (value === undefined) {
      value = "nothingfound";
    }
    return value;
  } catch (error) {
    console.log("error :" + error);
    return "nothingfound"
  }
}
function padwithzero(n) {
  return (n < 10) ? ("0" + n) : n;
}
function padwithtripplezero(n) {

  if (n < 10) {
    return "00" + n
  }
  else if (n > 9 && n < 100) {
    return "0" + n
  }
  else {
    return n
  }

}
function clear_allvalues() {
  var ls = new SecureLS({ encodingType: "aes", encryptionSecret: constants.ECPTKEY });
  ls.removeAll();
}


function checkifValueExistsinArrayMap(array, key, value, skipMap) {

  for (var i = 0; i < array.length; i++) {

    if (skipMap != null) {
      if (array[i].get(key) === value && skipMap.get(key) !== value) {
        return true;
      }
    } else {
      if (array[i].get(key) === value) {
        return true;
      }
    }


  }
  return false;


}


function disableinput(id) {
  $("#" + id).prop("disabled", true);
}

function enableinput(id) {

  $("#" + id).prop("disabled", false);
}

function toast(message) {
  M.toast({ html: message });
}
function capitalize_Words(str) {
  return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
}
function lowercaseall(str) {
  return str.toLowerCase();
}

function checkifvalueisnullorundefined(value, returnvalueifnull = "") {
  if (value != undefined && value != null) {
    return value
  } else {
    return returnvalueifnull
  }
}


function getDaysinBetween(starttimestamp, endtimestamp = getTimestamp()) {
  var startDate = moment.unix(starttimestamp);
  var endDate = moment.unix(endtimestamp);
  return endDate.diff(startDate, 'days');
}

function isNumberKey(evt) {
  var charCode = (evt.which) ? evt.which : evt.keyCode;
  if (charCode != 46 && charCode > 31
    && (charCode < 48 || charCode > 57))
    return false;

  return true;
}


function givepercentage(max, min) {
  var perc = "";
  perc = ((min / max) * 100).toFixed(0) + "%";

  return perc;
}

function signOutUser() {

  swal({
    title: 'Logging Out',
    text: 'Are you sure you want to logout?',
    icon: "info",
    confirmButtonClass: "btn-info",
    buttons: {
      cancel: "CANCEL",
      logout: "LOGOUT"
    },
    closeOnEsc: false,
  }).then(async (value) => {
    switch (value) {
      case "logout":
        showloading();
        localStorage.clear();
        await directSignout()
        break;
      default:
        console.log("logout cancelled");
    }
  });




}

async function directSignout() {
  showloading();

  var fetchLogoutUser = await RequestLogoutUser()

  localStorage.clear();
  clear_allvalues()
  if (fetchLogoutUser.success) {
    console.log("FORCED LOGGED OUT");
    window.location = "../login";
  } else {
    hideloading()
    console.log('Unsuccessful returned error', fetchLogoutUser.message);

    window.location = "../login";
  }

}


function capitalizeSentence(input) {
  if (input.length === 0 || input === undefined) {
    return "n/a";
  }

  var words = input.split(' ');
  var CapitalizedWords = [];
  words.forEach(element => {
    if (element[0] != undefined) {
      CapitalizedWords.push(element[0].toUpperCase() + element.slice(1, element.length));
    }
  });
  return CapitalizedWords.join(' ');
}


function success_alert(title, message, btntext, positiveFunction, negativeFunction) {
  swal({
    title: title,
    text: message,
    icon: "success",
    confirmButtonClass: "btn-success",
    button: btntext,
    closeOnEsc: false,
    closeOnClickOutside: false,
  }).then((isConfirm) => {
    if (isConfirm) {
      positiveFunction();
    } else {
      if (negativeFunction != null) {
        negativeFunction();
      }
    }
  });
}

function error_alert(title, message, btntext, positiveFunction, negativeFunction, hasHTMLMessage = false) {
  let data = {
    title: title,
    text: message,
    icon: "error",
    confirmButtonClass: "btn-danger",
    button: btntext,
    closeOnEsc: false,
    closeOnClickOutside: false,
  }
  if (hasHTMLMessage) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = message;
    data["content"] = wrapper;
    data["text"] = "";
  }
  swal(data).then((isConfirm) => {
    if (isConfirm) {
      positiveFunction();
    } else {
      if (negativeFunction != null) {
        negativeFunction();
      }
    }
  });
}



function info_alert(title, message, btntext, cancelbtntext, positiveFunction, negativeFunction, hasHTMLMessage = false) {


  let data = {
    title: title,
    text: message,
    type: "info",
    confirmButtonClass: "btn-info",
    buttons: cancelbtntext.length > 0 ? [cancelbtntext, btntext] : btntext,
    closeOnEsc: false,
    closeOnClickOutside: false,
  }

  if (hasHTMLMessage) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = message;
    data["content"] = wrapper;
    data["text"] = "";
  }
  swal(data).then((isConfirm) => {
    if (isConfirm) {
      if (positiveFunction != null) {
        positiveFunction();
      }
    } else {
      if (negativeFunction != null) {
        negativeFunction();
      }
    }
  });
}


function isInputEmpty(id) {
  var inputtext = $("#" + id).val();
  if (inputtext.trim().length == 0) {
    return true;
  }
  else {
    return false;
  }
}

function isInputValidEmailAddress(id) {
  return (/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(getinputValue(id)))
}

function getinputAllinLowercase(id) {
  console.log(id);
  var inputtext = $("#" + id).val();
  return inputtext.trim().toLowerCase()
}

function getinputAllinUppercase(id) {
  var inputtext = $("#" + id).val();
  return inputtext.trim().toUpperCase()
}

function getinputValue(id, titleCase) {
  var inputtext = $("#" + id).val();
  if (titleCase) {
    return CapitalizeString(inputtext.trim())
  } else {
    return inputtext.trim();
  }
}
function CapitalizeString(str) {
  var splitStr = str.toLowerCase().split(' ');
  for (var i = 0; i < splitStr.length; i++) {
    // You do not need to check if i is larger than splitStr length, as your for does that for you
    // Assign it back to the array
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  // Directly return the joined string
  return splitStr.join(' ');
}

function getinputValueInNumbers(id) {
  var inputtext = $("#" + id).val();
  return Number(inputtext.trim());
}


function showAlert(alertObject) {

  // $.notify(
  //   {
  //     title: "<strong>" + alertObject.title + "</strong>",
  //     message:
  //       alertObject.message,
  //   },
  //   {
  //     type: alertObject.type,

  //   }
  // );



  var color = "";

  if (alertObject.type === 'danger') {
    color = "#F12E30"
    const notyf = new Notyf({

      duration: 3000,
      dismissible: true,
      types: [
        {
          type: 'warning',
          background: 'orange',
          icon: {
            className: 'ri-error-warning-fill text-white',
            tagName: 'i',
          }
        }
      ]
    });
    notyf.error("<strong class='fs-5 mb-2'>" + alertObject.title + "</strong> </br> " + alertObject.message);

  }
  else if (alertObject.type === 'warning') {
    color = "#FCB92C"
    const notyf = new Notyf({

      duration: 3000,
      dismissible: true,
      types: [
        {
          type: 'warning',
          background: 'orange',
          icon: {
            className: 'ri-error-warning-fill text-white',
            tagName: 'i',
          }
        }
      ]
    });
    notyf.open({
      type: 'warning',
      message: "<strong class='fs-5 mb-2'>" + alertObject.title + "</strong> </br> \n " + alertObject.message
    });
  }
  else {
    color = "#15DC85"
    const notyf = new Notyf({

      duration: 3000,
      dismissible: true,
      types: [
        {
          type: 'warning',
          background: 'orange',
          icon: {
            className: 'ri-error-warning-fill text-white',
            tagName: 'i',
          }
        }
      ]
    });
    notyf.success("<strong class='fs-5 mb-2'>" + alertObject.title + "</strong> </br> \n " + alertObject.message);
  }

  // Toastify({
  //   text: "<strong>" + alertObject.title + "</strong> </br> \n " + alertObject.message,
  //   duration: 3000,
  //   close: true,
  //   gravity: "bottom",
  //   position: "right",
  //   backgroundColor: color,
  // }).showToast();

}

function firebaseerror(error) {
  console.log("error : " + error);
  var alertObject = {
    title: "Something Went Wrong!",
    type: 'danger',
    message: error
  }
  showAlert(alertObject);
}


function hideitem(id) {
  $("#" + id).addClass("d-none");
  $("#" + id).removeClass("d-block");
  $("#" + id).removeClass("d-flex");
}

function showitem(id, extraclass) {
  $("#" + id).addClass("d-block");
  $("#" + id).removeClass("d-none");
  if (extraclass !== undefined) {

    $("#" + id).addClass(extraclass);
  }
}

function deleteitem(id) {
  $("#" + id).remove();
}


function reloadPage() {
  showloading()
  location.reload(true);
}

function checkifdochasvalueandreturnvalue(doc, key) {

  // console.log("data : " + doc.get(key))

  if (doc === null || key === null) {
    return "";
  }
  else if (doc.get(key) !== undefined && doc.get(key) !== undefined && doc.get(key).length > 0) {
    return doc.get(key);
  }
  else if (doc.get(key) !== undefined && doc.get(key) !== undefined && doc.get(key).length === 0) {
    return "--";
  }
  else if (doc.get(key) === undefined) {
    return "--";
  }

}
function removeURLParam(sourceURL) {
  var rtn = sourceURL.split("?")[0],
    param,
    params_arr = [],
    queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
  if (queryString !== "") {
    params_arr = queryString.split("&");
    for (var i = params_arr.length - 1; i >= 0; i -= 1) {
      param = params_arr[i].split("=")[0];
      params_arr.splice(i, 1);
    }
    rtn = rtn + "?" + params_arr.join("&");
  }
  else {
    var searchUrl = location.search;
    rtn = rtn.replace(searchUrl, '');
  }
  history.pushState({ state: 1, rand: Math.random() }, '', rtn);
  return rtn;
}

function showpopover(elementid, message) {
  $('.popover').remove()
  var element = document.getElementById(elementid)
  var popover = new bootstrap.Popover(element, {
    content: message,
    trigger: 'manual',
    placement: "auto"
  })
  popover.show()


  element.addEventListener('shown.bs.popover', function () {
    setTimeout(function () {
      popover.hide()
      popover.hide()
    }, 5000);
  })

}


function showtippy(elementid, message, type, placementprovided) {

  var tippytype = 'material'
  if (type !== undefined || type !== null) {
    tippytype = type
  }


  console.log("type : " + ($("#" + elementid).prop('nodeName')) + " : " + $('#' + elementid).is("SELECT"));
  var is_element_input = $('#' + elementid).is("input");
  var is_element_button = $('#' + elementid).is("button");
  var is_element_textarea = $('#' + elementid).is("textarea");
  var is_element_div = $('#' + elementid).is("div");
  var is_element_select = $('#' + elementid).is("SELECT");
  var element = $('#' + elementid)[0]
  var placement = 'top'
  if (is_element_input || is_element_textarea) {
    placement = 'bottom-end'
  }

  if (is_element_div) {
    placement = 'bottom-start'
  }

  if (is_element_select) {
    placement = 'top-end'
    element = $('#' + elementid).parent()[0]
  }

  if (placementprovided !== undefined || placementprovided !== null) {
    placement = placementprovided
  }



  // var element = document.getElementById(elementid)


  var instance = tippy([element], {
    content: message,
    animateFill: true,
    placement: placement,
    theme: tippytype,
    plugins: [animateFill],
  })
  console.log(instance);
  instance[0].show();
  if (is_element_input || is_element_textarea || is_element_select || is_element_button) {
    setTimeout(function () {
      instance[0].destroy();
    }, 5000);
  }


}
function extractkeywordsfromHTML(html) {
  const extraction_result =
    extract(extractContent(html), {
      language: "english",
      remove_digits: false,
      return_changed_case: true,
      remove_duplicates: true

    });

  console.log("result HTML : " + JSON.stringify(extraction_result))
  return extraction_result;
}
function extractContent(s) {
  var span = document.createElement('span');
  span.innerHTML = s;
  var children = span.querySelectorAll('*');
  for (var i = 0; i < children.length; i++) {
    if (children[i].textContent)
      children[i].textContent += ' ';
    else
      children[i].innerText += ' ';
  }
  return [span.textContent || span.innerText].toString().replace(/ +/g, ' ');
};

function extractkeywordsfromString(string) {
  const extraction_result =
    extract(string, {
      language: "english",
      remove_digits: false,
      return_changed_case: true,
      remove_duplicates: true

    });
  console.log("result String : " + JSON.stringify(extraction_result))
  return extraction_result;
}


function removeDuplicatesFromStringArray(array) {
  var resultArray = [];
  resultArray = array.filter((v, i, a) => a.indexOf(v) === i);
  console.log("Original Size : " + array.length + " : result size " + resultArray.length)
  return resultArray
}
function removeItemAllFromArray(arr, value, index) {

  if (index === undefined) {
    var i = 0;
    while (i < arr.length) {
      if (arr[i] === value) {
        arr.splice(i, 1);
      } else {
        ++i;
      }
    }
    return arr;
  } else {
    arr.splice(index, 1);
    return arr;
  }

}
function accessControl() {
  // $('body').addClass('cui__menuLeft--toggled');
}

function accessControlTrigger() {
  showloading();
  setTimeout(accessControl, 3000);
}

function requestError(error) {


  console.log(error);
  if (!error.response) {
    // network error
    this.errorStatus = 'Error: Network Error';
    var alertObject = {
      title: "Something Went Wrong",
      type: 'danger',
      message: this.errorStatus
    }
    showAlert(alertObject);
  } else {
    this.errorStatus = error.response.data.message;
    console.log(error.response.data);

    var errorResponse = error.response.data

    var alertObject = {
      title: "Something Went Wrong",
      type: 'danger',
      message: errorResponse.message
    }
    showAlert(alertObject);
  }



}

function slideToggle(t, e, o) { 0 === t.clientHeight ? j(t, e, o, !0) : j(t, e, o) }
function slideUp(t, e, o) { j(t, e, o) }
function slideDown(t, e, o) { j(t, e, o, !0) }
function j(t, e, o, i) { void 0 === e && (e = 400), void 0 === i && (i = !1), t.style.overflow = "hidden", i && (t.style.display = "block"); var p, l = window.getComputedStyle(t), n = parseFloat(l.getPropertyValue("height")), a = parseFloat(l.getPropertyValue("padding-top")), s = parseFloat(l.getPropertyValue("padding-bottom")), r = parseFloat(l.getPropertyValue("margin-top")), d = parseFloat(l.getPropertyValue("margin-bottom")), g = n / e, y = a / e, m = s / e, u = r / e, h = d / e; window.requestAnimationFrame(function l(x) { void 0 === p && (p = x); var f = x - p; i ? (t.style.height = g * f + "px", t.style.paddingTop = y * f + "px", t.style.paddingBottom = m * f + "px", t.style.marginTop = u * f + "px", t.style.marginBottom = h * f + "px") : (t.style.height = n - g * f + "px", t.style.paddingTop = a - y * f + "px", t.style.paddingBottom = s - m * f + "px", t.style.marginTop = r - u * f + "px", t.style.marginBottom = d - h * f + "px"), f >= e ? (t.style.height = "", t.style.paddingTop = "", t.style.paddingBottom = "", t.style.marginTop = "", t.style.marginBottom = "", t.style.overflow = "", i || (t.style.display = "none"), "function" == typeof o && o()) : window.requestAnimationFrame(l) }) }


function distanceBetweenTwoLocations(lat1, lon1, lat2, lon2, unit) {
  if ((lat1 == lat2) && (lon1 == lon2)) {
    return 0;
  }
  else {
    var radlat1 = Math.PI * lat1 / 180;
    var radlat2 = Math.PI * lat2 / 180;
    var theta = lon1 - lon2;
    var radtheta = Math.PI * theta / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") { dist = dist * 1.609344 }
    if (unit == "N") { dist = dist * 0.8684 }
    return dist;
  }
}


// window.onpaint = accessControlTrigger();


export {
  sanitizeID,
  getFinancialYear,
  getDaysinBetween,
  getTimestampfromDate,
  remove_keyvalue,
  slideToggle,
  slideDown,
  store_newvalue,
  get_keyvalue,
  randomstring,
  numberWithCommas,
  getTimestamp,
  getTime,
  getDate,
  getDateandTime,
  validateEmail,
  isvalidusername,
  isvalidcode,
  showloading,
  updateloadingstatus,
  hideloading,
  truncate,
  getDateOfISOWeek,
  padwithzero,
  padwithtripplezero,
  clear_allvalues,
  disableinput,
  enableinput,
  capitalize_Words,
  lowercaseall,
  isNumberKey,
  givepercentage,
  capitalizeSentence,
  success_alert,
  error_alert,
  isInputEmpty,
  getinputAllinLowercase,
  getinputAllinUppercase,
  getinputValue,
  getinputValueInNumbers,
  showAlert,
  firebaseerror,
  hideitem,
  showitem,
  deleteitem,
  reloadPage,
  removeURLParam,
  showpopover,
  showtippy,
  extractContent, info_alert, delay,
  extractkeywordsfromString, isNumeric, excelDateToJSDate,
  removeDuplicatesFromStringArray, isInputValidEmailAddress,
  removeItemAllFromArray, hastwoarrayscommonitem, checkifvalueisnullorundefined,
  signOutUser, directSignout, getLoadingItem, liveTime, getDateUID, distanceBetweenTwoLocations, getDateFromDateUID,
  requestError, getTimefromTimestamp, checkifValueExistsinArrayMap, getUniqueTimeID, textEllipsis, getDatefromTimestamp, getNumberToAmount
};