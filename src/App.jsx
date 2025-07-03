import { Routes, Route } from "react-router-dom";
import Home from "./frontend/home";
import Profile from "./frontend/profile";
import CampaignForm from "./partner/add_campaign";
import HomePartner from "./partner/home_partner";
import PartnerRegister from "./partner/partner_regist";
import DetailCampaign from "./frontend/booking/detail";
import Checkout from "./frontend/booking/checkout";
import EditCampaign from "./partner/edit_campaign";
import Payment from "./frontend/booking/payment";





function App() {
  

  return (
    
    <Routes>
      <Route path="/" element={<Home/>} />



      <Route path="/home" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/homepartner" element={<HomePartner />} />
      <Route path="/registpartner" element={<PartnerRegister />} />
      <Route path="/campaignform" element={<CampaignForm/>} />
      <Route path="/campaign/:id" element={<DetailCampaign/>} />


      
      <Route path="/checkout/:campaignId" element={<Checkout />} />
      <Route path="/detailcampaign/:id" element={<DetailCampaign />} />
      <Route path="/editcampaign/:id" element={<EditCampaign />} />
      <Route path="/payment/:orderId" element={<Payment />} />
    





    </Routes>
    
   
  );
}

export default App
