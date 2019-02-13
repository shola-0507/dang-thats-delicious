const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/', catchErrors(storeController.getStore));
router.get('/stores', storeController.getStore);
router.get('/add', authController.mustBeLoggedIn, storeController.addStore);

router.post('/add', 
    storeController.upload, 
    catchErrors(storeController.resize), 
    catchErrors(storeController.createStore)
);

router.post('/add/:id',
    storeController.upload,
    catchErrors(storeController.resize),
    catchErrors(storeController.updateStore)
);

router.get('/store/:id/edit', catchErrors(storeController.editStore));
router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));

router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tag/:tag', catchErrors(storeController.getStoresByTag));

router.get('/login', userController.loginForm);
router.get('/register', userController.registerForm);

router.get('/logout', authController.logout);

router.post('/register', 
    userController.validateRegister,
    catchErrors(userController.register),
    authController.login
);

router.post('/login', authController.login);

router.get('/account', userController.account);
router.post('/account', catchErrors(userController.updateAccount));

module.exports = router;
