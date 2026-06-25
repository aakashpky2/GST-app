const fs = require('fs');
const path = require('path');

const fileMap = {
    'GSTR1B2CLDashboard.jsx': 'gstr1_b2cl_invoices',
    'GSTR1ExportsDashboard.jsx': 'gstr1_exports_invoices',
    'GSTR1B2CSDashboard.jsx': 'gstr1_b2cs_invoices',
    'GSTR1NilRatedDashboard.jsx': 'gstr1_nil_rated_supplies',
    'GSTR1CDNRDashboard.jsx': 'gstr1_cdnr_invoices',
    'GSTR1CDNURDashboard.jsx': 'gstr1_cdnur_invoices',
    'GSTR1AdvTaxDashboard.jsx': 'gstr1_adv_tax',
    'GSTR1AdjAdvancesDashboard.jsx': 'gstr1_adj_advances',
    'GSTR1HSNSummary.jsx': 'gstr1_hsn_summary',
    'GSTR1DocumentsIssued.jsx': 'gstr1_docs_issued',
    'GSTR1ECOSupplies.jsx': 'gstr1_eco',
    'GSTR1Supplies95Dashboard.jsx': 'gstr1_sup95'
};

const dir = path.join(__dirname, 'frontend', 'src', 'pages');

for (const [file, table] of Object.entries(fileMap)) {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) continue;
    
    let content = fs.readFileSync(filePath, 'utf8');

    // Add import if missing
    if (!content.includes('gstr1Service')) {
        content = content.replace(/import api from '\.\.\/api\/axios';/g, "import api from '../api/axios';\nimport gstr1Service from '../services/gstr1Service';");
    }

    // Determine state setter
    let setter = 'setInvoices(';
    if (content.includes('setRecords(')) setter = 'setRecords(';
    if (content.includes('setDocuments(')) setter = 'setDocuments(';
    if (content.includes('setDocRecords(')) setter = 'setDocRecords('; // For DocumentsIssued
    if (file === 'GSTR1HSNSummary.jsx') setter = 'setHsnRecords(';
    if (file === 'GSTR1ECOSupplies.jsx') setter = 'setRecords(';

    // Pattern to match:
    // const res = await api.get(`/forms/tab/${trn}/...`);
    // [any spacing]
    // if (res.data.success && res.data.data) {
    //   ... (anything including braces)
    // }
    // We can use a regex that looks for `const res = await api.get(` ... down to the first `} catch (`
    
    // Instead of regex, let's use standard string replacement for the fetch block.
    // The try block ALWAYS starts with:
    // try {
    //     const trn = ...
    // Let's replace the whole try...catch body manually if we can, or just use regex.
    
    const apiGetRegex = /const\s+res\s*=\s*await\s+api\.get\([^)]+\);\s*if\s*\(\s*res\.data\.success\s*&&\s*res\.data\.data\s*\)\s*\{[\s\S]*?(?=\}\s*catch\s*\()/;
    
    let replacement = `const res = await gstr1Service.getGstr1Records('${table}', trn);

                if (res.success && res.data) {
                    ${setter}res.data);
                } else {
                    ${setter}[]);
                }
            `;
            
    // Wait! GSTR1DocumentsIssued has special grouping logic!
    if (file === 'GSTR1DocumentsIssued.jsx') {
        replacement = `const res = await gstr1Service.getGstr1Records('${table}', trn);

                if (res.success && res.data) {
                    const docs = res.data || [];
                    const grouped = {};
                    docs.forEach(doc => {
                        if (!grouped[doc.category]) grouped[doc.category] = [];
                        grouped[doc.category].push(doc);
                    });
                    setDocRecords(grouped);
                } else {
                    setDocRecords({});
                }
            `;
    }

    content = content.replace(apiGetRegex, replacement);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Processed ${file}`);
}
