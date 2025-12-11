
async function main() {
    console.log('Testing Combo API...');
    try {
        const res = await fetch('http://localhost:3000/api/admin/combos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'API Test Combo With Image',
                slug: 'api-test-combo-img-' + Date.now(),
                price: 150,
                image: '/uploads/test.jpg',
                items: []
            })
        });

        if (res.ok) {
            console.log('✅ API Success! Status:', res.status);
            const json = await res.json();
            console.log('Response:', json);
            // clean up if needed
        } else {
            console.log('❌ API Failed! Status:', res.status);
            const text = await res.text();
            console.log('Body:', text);
        }
    } catch (e: any) {
        console.error('❌ Network/Script Error:', e.message);
    }
}

main();
