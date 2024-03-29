// Copyright 2023 Google
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

// Define a route to handle HTTP GET requests at the root path ("/"):
app.get('/', (req, res) => {
  console.log('Hello world received a request.');

  const target = process.env.TARGET || 'World';
  res.send(`Hello ${target}!`);
});

// Define a route to handle HTTP POST requests at "/json":
app.post('/json', (req, res) => {
  const dataLayer = JSON.stringify(req.body)
  console.log(`proxy POST request received dataLayer: ${dataLayer}`)

  const {PubSub} = require('@google-cloud/pubsub');

  // Instantiates a client
  const pubsub = new PubSub();

  const {Buffer} = require('safe-buffer');

  // Set Pub/Sub topic name
  let topicName = 'hyp-pubsub-topic';

  // References an existing topic
  const topic = pubsub.topic(topicName);

  // Publishes the message as a string, 
  const dataBuffer = Buffer.from(dataLayer);

  // Add two custom attributes, origin and username, to the message
  const customAttributes = {
    origin: 'gtm-cloud-run',
    username: 'gcp-demo',
  };

  // Publishes a message to Pub/Sub
  return topic
    .publishMessage({data: dataBuffer})
    .then(() => res.status(200).send(`{"message": "pubsub message sent: ${dataBuffer}"}`))
    .catch(err => {
      console.error(err);
      res.status(500).send(err);
      return Promise.reject(err);
   });
})


module.exports = app;
