exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ message: 'No file uploaded' });
        }

        
        const fileUrl = req.file.path;

        res.status(200).json({
            message: 'File uploaded successfully',
            filePath: fileUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Error in uploadFile:', error);
        res.status(500).send({ message: 'Server error during upload' });
    }
};
