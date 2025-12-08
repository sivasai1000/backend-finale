const pool = require('../config/database');

exports.getBanners = async (req, res) => {
    try {
        const [banners] = await pool.query('SELECT * FROM Banners WHERE isActive = TRUE ORDER BY createdAt DESC');
        res.json(banners);
    } catch (error) {
        console.error('Error fetching banners:', error);
        res.status(500).json({ message: 'Server error fetching banners' });
    }
};

exports.subscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Check if already subscribed
        const [existing] = await pool.query('SELECT * FROM Subscribers WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Already subscribed' });
        }

        await pool.query('INSERT INTO Subscribers (email) VALUES (?)', [email]);

        res.status(201).json({ message: 'Successfully subscribed to newsletter' });
    } catch (error) {
        console.error('Error subscribing to newsletter:', error);
        res.status(500).json({ message: 'Server error subscribing to newsletter' });
    }
};

exports.createBanner = async (req, res) => {
    try {
        const { title, subtitle, linkUrl } = req.body;

        let imageUrl = null;
        if (req.file) {
            if (req.file.path.startsWith('http')) {
                imageUrl = req.file.path;
            } else {
                imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
            }
        }

        if (!imageUrl) {
            return res.status(400).json({ message: 'Image is required' });
        }

        await pool.query(
            'INSERT INTO Banners (title, subtitle, imageUrl, linkUrl) VALUES (?, ?, ?, ?)',
            [title, subtitle, imageUrl, linkUrl]
        );

        res.status(201).json({ message: 'Banner created successfully' });
    } catch (error) {
        console.error('Error creating banner:', error);
        res.status(500).json({ message: 'Server error creating banner' });
    }
};

exports.deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM Banners WHERE id = ?', [id]);
        res.json({ message: 'Banner deleted successfully' });
    } catch (error) {
        console.error('Error deleting banner:', error);
        res.status(500).json({ message: 'Server error deleting banner' });
    }
};

exports.getAllSubscribers = async (req, res) => {
    try {
        const [subscribers] = await pool.query('SELECT * FROM Subscribers ORDER BY subscribedAt DESC');
        res.json(subscribers);
    } catch (error) {
        console.error('Error fetching subscribers:', error);
        res.status(500).json({ message: 'Server error fetching subscribers' });
    }
};

exports.getAbout = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM About LIMIT 1');
        if (rows.length === 0) {
            return res.json({ title: '', description: '', imageUrl: '' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching about:', error);
        res.status(500).json({ message: 'Server error fetching about content' });
    }
};

exports.updateAbout = async (req, res) => {
    try {
        const { title, description } = req.body;

        let imageUrl = undefined;
        if (req.file) {
            if (req.file.path.startsWith('http')) {
                imageUrl = req.file.path;
            } else {
                imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
            }
        }

        // Check if row exists
        const [rows] = await pool.query('SELECT * FROM About LIMIT 1');

        if (rows.length === 0) {
            // Insert
            await pool.query(
                'INSERT INTO About (title, description, imageUrl) VALUES (?, ?, ?)',
                [title, description, imageUrl || null]
            );
        } else {
            // Update
            let sql = 'UPDATE About SET title = ?, description = ?';
            const params = [title, description];

            if (imageUrl) {
                sql += ', imageUrl = ?';
                params.push(imageUrl);
            }

            sql += ' WHERE id = ?';
            params.push(rows[0].id);

            await pool.query(sql, params);
        }

        res.json({ message: 'About content updated successfully' });
    } catch (error) {
        console.error('Error updating about:', error);
        res.status(500).json({ message: 'Server error updating about content' });
    }
};
