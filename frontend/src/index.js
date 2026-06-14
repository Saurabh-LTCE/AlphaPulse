import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

import HomePage from "./landing_page/Home/HomePage";
import AboutPage from "./landing_page/About/AboutPage";
import ProductPage from "./landing_page/Products/ProductsPage";
import PricingPage from "./landing_page/Pricing/PricingPage";
import SupportPage from "./landing_page/Support/SupportPage";

import NotFound from "./landing_page/NotFound";
import Navbar from "./landing_page/Navbar";
import Footer from "./landing_page/Footer";

 import Login from "./pages/Login";
 import Signup from "./pages/Signup";
import Home from "./pages/Home";



const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Navbar />
    <Routes>
      <Route path="/" element={<HomePage />} />
      { <Route path="/Signup" element={<Signup />} /> }
      { <Route path="/Login" element={<Login />} /> }
      { <Route path="/Home" element={<Home />} /> }
      <Route path="/About" element={<AboutPage />} />
      <Route path="/Product" element={<ProductPage />} />
      <Route path="/Pricing" element={<PricingPage />} />
      <Route path="/Support" element={<SupportPage />} />
      <Route path="*" element={<NotFound />} />

    </Routes>
    <Footer />
    <ToastContainer />
  </BrowserRouter>
); 