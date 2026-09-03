// test.js
// This script sends a test POST request to your locally running Vercel server.
// Command to run this file: node test.js

async function runTest() {
    const url = 'http://127.0.0.1:3000/api/contact';

    const payload = {
        fullName: 'Test Automation',
        email: 'test@example.com',
        phone: '2341234567',
        company: 'KHAHUS Testing Organization',
        service: 'Management Consulting',
        message: 'This is a beautiful test message to ensure the Resend API configuration is passing through perfectly in both text and HTML.',
    };

    console.log(`Sending POST request to ${url}...`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Success! Email fired correctly.');
            console.log('Response Details:', data);
        } else {
            console.error('❌ Error testing API:', response.status, response.statusText);
            console.error('Response Details:', data);
            console.log('\nMake sure your .env file has a valid RESEND_API_KEY!');
        }
    } catch (error) {
        console.error('❌ Failed to reach the API locally.');
        console.error('Make sure `npx vercel dev` is actively running in another terminal window and listening on port 3000.');
        console.error('Error Details:', error.message);
    }
}

runTest();
