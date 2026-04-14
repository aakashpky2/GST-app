const dns = require('node:dns');

// Monkey-patch dns.lookup for Supabase endpoint
const originalLookup = dns.lookup;
dns.lookup = (hostname, options, callback) => {
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }
    if (hostname.includes('supabase.co')) {
        return callback(null, [{ address: '104.18.38.10', family: 4 }], 4);
    }
    return originalLookup(hostname, options, callback);
};

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL and Key are required in .env file');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;

