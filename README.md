# CableCar (redux-cablecar)

[Redux middleware](http://redux.js.org/docs/api/applyMiddleware.html) to connect [Redux](http://redux.js.org/) to [Rails 5 ActionCable](http://edgeguides.rubyonrails.org/action_cable_overview.html).  

Uses a websocket connection to create a circular message flow between the client and the server.  
[You can download a demo of a Rails app here.](https://github.com/ndhays/redux-cablecar-Rails-Demo-App)

# Installation
`npm install redux-cablecar --save`

# Usage
1. Add `cablecar` to the list of middlewares
2. Connect the redux store to cablecar

## #connect(store, channel, options)
Connects the store to the ActionCable channel   
Returns a `CableCar` object

### Example:
**Client-side: (Redux)**
```js6
import { createStore, applyMiddleware } from 'redux';
import reducer from './reducers/rootReducer';
import cablecar from 'redux-cablecar';

const store = createStore(reducer, applyMiddleware(cablecar...));

cablecar.connect(store, 'ChatChannel', { params: { room: 'game' }, prefix: 'RAILS' });
```
This example connects the store to the ActionCable subscription `ChatChannel` with `params[:room] = "game"`.  
(Only actions with types beginning with "RAILS" will be sent)  

**Server-side: (Rails)**
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
`prefix` - (*optional*, *default:* `'CABLECAR'`) used to filter out CableCar actions from non-CableCar actions  
  
**Actions are only dispatched to the server if they match the given prefix.**  
  
For example, if `prefix` is set to `'MSG'`:  
`MSG_ONE_GETS_SENT`, `MESSAGE_TWO_DOES_NOT`  
(To pass all actions to server, use empty string prefix: `''`).

## #perform(method, payload)
Calls a method in Rails. (see #perform method in [ActionCable documentation](http://edgeguides.rubyonrails.org/action_cable_overview.html))

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
    do_something_to_activate(with: payload["data"])
  end
end
```

## Reserved Actions
###### Reserved action types fired by CableCar middleware:
`CABLECAR_INITIALIZED`, `CABLECAR_CONNECTED`, `CABLECAR_DISCONNECTED`

###### Other reserved action types:
`CABLECAR_DESTROY` - destroys the websocket connection and the `CableCar`
  object (now all actions will run through redux middleware as normal)  
`CABLECAR_CHANGE_CHANNEL` - reconnects to a new channel  
These actions can be sent from ActionCable or dispatched in Redux.  

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

`--> SERVER broadcasts message --> middleware --> CLIENT`

#### Dispatches
Actions originating on the client are sent to an ActionCable channel:

`--> CLIENT dispatches action --> middleware --> SERVER`

#### Optimistic Dispatches
Actions originating on the client *by default* are stopped before going to the reducers.

Broadcasted messages from the server also don't get re-dispatched back to the server (in an infinite loop).  

This creates a circular message flow between the client (Redux) and the server (ActionCable).  

However if `CableCarOptimistic: true` is in the action payload, then the action will be sent to both the Rails Server, in addition to being propagated up thru the Redux middlewares. These actions are considered 'optimistic' updates since when news comes back from the server it may conflict with changes that have already been made on the client. *Caution!*

**optimistic action:**  
`--> CLIENT dispatches action --> middleware --> server AND next middlewares/reducers`

## License

MIT
