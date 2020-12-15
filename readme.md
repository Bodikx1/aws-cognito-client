### AWS Cognito Client

How to create Cognito client:

```
const client = new CognitoClient({
    userPoolId: '',
    appClientId: '',
    region: 'us-east-1'
})
```


### Functions

```
client.findUser({ email: 'test@test.com' })
client.findUser({ phone_number: '+12345678901' })
client.findUser({ username: 'test@test.com' })
client.findUser({ sub: '1232dsjkfds32j432j433333' })
// returns Cognito user or null

client.listUsers()
// returns all users from that pool

client.logIn('someUsername', 'somePassword')
// returns JWT tokens

client.setUserEmail(username, newEmail, isVerified = true)
client.setUserPhone(username, newPhoneNumber, isVerified = true)

client.setUserEmailVerified(username)
client.setUserPhoneVerified(username)

```

### Scripts

```
./scripts/change_email.js username new_email
./scripts/change_phone.js username new_email
```
