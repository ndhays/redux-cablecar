# CableCar (redux-cablecar)

An npm package to connect [Rails 5 ActionCable](http://edgeguides.rubyonrails.org/action_cable_overview.html) to [Redux](http://redux.js.org/).

#### Middleware
CableCar works as [Redux middleware](http://redux.js.org/docs/api/applyMiddleware.html).

# Installation
`npm install --save redux-cablecar`

# Usage
## Setup
1. Include `cablecar` in redux middlewares
2. Connect the redux `store` to cablecar

Example:
```js6
let store = createStore(reducer, applyMiddleware(cablecar));

cablecar.connect(store, 'ChatChannel', { room: 'game' })
```
This creates a link between Redux and ActionCable.

Specifically, it creates an ActionStore subscription to `ChatChannel` with `params[:room] = "game"`.

## `cablecar`

`#connect` - connects cablecar to a store

This function takes three parameters: `store`, `channel`, and `options`

(`options` are passed as parameters to the channel)

Client Example:

```js6
const store = createStore(reducer, applyMiddleware(cablecar));

cablecar.connect(store, 'ChatChannel', { room: 'game' })
```

Server Example:
```rubyonrails
class ChatChannel < ApplicationCable::Channel
  def subscribed
    stream_from "chat_#{params[:room]}"
  end
end
```

This function returns a `CableCar` object.

## Action Names
###### Actions fired by middleware:
`CABLECAR_INITIALIZED`  
`CABLECAR_CONNECTED`  
`CABLECAR_DISCONNECTED`

###### Actions that can be sent to middleware:
`CABLECAR_DISCONNECT` - this action destroys the CableCar object  
( to reconnect use `cablecar#connect` )  
`CABLECAR_CHANGE_CHANNEL` - this action takes `channel` and `options` properties

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

This example would send subscribers from the `green` chat room to the `blue` chat room (with a "chat_blue" stream name), while keeping them on the same `ChatChannel`.

## Broadcasts & Dispatches
###### Broadcasts
Actions broadcasted from Rails are dispatched to Redux on the client

`--> SERVER broadcasts message --> middleware passes it on --> CLIENT`

###### Dispatches
Actions originating on the client are sent to an ActionCable channel

`--> CLIENT dispatches action --> middleware sends it on --> SERVER`

###### Optimistic Dispatches (how it works)
Actions originating on the client are sent to the server (cablecar stops these actions from propagating thru the middleware).  

Likewise, broadcasted messages from the server are flagged, so they don't get re-dispatched right back to the server.  

This creates a circular message flow between the client (Redux) and the server (ActionCable).  

However if `optimistic: true` is in the action (`action.optimistic`) then the action will be sent to both the Rails Server, *and* the client's Redux reducers immediately afterwards. These are considered 'optimistic' updates since when news comes back from the server it may contradict what has already been sent. *Use with caution!*

**optimistic action:**  
`--> CLIENT dispatches action --> middleware sends it to the server and on thru the middleware simultaneously --> CLIENT & SERVER`

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
