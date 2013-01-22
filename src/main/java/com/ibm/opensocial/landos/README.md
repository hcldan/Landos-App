* [Subscribe servlet](#subscribe-servlet)
    * [Unsubscribing a user](#unsubscribing-a-user)
    * [Querying subscription for user](#querying-subscription-for-user)
* [Run servlet](#run-servlet) 
    * [Creating a run](#creating-a-run)
    * [Deleting a run](#deleting-a-run)
    * [Getting a run](#getting-a-run)
* [Orders servlet](#orders-servlet) 
    * [Creating an order](#creating-an-order)
    * [Getting orders for a run](#getting-orders-for-a-run)
    * [Deleting an order in a run](#deleting-an-order-in-a-run)
* [Item search servlet](#item-search-servlet)
    * [Get a list of all items](#get-a-list-of-all-items)
    
# Subscribe servlet
## Subscribing a user
### PUT &lt;context&gt;/subscribe/&lt;userid&gt;
Returns `application/json`. Should include the subscription status after the operation as a boolean:
```javascript
{
  subscribed: true // hopefully :)
}
```

## Unsubscribing a user
### DELETE &lt;context&gt;/subscribe/&lt;userid&gt;
Returns `application/json`. Should include the subscription status after the operation as a boolean:
```javascript
{
  subscribed: false // hopefully :)
}
```

## Querying subscription for user
### GET &lt;context&gt;/subscribe/&lt;userid&gt;
Returns `application/json`. Should include the subscription status as a boolean:
```javascript
{
  subscribed: true|false
}
```
# Run servlet
## Creating a run
### PUT &lt;context&gt;/run/&lt;start&gt;/&lt;end&gt;[/&lt;test&gt;]
Returns `application/json`. Should include the run id as well as created run parameters:
```javascript
{
	"id": 12,
	"start": 234234234,
	"end": 234234243,
	"test": false
}
```

## Deleting a run
### DELETE &lt;context&gt;/run/&lt;id&gt;
Returns `application/json`. Should include the run id which was deleted.
```javascript
{
	"id": 12
}
```

## Getting a run
### GET &lt;context&gt;/run/&lt;id&gt;
Returns `application/json`. Should include all run parameters.
```javascript
{
  "id": 12,
  "start": 234234234,
  "end": 234234243,
  "test": false
}
```

## Getting active run
### GET &lt;context&gt;/run/
Returns `application/json`. Should include all run parameters, or an error if there is no active run.
```javascript
{
  "id": 12,
  "start": 234234234,
  "end": 234234243,
  "test": false
}
```

# Orders Servlet
## Creating an order
### PUT /orders/&lt;runid&gt;?user=&lt;user&gt;&item=&lt;item&gt;&price=&lt;price&gt;[&size=&lt;size&gt;][&qty=&lt;qty&gt;][&comments=&lt;comments&gt;]
Returns `application/json`. Should include all order parameters.
```javascript
{
	"rid": 12,
	"user": "Ken",
	"item": "Soda",
	"size": null,
	"qty": 1,
	"price": 150,
	"comments": null
}
```
## Getting orders for a run
### GET /orders/&lt;runid&gt;[?user=&lt;user&gt;[&item=&lt;bar&gt;]]
Returns `application/json` of an array containing all matching orders. `user` and `item` are optional. Specifying `item` requires specifying `user`.
```javascript
[{
  "rid": 12,
  "user": "Dan",
  "item": "Sub",
  "size": null,
  "qty": 1,
  "price": 550,
  "comments": null
}, {
  "rid": 12,
  "user": "Ken",
  "item": "Pizza",
  "size": null,
  "qty": 1,
  "price": 350,
  "comments": null
}]
```

## Deleting an order in a run
### DELETE /orders/&lt;runid&gt;?user=&lt;user&gt;&item=&lt;bar&gt;
Returns `application/json`. All parameters are required. Returned structure contains a key `deleted` indicating how many orders were deleted.
```javascript
{
	"delete": 1
}
```

# Item search servlet
## Get a list of all items
### GET /items
Returns `application/json` object with a matches key that contains an array of all food items in the database.
```javascript
{
  "matches": [{
    "food": "Fries",
    "category": "Appetizers" 
  },{
    "food": "Ham & Cheese Sub",
    "category": "Cold Subs"
  }]
}  
```