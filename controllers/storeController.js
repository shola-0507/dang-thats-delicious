const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter(req, file, next) {
        const isPhoto = file.mimetype.startsWith('image/');
        if (isPhoto) {
            next(null, true);
        } else {
            next({message: 'That filetype isn\'t allowed'}, false);
        }
    }
}

exports.homePage = (req, res) => {
    res.render('index', {title: 'Thats so Delicious!'});
}

exports.addStore = (req, res) => {
    res.render('editStore', {title: 'Add Store'});
}

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
    if (!req.file) {
        next();
        return;
    }
    const extension = req.file.mimetype.split('/')[1];
    req.body.photo = `${uuid.v4()}.${extension}`;
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(800, jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`);
    next();
}

exports.createStore = async (req, res) => {
    req.body.author = req.user._id;
    const store = await new Store(req.body).save();
    req.flash('success', `${store.name} Store created successfully. Care to leave a review?`);
    res.redirect(`/store/${store.slug}`);
}

exports.getStore = async (req, res) => {
    const stores = await Store.find();
    res.render('index', {title: 'Stores', stores});
}

const confirmOwner = (store, user, callback) => {
    if (!store.author.equals(user._id)) {
        callback.redirect('/stores');
    }
}

exports.editStore = async (req, res) => {
    const store = await Store.findOne({_id: req.params.id});
    confirmOwner(store, req.user, res);
    res.render('editStore', {title: `Edit ${store.name}`, store});
}

exports.updateStore = async (req, res) => {
    res.body.location.type = 'Point';
    
    const store = await Store.findOneAndUpdate({_id: req.params.id}, req.body, {
        new: true,
        runValidators: true
    }).exec();

    req.flash('success', `Successfully Updated <strong>${store.name}</strong>. 
            <a href="/store/${store.id}/edit">View ${store.name}</a>`);
    res.redirect(`/store/${store._id}/edit`);
}

exports.getStoreBySlug = async (req, res, next) => {
    const store = await Store.findOne({slug: req.params.slug})
                            .populate('author');
    if (!store) {
        return next();
    }
    res.render('store', {store, title: store.name});
}

exports.getStoresByTag = async (req, res) => {
    const tag = req.params.tag;
    const tagQuery = tag || { $exists: true };

    const tagsPromise = Store.getTagsList();
    const storesPromise = Store.find({ tags: tagQuery });
    const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
    
    res.render('tag', { title: 'Tags', tags, tag, stores });
}