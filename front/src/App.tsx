import './App.css'
import {RouterProvider} from "react-router";
import router from "./routers/router.tsx";

const LandingPage = () => {
    return (
        <RouterProvider router={router}/>
    )
}

export default LandingPage;
