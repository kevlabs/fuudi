const axios = require('axios');

const getCoordinates = async (postCode) => {
  try {
    const { data } = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: postCode,
        key: process.env.MAP_KEY
      }
    });
    console.log(data);

    if (!data.results.length) throw Error('Could not get the geo coordinates.');

    const { results: [{ geometry: { location: { lat, lng } } }] } = data;
    const latitude = Number(lat);
    const longitude = Number(lng);
    if (!latitude || !longitude) throw Error(`Latitude/longitude do not evaluate to numbers.`);

    return { latitude, longitude };

  } catch (err) {
    // return 0, 0 if error
    return { latitude: 0, longitude: 0 };
  }

};

module.exports = getCoordinates;
