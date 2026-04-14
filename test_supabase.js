
async function test() {
    const urls = [
        'https://yzpifccqmzawoomhmyjx.supabase.co',
        'https://yzpifccqmpzawoomhmyjx.supabase.co',
        'https://yzpifccqmpzawoomhmyjx.supabase.co/rest/v1/',
        'https://yzpifccqmzawoomhmyjx.supabase.co/rest/v1/'
    ];

    for (const url of urls) {
        try {
            console.log(`Testing ${url}...`);
            const res = await fetch(url);
            console.log(`${url} -> ${res.status}`);
        } catch (e) {
            console.log(`${url} -> FAILED: ${e.message}`);
        }
    }
}

test();
