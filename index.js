require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_API_URL = 'https://api.hubapi.com/crm/v3/objects';
const CUSTOM_OBJECT = process.env.HUBSPOT_OBJECT_TYPE || 'character_sheets';
console.log('Using HubSpot object type:', CUSTOM_OBJECT);

app.get('/update-cobj', (req, res) => {
  res.render('updates', {
    title: 'Update Custom Object Form | Integrating With HubSpot I Practicum',
  });
});

app.post('/update-cobj', async (req, res) => {
  const { name, race, class_name } = req.body;

  try {
    await axios.post(
      `${HUBSPOT_API_URL}/${CUSTOM_OBJECT}`,
      {
        properties: {
          name,
          race,
          class_name
        },
      },
      {
        headers: {
          Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Custom object record created');
    res.redirect('/');
  } catch (error) {
    console.error('Error creating record:', error.response?.data || error.message);
    res.status(500).send('Error creating record');
  }
});

app.get('/', async (req, res) => {
  try {
    const response = await axios.get(`${HUBSPOT_API_URL}/${CUSTOM_OBJECT}`, {
      headers: {
        Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        Accept: 'application/json',
      },
      params: {
        properties: 'name,race,class_name',
        limit: 100,
      },
    });

    const records = response.data.results.map((record) => ({
      name: record.properties.name,
      race: record.properties.race,
      class_name: record.properties.class_name
    }));

    res.render('homepage', { records });
  } catch (error) {
    console.error('Error fetching records:', error.response?.data || error.message);
    res.render('homepage', { records: [] });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
