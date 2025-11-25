import { BrowserRouter, Route, Routes } from "react-router-dom";
import SolicitanteHome from "../pages/Home/SolicitanteHome";
import HomePage from "../pages/HomePage";
import Layout from "../pages/Layout";
import LoginPage from "../pages/LoginPage";
import PerfilPage from "../pages/PerfilPage";
import RegisterPage from "../pages/RegisterPage";
import SolicitudesFinalizadas from "../pages/SolicitudesFinalizadas";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<Layout><HomePage /></Layout>} />
        <Route path="/solicitud" element={<Layout><SolicitanteHome /></Layout>} />
        <Route path="/solicitudes-finalizadas" element={<Layout><SolicitudesFinalizadas /></Layout>} />
        <Route path="/perfil" element={<Layout><PerfilPage /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
