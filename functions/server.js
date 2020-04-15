import http from 'http'
import querystring from 'querystring'
import { StringDecoder } from 'string_decoder'
import * as routes from '.'
import {handlePath} from './util/router'
import "core-js/stable";
import "regenerator-runtime/runtime";

const PORT = process.env.PORT || 3000
const {admin, auth, book, bookInstance, dbStart, refreshToken, review, test, user} = routes

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

const server = http.createServer((req, res) => {
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
      const {statusCode, body} = code
      res.writeHead(statusCode, { 'Content-Type': 'application/json' })
      res.write(body)
      res.end()
    }

    handlePath(requrl.pathname, ROUTES, event, context, callback)
  })
});

server.listen(PORT, ()=>{
  console.log(`Listening to port ${PORT}...`)
})