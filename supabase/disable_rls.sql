-- Run this in your Supabase SQL Editor to disable RLS
-- This is necessary because the Node.js backend uses a single API key and does not use Supabase Auth.

ALTER TABLE public.business_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.promoter_partners DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.authorized_signatories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.additional_places DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods_and_services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.filing_status DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gstr1_b2b_invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gstr1_cdnr_invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gstr1_exports_invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gstr2a_invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gstr2b_snapshots DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gst_returns DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_status DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.challans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfn_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;

-- If you have other tables created later, disable RLS for them as well:
ALTER TABLE IF EXISTS public.gstr1_b2cl_invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gstr1_b2cs_invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gstr1_nil_rated_supplies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gstr1_cdnur_invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gstr1_adv_tax DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gstr1_adj_advances DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gstr1_hsn_summary DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gstr1_docs_issued DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gstr1_eco_supplies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gstr1_sup95 DISABLE ROW LEVEL SECURITY;
