const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'phv-resenha',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 1200, quality: 'auto' }]
    }
});

const audioStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'phv-resenha-audio',
        resource_type: 'auto',
        allowed_formats: ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'webm']
    }
});

const mixedStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        if (file.mimetype.startsWith('audio/')) {
            return {
                folder: 'phv-resenha-audio',
                resource_type: 'auto',
                allowed_formats: ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'webm']
            };
        }
        return {
            folder: 'phv-resenha',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            transformation: [{ width: 1200, quality: 'auto' }]
        };
    }
});

module.exports = { cloudinary, storage, audioStorage, mixedStorage };
