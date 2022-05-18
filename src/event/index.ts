import {Client} from 'discord.js';
import {onInteraction} from './interaction';

export const registerHandler = (client: Client) => {
    client.on('interactionCreate', onInteraction);
}