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