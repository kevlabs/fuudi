const axios = require('axios');

const getYelpData = async (searchTerms, latitude, longitude) => {
  try {
    const { data } = await axios.get('https://api.yelp.com/v3/businesses/search', {
      params: {
        term: searchTerms,
        latitude,
        longitude
      },
      headers: {
        'Authorization': `Bearer ${process.env.YELP_KEY}`
      }
    });

    if (!data.businesses.length) throw Error('Could not any data.');

    const { businesses: [{ rating, phone, review_count: reviewCount, zip_code: postCode }] } = data;

    return { rating, phone, reviewCount, postCode };

  } catch (err) {
    // return 0 if error
    return { rating: 0, reviewCount: 0 };
  }

};

module.exports = getYelpData;
