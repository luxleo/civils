import {createBrowserRouter} from "react-router";
import {lazy} from "react";

const LandingPage = lazy(() => import('@/pages/LandingPage.tsx')); // TODO: import 인식 못하는 문제 해결하기.. 거슬린다.
const BeamPage = lazy(() => import('@/pages/BeamPage/BeamPage.tsx'));
const router = createBrowserRouter([
    {
        index: true,
        Component: BeamPage,
    }
]);

export default router;