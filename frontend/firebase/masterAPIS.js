
import { app, db, auth } from "./firebaseconfig";
import { getFunctions,  httpsCallable } from "firebase/functions";
const functions = getFunctions(app);
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

export const RequestreservationDetails = async (reservationnumber) => {
    const getreservationDetails = httpsCallable(functions, 'reservation-getReservationDetails');
    var data = getreservationDetails({ reservationnumber })
        .then((result) => {
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

export const RequestconfirmStockReceive = async (materialdetails, log) => {
    const confirmStockReceive = httpsCallable(functions, 'stocktransferv2-confirmStockReceive');
    var data = confirmStockReceive({ materialdetails, log })
        .then((result) => {
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

export const RequestmaterialAvailabilityCheck = async (requestData) => {
    const materialAvailabilityCheck = httpsCallable(functions, 'prodconfirmation-materialAvailabilityCheck');
    var data = materialAvailabilityCheck({ ...requestData })
        .then((result) => {
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



export const RequestgetPlanOrder = async (requestData) => {
    const getPlanOrder = httpsCallable(functions, 'prodconfirmation-getPlanOrder');
    var data = getPlanOrder({ ...requestData })
        .then((result) => {
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

export const RequestplanOrderToProductionOrder = async (requestData) => {
    const planOrderToProductionOrder = httpsCallable(functions, 'prodconfirmation-planOrderToProductionOrder');
    var data = planOrderToProductionOrder({ ...requestData })
        .then((result) => {
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


export const RequestproductionRelease = async (requestData) => {
    const productionRelease = httpsCallable(functions, 'prodconfirmation-productionRelease');
    var data = productionRelease({ ...requestData })
        .then((result) => {
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

export const RequestproductionOrderConfirmation = async (requestData) => {
    const productionOrderConfirmation = httpsCallable(functions, 'prodconfirmation-productionOrderConfirmation');
    var data = productionOrderConfirmation({ ...requestData })
        .then((result) => {
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


export const RequestgetProductionOrder = async (requestData) => {
    const getProductionOrder = httpsCallable(functions, 'scanning-getProductionOrder');
    var data = getProductionOrder({ ...requestData })
        .then((result) => {
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

export const RequestproductionOrderConfirmFG = async (requestData) => {
    const productionOrderConfirmFG = httpsCallable(functions, 'scanning-productionOrderConfirmFG');
    var data = productionOrderConfirmFG({ ...requestData })
        .then((result) => {
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

export const RequestgetStorageLocationMaterials = async (requestData) => {
    const getStorageLocationMaterials = httpsCallable(functions, 'getStorageLocationMaterials');
    var data = getStorageLocationMaterials({ ...requestData })
        .then((result) => {
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
export const RequestgetStorageLocation = async (requestData) => {
    const getStorageLocation = httpsCallable(functions, 'getStorageLocation');
    var data = getStorageLocation({ ...requestData })
        .then((result) => {
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
export const RequestgetStorageLocationForMaterials = async (requestData) => {
    const getStorageLocationForMaterials = httpsCallable(functions, 'getStorageLocationForMaterials', { timeout: 180000 });
    var data = getStorageLocationForMaterials({ ...requestData })
        .then((result) => {
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
export const RequestgetAllStorageLocations = async (requestData) => {
    const getAllStorageLocations = httpsCallable(functions, 'getAllStorageLocations');
    var data = getAllStorageLocations({ ...requestData })
        .then((result) => {
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

export const RequestgetStockReport = async (requestData) => {
    const getStockReport = httpsCallable(functions, 'reports-getStockReport');
    var data = getStockReport({ ...requestData })
        .then((result) => {
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

export const RequestgetBOMReport = async (requestData) => {
    const getBOMReport = httpsCallable(functions, 'reports-getBOMReport');
    var data = getBOMReport({ ...requestData })
        .then((result) => {
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

export const RequestgetStockForStorageLocation = async (requestData) => {
    const getStockForStorageLocation = httpsCallable(functions, 'stocktransferv2-getStockForStorageLocation', { timeout: 180000 });
    var data = getStockForStorageLocation({ ...requestData })
        .then((result) => {
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
