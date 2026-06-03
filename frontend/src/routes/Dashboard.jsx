import axios from "axios";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import DashboardNavbar from "../components/DashboardNavbar";
import DashboardContent from "../components/DashboardContent";

const DashBoard = () => {
  return (
    <>
      <DashboardNavbar />
      <Sidebar />
      <DashboardContent />
    </>
  );
};
export default DashBoard;
