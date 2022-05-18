import {Client} from 'discord.js';
import {registerHandler} from './event';


async function main(){
    const client = new Client({intents: 32767});
    registerHandler(client);
    await client.login(process.env.TOKEN!);
}

main().then();