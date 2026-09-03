import fs from 'fs';
import path from 'path';

// Manually load .env since we don't have dotenv
const envPath = path.resolve('.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) return;
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
            process.env[key.trim()] = value;
            console.log(`Loaded ${key.trim()} = ${value.substring(0, 5)}...`);
        }
    });
}

console.log('RESEND_API_KEY in process.env:', process.env.RESEND_API_KEY ? 'Present' : 'Missing');


async function testHandler() {
    console.log('🚀 Starting direct handler test...');
    
    // Dynamic import to ensure process.env is populated before the module top-level code runs
    const { default: handler } = await import('./api/contact.js');
    
    const req = {
        method: 'POST',
        body: {
            fullName: 'Antigravity Test',
            email: 'test@example.com',
            phone: '1234567890',
            company: 'Google DeepMind',
            service: 'Direct Handler Test',
            message: 'This is a test message sent by calling the handler directly from a script to bypass Vercel CLI login issues.'
        }
    };

    const res = {
        status: (code) => {
            console.log(`HTTP Status: ${code}`);
            return res;
        },
        json: (data) => {
            console.log('Response JSON:', JSON.stringify(data, null, 2));
            return res;
        },
        setHeader: (name, value) => {
            // console.log(`Header set: ${name} = ${value}`);
            return res;
        },
        end: () => {
            console.log('Response ended.');
            return res;
        }
    };

    try {
        await handler(req, res);
    } catch (error) {
        console.error('Test failed with error:', error);
    }
}

testHandler();
