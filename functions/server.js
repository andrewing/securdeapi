import express from 'express'
import cors from 'cors'
import querystring from 'querystring'
import { StringDecoder } from 'string_decoder'
import * as routes from '.'
import { handlePath, getNextPath } from './util/router'

const app = express()
const PORT = process.env.PORT || 9000
const { admin, auth, book, bookInstance, dbStart, refreshToken, review, test, user } = routes

const ROUTES = [
  [admin, '/admin'],
  [auth, '/auth'],
  [book, '/book'],
  [bookInstance, '/book-nstance'],
  [dbStart, '/db-start'],
  [refreshToken, '/refresh-token'],
  [review, '/review'],
  [test, '/test'],
  [user, '/user']
]
app.options('*', cors())
app.use(cors())
app.all('*', (req, res) => {
  const requrl = new URL(req.url, `http://${req.headers.host}`);

  const decoder = new StringDecoder('utf-8')
  let buffer = ''
  req.on('data', (chunk) => {
    buffer += decoder.write(chunk)
  })

  req.on('end', () => {
    const event = {
      path: requrl.pathname,
      httpMethod: req.method,
      queryStringParameters: querystring.decode(requrl.search.substring(1)),
      headers: req.headers,
      body: buffer
    }

    const context = {

    }

    const callback = (err, code) => {
      const { statusCode, body } = code
      res.writeHead(statusCode, {
        'Access-Control-Request-Methods': 'GET, POST, DELETE, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      })
      res.write(body)
      res.end()
    }

    handlePath(requrl.pathname, ROUTES, event, context, callback)
  })

  req.on('error', (e) => {
    console.log(`problem with request: ${e.message}`);
  });
});

app.listen(PORT, () => {
  console.log(`Listening to port ${PORT}...`)
})