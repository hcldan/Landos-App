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