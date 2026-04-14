import dns from 'node:dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

async function test() {
    const url = 'https://yzpifccqmzawoomhmyjx.supabase.co';
    try {
        console.log(`Testing ${url} with custom DNS...`);
        const res = await fetch(url);
        console.log(`${url} -> ${res.status}`);
    } catch (e) {
        console.log(`${url} -> FAILED: ${e.message}`);
    }
}

test();
