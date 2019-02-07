const mongoose = require('mongoose');
//We can reference the store directly
//anywhere in our application because we imported it in the start.js file
const Store = mongoose.model('Store');

exports.homePage = (req, res) => {
    res.render('index', {title: 'Thats so Delicious!'});
}

exports.addStore = (req, res) => {
    res.render('editStore', {title: 'Add Store'});
}

exports.createStore = async (req, res) => {
    const store = await new Store(req.body).save();
    req.flash('success', `${store.name} Store created successfully. Care to leave a review?`);
    res.redirect(`/store/${store.slug}`);
}

exports.getStore = async (req, res) => {
    const stores = await Store.find();
    res.render('store', {title: 'Stores', stores});
}

exports.editStore = async (req, res) => {
    const store = await Store.findOne({_id: req.params.id});
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