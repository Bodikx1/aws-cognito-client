const CognitoClient = require('../CognitoClient');
const config = require('../config.json');

/**
 * Usage: ./change_phone test@test.com +1234567890
 */

async function changePhone() {

    const client = new CognitoClient(config)

    const user_email = process.argv[2];
    const user_phone = process.argv[3];

    if (!user_email && !user_phone) {
        throw new Error('usage: node ./scripts/change_phone [user_email] [user_phone]')
    }

    const user = await client.findUser({ email: user_email });
    await client.setUserPhone(user.username, user_phone, true);
    console.log(`Changed phone to ${user_phone}`);
}

changePhone().catch(err => console.log(err));
