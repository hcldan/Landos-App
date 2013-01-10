# Subscribe servlet
## Subscribing a user
PUT <context>/subscribe/com.ibm.opensocial.users:test

Return application/json should include the subscription status after the operation as a boolean:
{
  subscribed: true|false
}