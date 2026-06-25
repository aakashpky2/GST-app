-- Migration: GST Self Learning App Tables
-- Description: Creates all required tables for GST Self Learning App with RLS and user_id mapping

-- 0. Universal Updated At Trigger Function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 1. Core Business Tables
-- ==========================================

-- Table: business_details
CREATE TABLE IF NOT EXISTS public.business_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    trn TEXT UNIQUE NOT NULL,
    legal_name TEXT,
    trade_name TEXT,
    pan TEXT,
    state_name TEXT,
    district TEXT,
    constitution TEXT,
    casual_taxable BOOLEAN DEFAULT false,
    composition BOOLEAN DEFAULT false,
    commencement_date TEXT,
    liability_date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_business_details_user_id ON public.business_details(user_id);
CREATE INDEX IF NOT EXISTS idx_business_details_trn ON public.business_details(trn);
ALTER TABLE public.business_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own business details" ON public.business_details FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS handle_business_details_updated_at ON public.business_details;
CREATE TRIGGER handle_business_details_updated_at BEFORE UPDATE ON public.business_details FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Table: promoter_partners
CREATE TABLE IF NOT EXISTS public.promoter_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    trn TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    pan TEXT,
    dob DATE,
    mobile TEXT,
    email TEXT,
    designation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_promoter_partners_user_id ON public.promoter_partners(user_id);
ALTER TABLE public.promoter_partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own promoter partners" ON public.promoter_partners FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS handle_promoter_partners_updated_at ON public.promoter_partners;
CREATE TRIGGER handle_promoter_partners_updated_at BEFORE UPDATE ON public.promoter_partners FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Table: authorized_signatories
CREATE TABLE IF NOT EXISTS public.authorized_signatories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    trn TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    pan TEXT,
    mobile TEXT,
    email TEXT,
    designation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_authorized_signatories_user_id ON public.authorized_signatories(user_id);
ALTER TABLE public.authorized_signatories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own authorized signatories" ON public.authorized_signatories FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS handle_authorized_signatories_updated_at ON public.authorized_signatories;
CREATE TRIGGER handle_authorized_signatories_updated_at BEFORE UPDATE ON public.authorized_signatories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Table: additional_places
CREATE TABLE IF NOT EXISTS public.additional_places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    trn TEXT NOT NULL,
    nature_of_business TEXT,
    address JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_additional_places_user_id ON public.additional_places(user_id);
ALTER TABLE public.additional_places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own additional places" ON public.additional_places FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS handle_additional_places_updated_at ON public.additional_places;
CREATE TRIGGER handle_additional_places_updated_at BEFORE UPDATE ON public.additional_places FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Table: goods_and_services
CREATE TABLE IF NOT EXISTS public.goods_and_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    trn TEXT NOT NULL,
    type TEXT,
    hsn_sac_code TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_goods_and_services_user_id ON public.goods_and_services(user_id);
ALTER TABLE public.goods_and_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own goods and services" ON public.goods_and_services FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS handle_goods_and_services_updated_at ON public.goods_and_services;
CREATE TRIGGER handle_goods_and_services_updated_at BEFORE UPDATE ON public.goods_and_services FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================
-- 2. Forms & Submissions
-- ==========================================

CREATE TABLE IF NOT EXISTS public.form_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    trn TEXT NOT NULL,
    tab_name TEXT NOT NULL,
    form_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_form_submissions_user_id ON public.form_submissions(user_id);
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own form submissions" ON public.form_submissions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS handle_form_submissions_updated_at ON public.form_submissions;
CREATE TRIGGER handle_form_submissions_updated_at BEFORE UPDATE ON public.form_submissions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.filing_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    trn TEXT NOT NULL,
    return_type TEXT NOT NULL,
    return_period TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    filed_on TIMESTAMPTZ,
    arn TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_filing_status_user_id ON public.filing_status(user_id);
CREATE INDEX IF NOT EXISTS idx_filing_status_period ON public.filing_status(return_period);
ALTER TABLE public.filing_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own filing status" ON public.filing_status FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS handle_filing_status_updated_at ON public.filing_status;
CREATE TRIGGER handle_filing_status_updated_at BEFORE UPDATE ON public.filing_status FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================
-- 3. GSTR-1 Tables
-- ==========================================

CREATE TABLE IF NOT EXISTS public.gstr1_b2b_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    trn TEXT NOT NULL,
    recipient_gstin TEXT NOT NULL,
    recipient_name TEXT,
    invoice_no TEXT NOT NULL,
    invoice_date TEXT NOT NULL,
    total_invoice_value NUMERIC(15, 2),
    pos TEXT NOT NULL,
    supply_type TEXT,
    tax_items JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gstr1_b2b_user_id ON public.gstr1_b2b_invoices(user_id);
ALTER TABLE public.gstr1_b2b_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own GSTR1 B2B" ON public.gstr1_b2b_invoices FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS handle_gstr1_b2b_updated_at ON public.gstr1_b2b_invoices;
CREATE TRIGGER handle_gstr1_b2b_updated_at BEFORE UPDATE ON public.gstr1_b2b_invoices FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.gstr1_cdnr_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    trn TEXT NOT NULL,
    recipient_gstin TEXT NOT NULL,
    recipient_name TEXT,
    note_no TEXT NOT NULL,
    note_date TEXT NOT NULL,
    note_type TEXT,
    tax_items JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gstr1_cdnr_user_id ON public.gstr1_cdnr_invoices(user_id);
