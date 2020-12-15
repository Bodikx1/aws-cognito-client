### AWS Cognito Client

#### 1. Checkout this repo

After you checkout this repo do npm install

#### 2. Prepare config.json

Create a file config.json with contents like this:

```
{
  "userPoolId": "us-east-1_DJFSHSHDD", // this is fake pool id
  "appClientId": "sadsadkdskk343ik6l", // this is fake client id
  "region": "us-east-1"
}
```

#### 3. How to change Cognito user email or phone:

```
node ./scripts/change_email.js user_email new_email
node ./scripts/change_phone.js user_email new_phone
```

### 4. Other functions this CognitoClient has:

You can create Cognito client:

```
const client = new CognitoClient({
    userPoolId: '',
    appClientId: '',
    region: 'us-east-1'
})
```

and then you can call these functions:

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
