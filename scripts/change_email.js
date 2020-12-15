const CognitoClient = require('../CognitoClient');
const config = require('../config.json');

/**
 * Usage: ./change_email test@test.com test@test2.com
 */

async function changeEmail() {

    const client = new CognitoClient(config)

    const old_email = process.argv[2];
    const new_email = process.argv[3];

    if (!old_email && !new_email) {
        throw new Error('usage: node ./scripts/change_email [old_email] [new_email]')
    }

    const user = await client.findUser({ email: old_email });
    await client.setUserEmail(user.username, new_email, true);
    console.log(`Changed email to ${new_email}`);
}

changeEmail().catch(err => console.log(err));
