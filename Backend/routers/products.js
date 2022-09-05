const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const { Product } = require('../models/product');
const mongoose = require('mongoose')
const multer = require('multer')

//images upload

//Validating file type for image

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
    //destination of the image
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    },
});

const uploadOptions = multer({ storage: storage });

//select method to filter what should be on the categories when search
// .select('name image -_id');
router.get(`/`, async (req, res) => {
    //query parameter: localhost:3000/api/v1/products?categories=293939,19930
    let filter = {};
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') }
    }

    const productList = await Product.find(filter).populate('category');


    if (!productList) {
        res.status(500).json({ success: false })
    }
    res.send(productList);

});

//populate method is used to show the details of any connected field linked to another schema
router.get(`/:id`, async (req, res) => {

    const product = await Product.findById(req.params.id).populate('category')
    if (!product) {
        res.status(500).json({ success: false })
    }
    res.send(product);

});

//update state of the product
router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    //validate category

    //to catch error
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product id')
    }
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category')

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(400).send('Invalid Product!');

    //replace existing image
    const file = req.file;
    let imagepath;

    if (file) {
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagepath = `${basePath}${fileName}`;
    } else {
        //same image path when the product was created
        imagepath = product.image;
    }


    const updatedproduct = await Product.findByIdAndUpdate(req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        },
        { new: true }
    )
    //if there is data inside the category
    if (!updatedproduct)
        return res.status(500).send('The product cannot be Updated')

    res.send(updatedproduct);

})

router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    //validate if the category exist
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid category')

    const file = req.file;
    if (!file) return res.status(400).send('No image in the request');

    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    let products = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,   //http://localhost:3000/public.uploads/cake.jpeg,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    })
    //product is created after saving
    const product = await products.save();

    if (!product)
        return res.status(500).send('The product cannot be created')

    res.send(product);

});

//delete product
//To validate the id of the object to be deleted
router.delete('/:id', (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product id')
    }
    Product.findByIdAndRemove(req.params.id)
        .then(product => {
            if (product) {
                return res.status(200).json({
                    success: true, message: 'The product has been deleted'
                })
            }
            else {
                return res.status(404).json({
                    success: false, message: "product not found"
                })
            }
        }).catch(err => {
            return res.status(400).json({
                success: false,
                error: err
            })
        })

})
//To show how many products in database
router.get(`/get/count`, async (req, res) => {
    const productCount = await Product.countDocuments([count => count])
    if (!productCount) {
        res.status(500).json({ success: false })
    }
    //because we return a json
    res.send({ productCount: productCount });

});

//to check the number of featured products
router.get(`/get/featured/:count`, async (req, res) => {
    //if there is count passed in the api get it if not return 0
    const count = req.params.count ? req.params.count : 0
    const products = await Product.find({ isFeatured: true }).limit(+count)

    if (!products) {
        res.status(500).json({ success: false })
    }
    //because we return a json
    res.send(products);

});


//update multiple images
router.put(
    '/gallery-images/:id',
    uploadOptions.array('images', 10),
    async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid Product Id');
        }
        const files = req.files;
        //array of paths
        let imagesPaths = [];
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

        if (files) {
            files.map((file) => {
                imagesPaths.push(`${basePath}${file.filename}`);
            });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images: imagesPaths,
            },
            { new: true }
        );

        if (!product)
            return res.status(500).send('the gallery cannot be updated!');

        res.send(product);

    })

module.exports = router;
