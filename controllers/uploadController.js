const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.uploadFile = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError('No file uploaded', 400));
    }

    const fileUrl = req.file.path;

    res.status(200).json({
        message: 'File uploaded successfully',
        filePath: fileUrl,
        filename: req.file.filename
    });
});
