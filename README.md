# CableCar

An npm package to connect [Rails 5 ActionCable](http://edgeguides.rubyonrails.org/action_cable_overview.html) to [Redux](http://redux.js.org/).

#### Middleware
CableCar works as [Redux middleware](http://redux.js.org/docs/api/applyMiddleware.html).

# Installation
`npm install cablecar`

# Usage
## Setup CableCar
1. Add `cablecar` to your list of redux middlewares
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
let store = createStore(reducer, applyMiddleware(cablecar));

cablecar.connect(store, 'ChatChannel', { room: 'game' })
```

Server Example:
```
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

## Flow
###### Broadcasts
Actions broadcasted from Rails get sent to the client via Redux:

`--> SERVER broadcasts message --> middleware passes it on --> CLIENT`

###### Dispatches
Actions originating on the client are sent to the specified ActionCable channel:

`--> CLIENT dispatches action --> middleware sends it on --> SERVER`

###### Optimistic Dispatches
Actions originating on the client bypass Redux by default, however if `optimistic: true` is added then the action will be sent to both Redux and the Rails Server. *Use with caution!*

`--> CLIENT dispatches action --> middleware sends it on to both --> CLIENT & SERVER`

## CableCar Object functions

These functions are available as well.

`#perform` - calls a method directly in Rails (see #perform method in [ActionCable documentation](http://edgeguides.rubyonrails.org/action_cable_overview.html))  

`#send` - sends a direct message to ActionCable (bypassing middleware)  


## License

MIT
