
import { useEffect, useRef } from "react";

const LoadingBox = ({ message }) => {
    const ref = useRef(null);
    useEffect(() => {
        import("@lottiefiles/lottie-player");
    }, []);
    return (
        <div className="justify-content-center align-items-center loadingbox align-content-center d-flex flex-row w-100 h-100">
            <div
                className="justify-content-center align-items-center overlay  align-content-center d-flex flex-row w-100 h-100"

            >
                <div className="d-flex flex-column justify-content-center align-items-center mb-5 pb-5" style={{ marginTop: "-70px" }}>

                    <lottie-player
                        id="firstLottie"
                        ref={ref}
                        autoplay

                        loop
                        mode="normal"
                        src="../../../assets/loadingAnim.json"
                        style={{ width: "200px", height: "200px" }}
                    ></lottie-player>

                    <div className="spinner-border text-light d-none" role="status">
                        <span className="sr-only"></span>
                    </div>
                    <div className="d-flex flex-row align-items-end" style={{ marginTop: "-60px" }}>
                        <h5 id="loadingupdatetext" className="my-3 text-xl  text-white">{message}  </h5>
                        <h5 className="text-xl  loader__dot ml-2 my-3 text-white">.</h5>
                        <h5 className="text-xl  loader__dot my-3 text-white">.</h5>
                        <h5 className="text-xl  loader__dot my-3 text-white">.</h5>
                    </div>
                </div>
            </div>
        </div>



    );
}

export default LoadingBox;