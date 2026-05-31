import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import HomePage from "./landing_page/Home/HomePage";
import Signup from "./landing_page/Signup/Signup";
import AboutPage from "./landing_page/About/AboutPage";
import ProductPage from "./landing_page/Products/ProductsPage";
import PricingPage from "./landing_page/Pricing/PricingPage";
import SupportPage from "./landing_page/Support/SupportPage";

import NotFound from "./landing_page/NotFound";
import Navbar from "./landing_page/Navbar";
import Footer from "./landing_page/Footer";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Navbar />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/Signup" element={<Signup />} />
      <Route path="/About" element={<AboutPage />} />
      <Route path="/Product" element={<ProductPage />} />
      <Route path="/Pricing" element={<PricingPage />} />
      <Route path="/Support" element={<SupportPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    <Footer />
  </BrowserRouter>
);