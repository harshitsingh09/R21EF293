const ecomAMZ = require('./ecomAMZ');
const ecomSLP = require('./ecomSLP');
const ecomSNP = require('./ecomSNP');
const ecomMYN = require('./ecommerceMYN');
const ecomAZO = require('./ecommerceAZO');

const VALID_CATEGORIES = [
    'Phone', 'Computer', 'TV', 'Earphone', 'Tablet', 'Charger',
    'Mouse', 'Keypad', 'Bluetooth', 'Pen Drive', 'Remote',
    'Speaker', 'Headset', 'Laptop', 'PC'
];

const VALID_COMPANIES = ['AMZ', 'SLP', 'SNP', 'MYN', 'AZO'];

const getTopProducts = async (category, minPrice, maxPrice) => {
    if (!VALID_CATEGORIES.includes(category)) {
        throw new Error('Invalid category');
    }

    const results = await Promise.all([
        ecommAMZ.getProducts(category, minPrice, maxPrice),
        ecomSLP.getProducts(category, minPrice, maxPrice),
        ecomSNP.getProducts(category, minPrice, maxPrice),
        ecomMYN.getProducts(category, minPrice, maxPrice),
        ecomAZO.getProducts(category, minPrice, maxPrice),
    ]);

    // Flatten the results array
    const allProducts = results.flat();

    // Sort by price (or any other criteria)
    return allProducts.sort((a, b) => a.price - b.price);
};

module.exports = { getTopProducts };