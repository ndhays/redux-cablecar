# CableCar (redux-cablecar)

[Redux middleware](http://redux.js.org/docs/api/applyMiddleware.html) to connect [Redux](http://redux.js.org/) to [Rails 5 ActionCable](http://edgeguides.rubyonrails.org/action_cable_overview.html).  

Uses a websocket connection to flow redux actions between the client and the server.  

[Demo App](https://github.com/ndhays/redux-cablecar-Rails-Demo-App)

# Installation
`npm install redux-cablecar --save`

# Usage
1. Apply `cablecar` as a redux middleware
2. Connect the cablecar middleware to the redux store

## #setProvider(actionCableProvider) *optional*
By default the Rails 'actionprovider' package is used, but it can be passed into the middleware as well. It must be set before calling #connect.

## #connect(store, channel, options)
Connects the store to the ActionCable channel   
Returns a `CableCar` object

## Example:
**Redux Client-side:**
```js6
import { createStore, applyMiddleware } from 'redux';
import reducer from './reducers/rootReducer';
import cablecar from 'redux-cablecar';

const store = createStore(reducer, applyMiddleware(cablecar...));

const options = {
  params: { room: 'game' },
  prefix: 'SERVER_ACTION'
};

cablecar.connect(store, 'ChatChannel', options);
```
This connects the store to the ActionCable subscription `ChatChannel` with `params[:room] = "game"`.  


**Rails Server-side:**
```rubyonrails
class ChatChannel < ApplicationCable::Channel
  def subscribed
    stream_from "chat_#{params[:room]}"
  end
end
```
#### store (*required*)  
Redux store object.  

#### channel (*required*)  
Name of the ActionCable channel (ie. 'ChatChannel').  

#### options (*optional*)  

### Options  
`connected` - (*optional*) callback function  
`disconnected` - (*optional*) callback function  
`params` - (*optional*) params sent to Rails  
`prefix` - (*optional*, *default:* `'RAILS'`) can be used to filter out CableCar actions from other actions  
`optimisticOnFail` - (*optional*, *default:* `false`) - if action is rejected by ActionCable, then it continues thru client-side middleware instead of getting dropped

**Actions are only dispatched to the server if they match the prefix. (default prefix: 'RAILS')**  

For example, if the `prefix` is set to `'SYSTEM'`:  
`SYSTEM_ONE_GETS_SENT_TO_SERVER`,  
`MESSAGE_TWO_DOES_NOT`  
(To pass all actions to server, use empty string `prefix: ''`).

## CableCar object
The middleware's `#connect` function returns a CableCar object with the following functions:

### #changeChannel(channel, options)
Manually change the car's channel.  
(See below on how to do it with a *Redux action*)

### #getChannel
Returns the current CableCar's channel.

### #getParams
Returns the current CableCar's params.

### #perform(method, payload)
Calls a Rails method directly.

**Example:**
```js6
const car = cablecar.connect(store, ... )
car.perform('activate', { data: ... })
```
```rubyonrails
class ChatChannel < ApplicationCable::Channel
  def subscribed
    stream_from "chat"
  end

  def activate(payload)
    ...
  end
end
```
([See ActionCable documentation for more](http://edgeguides.rubyonrails.org/action_cable_overview.html))

### #send(action)
Sends a direct communication to Rails (outside of the Redux middleware chain)

## Reserved Action Types
##### Reserved action types fired by CableCar middleware:
`CABLECAR_INITIALIZED`,  
`CABLECAR_CONNECTED`,  
`CABLECAR_DISCONNECTED`  

##### Other reserved action types:
`CABLECAR_DESTROY` - destroys the websocket connection and the `CableCar`
  object (now all actions will run through redux middleware as normal)  

`CABLECAR_CHANGE_CHANNEL` - reconnects to a new channel  
These actions can be sent from ActionCable or dispatched in Redux on the front end.  

**Change Channel Example:**  
```rubyonrails
ChatChannel.broadcast_to(
  "chat_green",
  type: 'CABLECAR_CHANGE_CHANNEL',
  channel: 'ChatChannel',
  options: {
    params: { room: 'blue' }
  }
)
```

This example sends subscribers from the `green` chat room to the `blue` chat room while remaining on `ChatChannel`.  
(If no new prefix is given, it will use the previous one).  

# Broadcast & Dispatch Flow
#### Broadcasts
Actions broadcasted from Rails are dispatched to Redux:

`--> RAILS SERVER broadcasts message --> middleware --> CLIENT (ReduxJS) `

#### Dispatches
Actions originating on the client are sent to an ActionCable channel:

`--> CLIENT store dispatches action --> middleware --> SERVER CHANNEL`

#### Optimistic Dispatches
CableCar actions originating on the client *by default* get rerouted to the server.

However if `optimistic: true` is in the action payload, then the action will be sent to both the Rails Server, and in addition to being propagated thru the Redux middlewares. These actions are considered 'optimistic' updates, since when news comes back from the server it may conflict with changes that have already been made on the client. *Use With Caution!*

**optimistic action:**  
`--> CLIENT store dispatches action --> middleware --> CLIENT/SERVER simultaneously`

# Development
Download and run `yarn`.  

You can link the package locally with `yarn link` and use `yarn run watch` to update package changes.  
  
Pull requests welcome.

# Tests
`yarn test`

## License

MIT
