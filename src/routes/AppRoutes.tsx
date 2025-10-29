import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import HomePage from "../pages/HomePage";
import SolicitanteHome from "../pages/Home/SolicitanteHome";
const  AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />}/>
        <Route path="/register" element={<RegisterPage />}/>
        <Route path="/home" element={<HomePage/>}/>
        <Route path="/solicitud" element={<SolicitanteHome/>}/>
      </Routes>
    </BrowserRouter>
  );
};
export default AppRoutes;
