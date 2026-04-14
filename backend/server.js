const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const dns = require('node:dns');

// Fix for ENOTFOUND errors in specific network environments
const originalLookup = dns.lookup;
dns.lookup = (hostname, options, callback) => {
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }
    if (hostname === 'yzpifccqmzawoomhmyjx.supabase.co') {
        return callback(null, [{ address: '104.18.38.10', family: 4 }], 4);
    }
    return originalLookup(hostname, options, callback);
};

// Load env vars
dotenv.config();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Route files
const authRoutes = require('./routes/auth');
const registrationRoutes = require('./routes/registration');
const businessDetailsRoutes = require('./routes/businessDetails');
const formsRoutes = require('./routes/forms');

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/registration', registrationRoutes);
app.use('/api/business-details', businessDetailsRoutes);
app.use('/api/forms', formsRoutes);

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('GST Self Learning App API (Supabase) is running...');
});

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`Connected to Supabase Project: ${process.env.SUPABASE_URL || 'Not Configured Yet'}`);
});
