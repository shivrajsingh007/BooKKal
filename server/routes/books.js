const express = require('express');
const router = express.Router();
const { getBooks, getBook, createBook, updateBook, deleteBook, getMyBooks } = require('../controllers/bookController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getBooks);
router.get('/my-books', protect, getMyBooks);
router.get('/:id', getBook);
router.post('/', protect, upload.single('image'), createBook);
router.put('/:id', protect, upload.single('image'), updateBook);
router.delete('/:id', protect, deleteBook);

module.exports = router;
