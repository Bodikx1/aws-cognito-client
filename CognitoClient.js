const aws = require('aws-sdk')

/**
 * Before saving data to Cognito, we convert
 * email and preferred_username to lowercase
 *
 * Also, lowercase() is called when we search user
 * by preferred_username or email
 */
const lowercase = (str) => {
    return (typeof str === 'string') ? str.toLowerCase() : str
}

class CognitoClient {

    /**
     * Config should contain:
     * userPoolId
     * appClientId
     * region
     */
    constructor(config) {
        this.userPoolId = config.userPoolId;
        this.appClientId = config.appClientId;
        this.cognito = new aws.CognitoIdentityServiceProvider({
            region: config.region
        });
    }

    async findUser(filter, required = true) {
        let params = {
            UserPoolId: this.userPoolId,
            //AttributesToGet: ["email_verified"],
            Limit: 1
        }
        if (filter.email) {
            params.Filter = 'email = \"' + lowercase(filter.email) + '\"'
        }
        else if (filter.phone_number) {
            params.Filter = 'phone_number = \"' + filter.phone_number + '\"'
        }
        else if (filter.username) {
            params.Filter = 'username = \"' + filter.username + '\"'
        }
        else if (filter.preferred_username) {
            params.Filter = 'preferred_username = \"' + lowercase(filter.preferred_username) + '\"'
        }
        else if (filter.sub) {
            params.Filter = 'sub = \"' + filter.sub + '\"'
        }
        else {
            return Promise.reject(new Error('Please provide filter params'))
        }
        return this.cognito.listUsers(params)
            .promise()
            .then(data => {
                console.log('listUsers result:' + JSON.stringify(data))
                const result = data && data.Users && data.Users[0]
                if (result) {
                    return {
                        username: result.Username,
                        enabled: result.Enabled,
                        status: result.UserStatus,
                        sub: this._getUserAttribute(result, 'sub'),
                        phone_number_verified: this._getUserAttribute(result, 'phone_number_verified') === 'true',
                        email_verified: this._getUserAttribute(result, 'email_verified') === 'true',
                        preferred_username: this._getUserAttribute(result, 'preferred_username')
                    }
                } else {
                    if (required) {
                        throw new Error('Cognito user is not found by ' + JSON.stringify(filter))
                    } else {
                        return null
                    }
                }
            })
            .catch(this._onError('_findUser'))
    }

    async findCognitoUsernameByEmail(email) {
        const user = await this.findUser({ email });
        return user.username;
    }

    async findCognitoUsernameBySub(sub) {
        const user = await this.findUser({ sub });
        return user.username;
    }

    logIn(username, password) {
        const params = {
            ClientId: this.appClientId,
            AuthFlow: 'USER_PASSWORD_AUTH',
            AuthParameters: {
                USERNAME: lowercase(username),
                PASSWORD: password,
            },
        }
        return this.cognito.initiateAuth(params).promise();
    }

    setUserEmail(id, newEmail, isVerified = false) {
        return this._updateUserAttributes(id, {
            email: lowercase(newEmail),
            email_verified: isVerified ? "True" : "False"
        })
    }

    setUserPhone(id, newPhoneNumber, isVerified = false) {
        return this._updateUserAttributes(id, {
            phone_number: lowercase(newPhoneNumber),
            phone_number_verified: isVerified ? "True" : "False"
        })
    }

    /**
     * Sets user email verified
     */
    setUserEmailVerified(id){
        return this._updateUserAttributes(id, { 'email_verified': 'True' })
    }

    /**
     * Sets user phone verified
     */
    setUserPhoneVerified(id){
        return this._updateUserAttributes(id, { 'phone_number_verified': 'True' })
    }

    resetUserPassword(id){
        let params = {
            UserPoolId: this.userPoolId,
            Username: id
        }
        return this.cognito.adminResetUserPassword(params).promise()
    }

    listUsers() {
        let params = {
            UserPoolId: this.userPoolId,
            AttributesToGet: [],
        }
        return this.cognito.listUsers(params).promise().then(data => data.Users)
    }

    _updateUserAttributes(id, attrs) {
        const params = {
            Username: id,
            UserPoolId: this.userPoolId,
            UserAttributes: Object.keys(attrs).map(key => ({
                Name: key,
                Value: attrs[key]
            }))
        }
        console.log(params)
        return this.cognito.adminUpdateUserAttributes(params).promise()
            .catch(this._onError('adminUpdateAttributes'))
    }

    _onError(messagePrefix) {
        return (err) => {
            // log error
            console.log(err.message)
            // update message
            err.message = messagePrefix + ' failed:' + err.message
            // re-throw error
            throw err
        }
    }

    _getUserAttribute(data, attrName) {
        const attr = (data.Attributes || data.UserAttributes).find(attr => attr.Name === attrName)
        return attr ? attr.Value.toLowerCase() : undefined
    }
}

module.exports = CognitoClient
