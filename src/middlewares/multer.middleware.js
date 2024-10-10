import multer from 'multer';

// Set up storage for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/temp'); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// File filter to accept only certain types
const fileFilter = (req, file, cb) => {
  const acceptableMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  if (acceptableMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Invalid file type. Only images are allowed!'), false);
  }
};

// Initialize Multer with storage and file filter
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 } // 5MB limit
});
