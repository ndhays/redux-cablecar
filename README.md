# CableCar (redux-cablecar)

[Redux middleware](http://redux.js.org/docs/api/applyMiddleware.html) to connect [Redux](http://redux.js.org/) to [Rails 5 ActionCable](http://edgeguides.rubyonrails.org/action_cable_overview.html).  

It creates a websocket connection and a circular message flow from the client to the server.

Uses [yarn](https://yarnpkg.com) as a package manager.

# Installation
`yarn add redux-cablecar`

# Usage
1. Add `cablecar` to list of middleware
2. Connect the redux store to cablecar

Client Example:
```js6
import { createStore, applyMiddleware } from 'redux';
import reducer from './reducers/rootReducer';
import cablecar from 'redux-cablecar';

const store = createStore(reducer, applyMiddleware(cablecar...));

cablecar.connect(store, 'ChatChannel', { room: 'game' })
```
This connects the Redux store to the ActionCable subscription `ChatChannel` with `params[:room] = "game"`.  
  
Server Example:
```rubyonrails
class ChatChannel < ApplicationCable::Channel
  def subscribed
    stream_from "chat_#{params[:room]}"
  end
end
```

## `cablecar`

`#connect` - connects cablecar to a Redux store

This function takes three parameters: `store`, `channel`, and `options`

(`options` get passed as `params` to the Rails ActionCable channel)

This function returns a `CableCar` object.

## Defined Actions
###### Actions fired by middleware:
`CABLECAR_INITIALIZED`, `CABLECAR_CONNECTED`, `CABLECAR_DISCONNECTED`

###### Actions received by middleware:
`CABLECAR_DISCONNECT` - destroys the websocket connection and the `CableCar` object
`CABLECAR_CHANGE_CHANNEL` - reconnects to a new channel (takes `channel` and `options` properties)

**Example:**  
```rubyonrails
ChatChannel.broadcast_to(
  "chat_green",
  type: 'CABLECAR_CHANGE_CHANNEL',
  channel: 'ChatChannel',
  options: {
    room: 'blue'
  }
)
```

This example sends subscribers from the `green` chat room to the `blue` chat room while remaining on `ChatChannel`.

## Broadcast & Dispatch Flow
###### Broadcasts
Actions 'broadcasted' from Rails are then dispatched to Redux on the client

`--> SERVER broadcasts message --> middleware passes it on --> CLIENT`

###### Dispatches
Actions originating on the client are sent to an ActionCable channel

`--> CLIENT dispatches action --> middleware sends it on --> SERVER`

###### Optimistic Dispatches (how it works)
Actions originating on the client do not get sent to the reducers.  

Broadcasted messages from the server don't get re-dispatched right back to the server.  

This creates a circular message flow between the client (Redux) and the server (ActionCable).  

However if `optimistic: true` is in the action then the action will be sent to both the Rails Server, *and* the client's Redux reducers. These are considered 'optimistic' updates since when news comes back from the server it may conflict with what the client has already done. *Use with caution!*

**optimistic action:**  
`--> CLIENT dispatches action --> middleware sends it to the server (in addition to the next middleware) simultaneously --> CLIENT & SERVER`

## #perform

This function is also available on the CableCar object.

`#perform` - calls a method directly in Rails (see #perform method in [ActionCable documentation](http://edgeguides.rubyonrails.org/action_cable_overview.html))  

Example:
```rubyonrails
class ChatChannel < ApplicationCable::Channel
  def subscribed
    stream_from "chat"
  end

  def activate(data)
    do_something_to_activate(with: data)
  end
end
```
```js6
const car = cablecar.connect(store, ... )
car.perform("activate", { data: ... })
```

## License

MIT
