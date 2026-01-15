const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.db');

let db;

// Initialize database
function initDatabase() {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Error opening database:', err);
                reject(err);
                return;
            }
            console.log('Connected to SQLite database');
            createTables().then(() => {
                seedAdminUser().then(() => {
                    resolve();
                }).catch(reject);
            }).catch(reject);
        });
    });
}

// Create tables
function createTables() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Users table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) {
                    console.error('Error creating users table:', err);
                    reject(err);
                    return;
                }
            });

            // Bids table
            db.run(`CREATE TABLE IF NOT EXISTS bids (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                status TEXT NOT NULL CHECK(status IN ('Active', 'Not Active')),
                estimator_name TEXT NOT NULL,
                estimator_email TEXT NOT NULL,
                bid_date TEXT NOT NULL,
                bid_time TEXT NOT NULL,
                gc_name TEXT NOT NULL,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) {
                    console.error('Error creating bids table:', err);
                    reject(err);
                    return;
                }
            });

            // Messages table
            db.run(`CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT,
                message TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) {
                    console.error('Error creating messages table:', err);
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    });
}

// Seed initial admin user
function seedAdminUser() {
    return new Promise((resolve, reject) => {
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@jarrarandcompany.com';

        db.get('SELECT * FROM users WHERE username = ?', [adminUsername], (err, row) => {
            if (err) {
                reject(err);
                return;
            }

            if (!row) {
                const hashedPassword = bcrypt.hashSync(adminPassword, 10);
                db.run(
                    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                    [adminUsername, adminEmail, hashedPassword],
                    (err) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        console.log(`Admin user created (username: ${adminUsername})`);
                        resolve();
                    }
                );
            } else {
                resolve();
            }
        });
    });
}

// Database helper functions
function getDb() {
    return db;
}

// Get all bids
function getAllBids() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM bids ORDER BY created_at DESC', [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

// Get bid by ID
function getBidById(id) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM bids WHERE id = ?', [id], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row);
        });
    });
}

// Create bid
function createBid(bid) {
    return new Promise((resolve, reject) => {
        const { title, status, estimator_name, estimator_email, bid_date, bid_time, gc_name, description } = bid;
        db.run(
            `INSERT INTO bids (title, status, estimator_name, estimator_email, bid_date, bid_time, gc_name, description)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, status, estimator_name, estimator_email, bid_date, bid_time, gc_name, description || ''],
            function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({ id: this.lastID, ...bid });
            }
        );
    });
}

// Update bid
function updateBid(id, bid) {
    return new Promise((resolve, reject) => {
        const { title, status, estimator_name, estimator_email, bid_date, bid_time, gc_name, description } = bid;
        db.run(
            `UPDATE bids 
             SET title = ?, status = ?, estimator_name = ?, estimator_email = ?, bid_date = ?, 
                 bid_time = ?, gc_name = ?, description = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [title, status, estimator_name, estimator_email, bid_date, bid_time, gc_name, description || '', id],
            function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                if (this.changes === 0) {
                    reject(new Error('Bid not found'));
                    return;
                }
                resolve({ id, ...bid });
            }
        );
    });
}

// Delete bid
function deleteBid(id) {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM bids WHERE id = ?', [id], function (err) {
            if (err) {
                reject(err);
                return;
            }
            if (this.changes === 0) {
                reject(new Error('Bid not found'));
                return;
            }
            resolve();
        });
    });
}

// Get all users
function getAllUsers() {
    return new Promise((resolve, reject) => {
        db.all('SELECT id, username, email, created_at FROM users ORDER BY created_at DESC', [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

// Get user by ID
function getUserById(id) {
    return new Promise((resolve, reject) => {
        db.get('SELECT id, username, email, created_at FROM users WHERE id = ?', [id], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row);
        });
    });
}

// Get user by username
function getUserByUsername(username) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row);
        });
    });
}

// Get user by email
function getUserByEmail(email) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row);
        });
    });
}

// Get user by username or email
function getUserByUsernameOrEmail(identifier) {
    return new Promise((resolve, reject) => {
        // Try username first, then email
        db.get('SELECT * FROM users WHERE username = ? OR email = ?', [identifier, identifier], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row);
        });
    });
}

// Create user
function createUser(user) {
    return new Promise((resolve, reject) => {
        const { username, email, password } = user;
        const hashedPassword = bcrypt.hashSync(password, 10);
        db.run(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint')) {
                        reject(new Error('Username or email already exists'));
                        return;
                    }
                    reject(err);
                    return;
                }
                resolve({ id: this.lastID, username, email });
            }
        );
    });
}

// Update user
function updateUser(id, user) {
    return new Promise((resolve, reject) => {
        const { username, email, password } = user;
        let query, params;

        if (password) {
            const hashedPassword = bcrypt.hashSync(password, 10);
            query = 'UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?';
            params = [username, email, hashedPassword, id];
        } else {
            query = 'UPDATE users SET username = ?, email = ? WHERE id = ?';
            params = [username, email, id];
        }

        db.run(query, params, function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint')) {
                    reject(new Error('Username or email already exists'));
                    return;
                }
                reject(err);
                return;
            }
            if (this.changes === 0) {
                reject(new Error('User not found'));
                return;
            }
            resolve({ id, username, email });
        });
    });
}

// Create message
function createMessage(messageData) {
    return new Promise((resolve, reject) => {
        const { name, email, phone, message } = messageData;
        db.run(
            'INSERT INTO messages (name, email, phone, message) VALUES (?, ?, ?, ?)',
            [name, email, phone || '', message],
            function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({ id: this.lastID, ...messageData });
            }
        );
    });
}

// Delete user
function deleteUser(id) {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
            if (err) {
                reject(err);
                return;
            }
            if (this.changes === 0) {
                reject(new Error('User not found'));
                return;
            }
            resolve();
        });
    });
}

module.exports = {
    initDatabase,
    getDb,
    getAllBids,
    getBidById,
    createBid,
    updateBid,
    deleteBid,
    getAllUsers,
    getUserById,
    getUserByUsername,
    getUserByEmail,
    getUserByUsernameOrEmail,
    createUser,
    updateUser,
    deleteUser,
    createMessage
};

