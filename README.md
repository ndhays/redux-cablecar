# CableCar (redux-cablecar)

Redux CableCar is [Redux middleware](http://redux.js.org/docs/api/applyMiddleware.html) connecting [Redux](http://redux.js.org/) actions to [Rails Action Cable](http://edgeguides.rubyonrails.org/action_cable_overview.html). It uses Action Cable's websocket connection to automatically pass specific redux actions from the client to the server, and converts messages coming from the server into client-side redux actions.

[![npm version](https://img.shields.io/npm/v/redux-cablecar.svg?style=flat-square)](https://www.npmjs.com/package/redux-cablecar)
[![npm downloads](https://img.shields.io/npm/dm/redux-cablecar.svg?style=flat-square)](https://www.npmjs.com/package/redux-cablecar)

# NOTE! Take a Look at these other Packages first...
If you are using a Javascript framework like React or Vue, these might be simpler approaches:  
- [react-use-actioncable](https://github.com/ndhays/react-use-actioncable)
- [actioncable-vue](https://github.com/mclintprojects/actioncable-vue)

# Installation
```js6
yarn add redux-cablecar
```

# Usage
### Step 1
Create cablecar route and middleware
```js6
import { createStore, applyMiddleware } from '@reduxjs/toolkit'
import { createCableCarRoute } from 'redux-cablecar'

const cableCarRoute = createCableCarRoute()
const cableCarMiddleware = cableCarRoute.createMiddleware()
```
  
### Step 2
Add middleware to list of redux middleware
```js6
const middlewares = [cableCarMiddleware]
const store = createStore(reducer, applyMiddleware(middlewares))
```
  
### Step 3
Initialize the cablecar to the redux store with the Rails ActionCable channel
```js6
const options = {
    params: { room: 'game' },
    permittedActions: ['SERVER', 'RAILS', /.+ALSO_TO_SERVER$/]
}

const cableCar = cableCarRoute.connect(store, 'MainChannel', options)
```

### Server Side Example
```rubyonrails
class MainChannel < ApplicationCable::Channel
  def subscribed
    stream_from "#{params[:room]}"
  end
end
```
  
# CableCarRoute
## createCableCarRoute(options)
- `provider` - custom provider (optional)
- `webSocketURL` - custom WS url (optional)
  
```js6
createCableCarRoute({
    provider: myCustomProvider,
    webSocketURL: 'ws://custom:8080'
})
```

## #connect(store, channel, options)
### store (Store, *required*)  
Redux store object.  

### channel (string, *required*)  
Name of the ActionCable channel (ie. 'ChatChannel').  

### options (object)
- `params` - *object* sent to ActionCable channel (ie. `params[:room]`)  
- `permittedActions` - *string, RegExp, (string|RegExp)[], function* - filters actions that get sent to the server
- `matchChannel` - *boolean* optional shortcut for using multiple channels
- `silent` - *boolean* creates one-way communication to Rails (filtered client actions get sent to the server, but no server messages will dispatch redux actions)
##### ActionCable Callback Functions
- `initialized`
- `connected`
- `disconnected`
- `rejected`
  
# Redux Actions
## Permitted Actions
Actions must be **permitted** to be sent to Rails.  
By default this is any action of with a type prefix `RAILS`.  
  
**Example: `{ type: 'RAILS_ACTION' }`**
  
It can be customized with the `permittedActions` option.  
  
### String (prefix)
```js6
cableCarRoute.connect(store, 'channelName', { permittedActions: 'my_prefix/' })
```
This will match `my_prefix/anyaction`.
### RegExp
```js6
cableCarRoute.connect(store, 'channelName', { permittedActions: /suffix$/ })
```
### List of strings OR regular expressions
```js6
cableCarRoute.connect(store, 'channelName', { permittedActions: ['prefix', /orsuffix$/] })
```
### Custom Function
```js6
cableCarRoute.connect(store, 'channelName', {
    permittedActions: action => action.server === true
})
```
### Match Channel
A shortcut for a use case with multiple channels
```js6
cableCarRoute.connect(store, 'channelOne', {
    matchChannel: true
})
cableCarRoute.connect(store, 'channelTwo', {
    matchChannel: true
})
```
This is the equivalent of writing:
```js6
cableCarRoute.connect(store, 'channelOne', {
    permittedActions: (action) => action.meta.channel === 'channelOne'
})
cableCarRoute.connect(store, 'channelTwo', {
    permittedActions: (action) => action.meta.channel === 'channelTwo'
})
```
  
# CableCar Object
The CableCar object has the following other functions:

## #destroy
Disconnects and destroys cablecar. This is useful if changing channels/params.
```js6
const cableCarRoute = createCableCarRoute()
```
```js6
const cableCar = cableCarRoute.connect(store, 'GameChannel', { params: { room: 1 }})
```
```js6
cableCar.destroy()
cableCarRoute.connect(store, 'GameChannel', { params: { room: 2 }})
```

## #pause
Pauses the cablecar.

## #resume
Resumes the cablecar.

## #perform(method, payload)
Calls a Rails method directly. (See [Rails documentation](https://guides.rubyonrails.org/action_cable_overview.html) for more)

**Example:**
```js6
cableCar.perform('activate_something', { data: ... })
```
```rubyonrails
class ChatChannel < ApplicationCable::Channel
  def subscribed
    stream_from "chat"
  end

  def activate_something(payload)
    ...
  end
end
```
([See ActionCable documentation for more](http://edgeguides.rubyonrails.org/action_cable_overview.html))

## #send(action)
Sends a direct message to Rails (outside of the Redux middleware chain)

# Optimistic Actions
Redux actions matching the `permittedActions` criteria get sent to the Rails server.

However if `isOptimistic: true` is in the action meta property, then the action will be sent to both the Rails Server, as well as being propagated thru the rest of the Redux middlewares. These actions are considered 'optimistic' updates, since when news comes back from the server it may conflict with changes that have already been made on the client.
  
Example:
```js6
{ type: 'RAILS_ACTION_ALSO_REDUX_SAME_TIME', meta: { isOptimistic: true }}
```

# Dropped Actions
Dropped actions are permitted actions that cannot be sent with the ActionCable subscription, because the connection has not yet been initialized or connected, or has been disconnected.

## Optimistic on Fail
Dropped actions are usually a sign of a timing issue that needs to be resolved, but if necessary a meta property `isOptimisticOnFail` can be added to an action. These actions will be passed to redux only if dropped.
```js6
{ type: 'RAILS_SERVER_OR_REDUX_IF_DROPPED', meta: { isOptimisticOnFail: true }}
```

# Multiple Stores, Channels, and WebSocket URLs
While unlikely scenarios, `redux-cablecar` does support multiple channels, Redux stores, and even websocket connections.  
Every Redux store should have a unique cable car route, with a unique middleware object created.  
Only one consumer is maintained per unique webSocketURL, so separate routes may use the same webSocketURL.  

# Development
Clone and run `npm install`.  

Link the package locally with `npm link` and use `npm run watch` to update package changes.  

Pull requests welcome.

# Tests
`npm test`

## License

MIT