ALTER TABLE public.gstr1_cdnr_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own GSTR1 CDNR" ON public.gstr1_cdnr_invoices FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS handle_gstr1_cdnr_updated_at ON public.gstr1_cdnr_invoices;
CREATE TRIGGER handle_gstr1_cdnr_updated_at BEFORE UPDATE ON public.gstr1_cdnr_invoices FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.gstr1_exports_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    trn TEXT NOT NULL,
    export_type TEXT,
    invoice_no TEXT NOT NULL,
    invoice_date TEXT NOT NULL,
    port_code TEXT,
    shipping_bill_no TEXT,
    shipping_bill_date TEXT,
    tax_items JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gstr1_exp_user_id ON public.gstr1_exports_invoices(user_id);
ALTER TABLE public.gstr1_exports_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own GSTR1 Exports" ON public.gstr1_exports_invoices FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS handle_gstr1_exp_updated_at ON public.gstr1_exports_invoices;
CREATE TRIGGER handle_gstr1_exp_updated_at BEFORE UPDATE ON public.gstr1_exports_invoices FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================
-- 4. GSTR-2A Tables
-- ==========================================

CREATE TABLE IF NOT EXISTS public.gstr2a_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_gstin TEXT NOT NULL,
    supplier_gstin TEXT NOT NULL,
    supplier_name TEXT,
    invoice_number TEXT NOT NULL,
    invoice_date TEXT,
    taxable_value NUMERIC(15, 2) DEFAULT 0.00,
    igst NUMERIC(15, 2) DEFAULT 0.00,
    cgst NUMERIC(15, 2) DEFAULT 0.00,
    sgst NUMERIC(15, 2) DEFAULT 0.00,
    cess NUMERIC(15, 2) DEFAULT 0.00,
    return_period TEXT,
    type TEXT DEFAULT 'B2B',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gstr2a_user_id ON public.gstr2a_invoices(user_id);
ALTER TABLE public.gstr2a_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own GSTR2A" ON public.gstr2a_invoices FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS handle_gstr2a_updated_at ON public.gstr2a_invoices;
CREATE TRIGGER handle_gstr2a_updated_at BEFORE UPDATE ON public.gstr2a_invoices FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================
-- 5. GSTR-2B Tables
-- ==========================================

CREATE TABLE IF NOT EXISTS public.gstr2b_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_gstin TEXT NOT NULL,
    snapshot_month INTEGER NOT NULL,
    snapshot_year INTEGER NOT NULL,
    total_itc_available NUMERIC(15,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gstr2b_user_id ON public.gstr2b_snapshots(user_id);
ALTER TABLE public.gstr2b_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own GSTR2B" ON public.gstr2b_snapshots FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS handle_gstr2b_updated_at ON public.gstr2b_snapshots;
CREATE TRIGGER handle_gstr2b_updated_at BEFORE UPDATE ON public.gstr2b_snapshots FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================
-- 6. Annual Returns (3B, 9, 9C)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.gst_returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    trn TEXT NOT NULL,
    return_type TEXT NOT NULL, -- e.g., 'GSTR-3B', 'GSTR-9', 'GSTR-9C'
    return_period TEXT NOT NULL,
    form_data JSONB,
    status TEXT DEFAULT 'Draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gst_returns_user_id ON public.gst_returns(user_id);
ALTER TABLE public.gst_returns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own GST returns" ON public.gst_returns FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS handle_gst_returns_updated_at ON public.gst_returns;
CREATE TRIGGER handle_gst_returns_updated_at BEFORE UPDATE ON public.gst_returns FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================
-- 7. Payments & Compliance
-- ==========================================

CREATE TABLE IF NOT EXISTS public.payment_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    trn TEXT NOT NULL,
    payment_date TIMESTAMPTZ,
    amount NUMERIC(15, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payment_status_user_id ON public.payment_status(user_id);
ALTER TABLE public.payment_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own payments" ON public.payment_status FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS handle_payment_status_updated_at ON public.payment_status;
CREATE TRIGGER handle_payment_status_updated_at BEFORE UPDATE ON public.payment_status FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.challans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    trn TEXT NOT NULL,
    challan_number TEXT,
    amount NUMERIC(15, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'Generated',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_challans_user_id ON public.challans(user_id);
ALTER TABLE public.challans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own challans" ON public.challans FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS handle_challans_updated_at ON public.challans;
CREATE TRIGGER handle_challans_updated_at BEFORE UPDATE ON public.challans FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    trn TEXT NOT NULL,
    notice_number TEXT,
    notice_date TIMESTAMPTZ,
    description TEXT,
    status TEXT DEFAULT 'Issued',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notices_user_id ON public.notices(user_id);
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own notices" ON public.notices FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS handle_notices_updated_at ON public.notices;
CREATE TRIGGER handle_notices_updated_at BEFORE UPDATE ON public.notices FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.rfn_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    trn TEXT NOT NULL,
    arn TEXT,
    refund_type TEXT,
    amount NUMERIC(15, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'Submitted',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rfn_documents_user_id ON public.rfn_documents(user_id);
ALTER TABLE public.rfn_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own refund docs" ON public.rfn_documents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS handle_rfn_documents_updated_at ON public.rfn_documents;
CREATE TRIGGER handle_rfn_documents_updated_at BEFORE UPDATE ON public.rfn_documents FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own audit logs" ON public.audit_logs FOR SELECT USING (auth.uid() = user_id);
-- No update trigger needed for append-only audit log
