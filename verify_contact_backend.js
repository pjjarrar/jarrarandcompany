const { initDatabase, createMessage, getDb } = require('./database');

async function testContactBackend() {
    try {
        await initDatabase();
        console.log('Database initialized.');

        // Test creating a message
        const testMessage = {
            name: 'Test Verify',
            email: 'test@verify.com',
            phone: '1234567890',
            message: 'This is a test message from verification script.'
        };

        const result = await createMessage(testMessage);
        console.log('Message created successfully:', result);

        // Verify it exists in DB
        const db = getDb();
        db.get('SELECT * FROM messages WHERE email = ?', ['test@verify.com'], (err, row) => {
            if (err) {
                console.error('Error fetching message:', err);
                process.exit(1);
            }
            if (row && row.message === testMessage.message) {
                console.log('Verification SUCCESS: Message found in database.');
                process.exit(0);
            } else {
                console.error('Verification FAILED: Message not found or mismatch.');
                console.log('Row found:', row);
                process.exit(1);
            }
        });

    } catch (error) {
        console.error('Test failed with error:', error);
        process.exit(1);
    }
}

testContactBackend();
