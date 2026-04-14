import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Registration from './pages/Registration';
import Login from './pages/Login';
import ForgotUsername from './pages/ForgotUsername';
import ForgotPassword from './pages/ForgotPassword';
import NewUserLogin from './pages/NewUserLogin';
import Dashboard from './pages/Dashboard';
import BusinessDetails from './pages/BusinessDetails';
import PromoterPartners from './pages/PromoterPartners';
import AuthorizedSignatory from './pages/AuthorizedSignatory';
import AuthorizedRepresentative from './pages/AuthorizedRepresentative';
import PrincipalPlaceOfBusiness from './pages/PrincipalPlaceOfBusiness';
import AdditionalPlacesOfBusiness from './pages/AdditionalPlacesOfBusiness';
import GoodsAndServices from './pages/GoodsAndServices';
import StateSpecificInformation from './pages/StateSpecificInformation';
import AadhaarAuthentication from './pages/AadhaarAuthentication';
import Verification from './pages/Verification';
import ReturnsDashboard from './pages/ReturnsDashboard';
import GSTR1Dashboard from './pages/GSTR1Dashboard';
import GSTR1B2BDashboard from './pages/GSTR1B2BDashboard';
import GSTR1B2BAddInvoice from './pages/GSTR1B2BAddInvoice';
import GSTR1B2CLDashboard from './pages/GSTR1B2CLDashboard';
import GSTR1B2CLAddInvoice from './pages/GSTR1B2CLAddInvoice';
import GSTR1ExportsDashboard from './pages/GSTR1ExportsDashboard';
import GSTR1ExportsAddInvoice from './pages/GSTR1ExportsAddInvoice';
import GSTR1B2CSDashboard from './pages/GSTR1B2CSDashboard';
import GSTR1B2CSAddInvoice from './pages/GSTR1B2CSAddInvoice';
import GSTR1NilRatedDashboard from './pages/GSTR1NilRatedDashboard';
import GSTR1NilRatedAddInvoice from './pages/GSTR1NilRatedAddInvoice';
import GSTR1CDNRDashboard from './pages/GSTR1CDNRDashboard';
import GSTR1CDNRAddInvoice from './pages/GSTR1CDNRAddInvoice';
import GSTR1CDNURDashboard from './pages/GSTR1CDNURDashboard';
import GSTR1CDNURAddInvoice from './pages/GSTR1CDNURAddInvoice';
import GSTR1AdvTaxDashboard from './pages/GSTR1AdvTaxDashboard';
import GSTR1AdvTaxAddDetails from './pages/GSTR1AdvTaxAddDetails';
import GSTR1AdjAdvancesDashboard from './pages/GSTR1AdjAdvancesDashboard';
import GSTR1AdjAdvancesAddDetails from './pages/GSTR1AdjAdvancesAddDetails';
import GSTR1HSNSummary from './pages/GSTR1HSNSummary';
import GSTR1DocumentsIssued from './pages/GSTR1DocumentsIssued';
import GSTR1ECOSupplies from './pages/GSTR1ECOSupplies';
import GSTR1ECOAddRecord from './pages/GSTR1ECOAddRecord';
import GSTR1Supplies95Dashboard from './pages/GSTR1Supplies95Dashboard';
import GSTR1Supplies95AddDetails from './pages/GSTR1Supplies95AddDetails';
import GSTR1Summary from './pages/GSTR1Summary';
import AnnualReturn from './pages/AnnualReturn';
import GSTR9Questionnaire from './pages/GSTR9Questionnaire';
import Logout from './pages/Logout';
import ChangePassword from './pages/ChangePassword';
import ReasonForChallan from './pages/ReasonForChallan';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-username" element={<ForgotUsername />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/new-login" element={<NewUserLogin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/returns-dashboard" element={<ReturnsDashboard />} />
          <Route path="/returns/gstr1" element={<GSTR1Dashboard />} />
          <Route path="/returns/annual-return" element={<AnnualReturn />} />
          <Route path="/returns/gstr9/questionnaire" element={<GSTR9Questionnaire />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/returns/gstr1/summary" element={<GSTR1Summary />} />
          <Route path="/returns/gstr1/b2b" element={<GSTR1B2BDashboard />} />
          <Route path="/returns/gstr1/b2b/add" element={<GSTR1B2BAddInvoice />} />
          <Route path="/returns/gstr1/b2cl" element={<GSTR1B2CLDashboard />} />
          <Route path="/returns/gstr1/b2cl/add" element={<GSTR1B2CLAddInvoice />} />
          <Route path="/returns/gstr1/exports" element={<GSTR1ExportsDashboard />} />
          <Route path="/returns/gstr1/exports/add" element={<GSTR1ExportsAddInvoice />} />
          <Route path="/returns/gstr1/b2cs" element={<GSTR1B2CSDashboard />} />
          <Route path="/returns/gstr1/b2cs/add" element={<GSTR1B2CSAddInvoice />} />
          <Route path="/returns/gstr1/nilrated" element={<GSTR1NilRatedDashboard />} />
          <Route path="/returns/gstr1/nilrated/add" element={<GSTR1NilRatedAddInvoice />} />
          <Route path="/returns/gstr1/cdnr" element={<GSTR1CDNRDashboard />} />
          <Route path="/returns/gstr1/cdnr/add" element={<GSTR1CDNRAddInvoice />} />
          <Route path="/returns/gstr1/cdnur" element={<GSTR1CDNURDashboard />} />
          <Route path="/returns/gstr1/cdnur/add" element={<GSTR1CDNURAddInvoice />} />
          <Route path="/returns/gstr1/advtax" element={<GSTR1AdvTaxDashboard />} />
          <Route path="/returns/gstr1/advtax/add" element={<GSTR1AdvTaxAddDetails />} />
          <Route path="/returns/gstr1/adjadvances" element={<GSTR1AdjAdvancesDashboard />} />
          <Route path="/returns/gstr1/adjadvances/add" element={<GSTR1AdjAdvancesAddDetails />} />
          <Route path="/returns/gstr1/hsn" element={<GSTR1HSNSummary />} />
          <Route path="/returns/gstr1/documents" element={<GSTR1DocumentsIssued />} />
          <Route path="/returns/gstr1/eco" element={<GSTR1ECOSupplies />} />
          <Route path="/returns/gstr1/eco/add" element={<GSTR1ECOAddRecord />} />
          <Route path="/returns/gstr1/sup95" element={<GSTR1Supplies95Dashboard />} />
          <Route path="/returns/gstr1/sup95/add" element={<GSTR1Supplies95AddDetails />} />
          <Route path="/business-details" element={<BusinessDetails />} />

          <Route path="/promoter-partners" element={<PromoterPartners />} />
          <Route path="/authorized-signatory" element={<AuthorizedSignatory />} />
          <Route path="/authorized-representative" element={<AuthorizedRepresentative />} />
          <Route path="/principal-place-of-business" element={<PrincipalPlaceOfBusiness />} />
          <Route path="/additional-places-of-business" element={<AdditionalPlacesOfBusiness />} />
          <Route path="/goods-and-services" element={<GoodsAndServices />} />
          <Route path="/state-specific-information" element={<StateSpecificInformation />} />
          <Route path="/aadhaar-authentication" element={<AadhaarAuthentication />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/payment/challan-reason" element={<ReasonForChallan />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
