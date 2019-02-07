const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/', catchErrors(storeController.getStore));
router.get('/add', storeController.addStore);
router.post('/add', catchErrors(storeController.createStore));
router.get('/stores', storeController.getStore);
router.get('/store/:id/edit', catchErrors(storeController.editStore));
router.post('/add/:id', catchErrors(storeController.updateStore));

module.exports = router;
