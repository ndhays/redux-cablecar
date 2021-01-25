# CableCar (redux-cablecar)

Redux CableCar is [Redux middleware](http://redux.js.org/docs/api/applyMiddleware.html) connecting [Redux](http://redux.js.org/) actions to [Rails Action Cable](http://edgeguides.rubyonrails.org/action_cable_overview.html). It uses Action Cable's websocket connection to automatically pass specific redux actions from the client to the server, and converts messages coming from the server into client-side redux actions.

[![npm version](https://img.shields.io/npm/v/redux-cablecar.svg?style=flat-square)](https://www.npmjs.com/package/redux-cablecar)
[![npm downloads](https://img.shields.io/npm/dm/redux-cablecar.svg?style=flat-square)](https://www.npmjs.com/package/redux-cablecar)


# Installation
`npm install redux-cablecar --save`

# Usage
### Step 1
Create cablecar and middleware
```js6
import { createStore, applyMiddleware } from '@reduxjs/toolkit'
import { createCableCar } from 'redux-cablecar'

const cableCar = createCableCar()
const cableCarMiddleware = cableCar.createMiddleware()
```
  
### Step 2
Add middleware to list of redux middleware
```js6
const middlewares = [cableCarMiddleware]
const store = createStore(reducer, applyMiddleware(middlewares))
```
  
### Step 3
Initialize the cablecar to the redux store with channel & options
```js6
const options = {
  params: { room: 'game' },
  permittedActions: ['SERVER', 'RAILS', /.+ALSO_TO_SERVER$/]
}

cableCar.init(store, 'Channel', options)
```

### Server Side Example
```rubyonrails
class ChatChannel < ApplicationCable::Channel
  def subscribed
    stream_from "chat_#{params[:room]}"
  end
end
```
  
# CableCar
## #init(store, channel, options)
### store (Store, *required*)  
Redux store object.  

### channel (string, *required*)  
Name of the ActionCable channel (ie. 'ChatChannel').  

### options (object)
- `params` - sent to ActionCable channel (ie. `params[:room]`)  
- `permittedActions` - *string, RegExp, (string|RegExp)[], function* - filters actions that get sent to the server
- `silent` - *boolean* creates one-way communication to Rails (filtered client actions get sent to the server, but no server messages will dispatch redux actions) 
- `provider` - injects custom provider (ActionCable by default)
- `webSocketURL` - injects custom WS url
### options - ActionCable Callbacks
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
```
cableCar.init(store, 'channelName', { permittedActions: 'my_prefix/' })
```
This will match `my_prefix/anyaction`.
### RegExp
```
cableCar.init(store, 'channelName', { permittedActions: /suffix$/ })
```
### List of strings OR regular expressions
```
cableCar.init(store, 'channelName', { permittedActions: ['prefix', /orsuffix$/] })
```
### Custom Function
```
cableCar.init(store, 'channelName', {
  permittedActions: action => action.server === true
})
```

# CableCar Object
The CableCar object has the following other functions:

## #destroy
Disconnects and destroys cablecar. This is useful if trying to connect multiple cars to different channels simultaneously.
```js6
const cableCar = createCableCar()

...

cableCar.init(store, 'ChatChannel', { params: { room: 1 }})
...
cableCar.destroy()
cableCar.init(store, 'GameChannel', { params: { room: 2 }})
```

## #perform(method, payload)
Calls a Rails method directly. (See [Rails documentation](https://guides.rubyonrails.org/action_cable_overview.html) for more)

**Example:**
```js6
const cableCar = createCableCar()

...

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
Sends a direct communication to Rails (outside of the Redux middleware chain)

# Optimistic Actions
Redux actions matching the `permittedActions` criteria get sent to the Rails server.

However if `isOptimistic: true` is in the action meta property, then the action will be sent to both the Rails Server, as well as being propagated thru the rest of the Redux middlewares. These actions are considered 'optimistic' updates, since when news comes back from the server it may conflict with changes that have already been made on the client.
  
Example:
```
{ type: 'RAILS_ACTION_ALSO_REDUX_SAME_TIME', meta: { isOptimistic: true }}
```

# Dropped Actions
Dropped actions are permitted actions that cannot be sent with the ActionCable subscription, because the connection has not yet been initialized or connected, or has been disconnected.

## Optimistic on Fail
Dropped actions are usually a sign of a timing issue that needs to be resolved, but if necessary a meta property `isOptimisticOnFail` can be added to an action. These actions will be passed to redux only if dropped.
```
{ type: 'RAILS_SERVER_OR_REDUX_IF_DROPPED', meta: { isOptimisticOnFail: true }}
```

# Development
Clone and run `npm install`.  

Link the package locally with `npm link` and use `npm run watch` to update package changes.  

Pull requests welcome.

# Tests
`npm test`

## License

MIT
