import * as create from './create'
import {SlashCommandBuilder} from '@discordjs/builders';
import {
    APIApplication,
    APIApplicationCommand,
    Routes,
} from 'discord-api-types/v9';
import { REST } from '@discordjs/rest'

export const CommandPrefix = 'vp';
const baseCommand = new SlashCommandBuilder()
    .setName(CommandPrefix)
    .setDescription('投票パネルのコマンド');

export const allSubCommands = [
    create
];

allSubCommands.forEach((c) => baseCommand.addSubcommand(c.command));

interface command {
    name: string
}

const allCommands = new Map<string, command>(
    [baseCommand as command]
        .map((c) => [c.name, c])
)

function fetchApplication(rest: REST) {
    return rest.get(Routes.user('@me')) as Promise<APIApplication>
}

export async function initCommand(
    token: string,
    ...guildIds: Array<string | undefined>
) {
    const rest = new REST({ version: '9' }).setToken(token)
    const user = await fetchApplication(rest)
    const clientId = user.id
    const task = async (guildId?: string) => {
        try {
            const route = guildId
                ? Routes.applicationGuildCommands(clientId, guildId)
                : Routes.applicationCommands(clientId)
            // まずすべてのコマンドを取得する
            const commands = (await rest.get(route)) as Array<APIApplicationCommand>
            const toRegister = new Map(allCommands)
            // すでに登録済みなものを更新する
            for (const apiCommand of commands) {
                const command = toRegister.get(apiCommand.name)
                if (!command) {
                    continue
                }
                const route = guildId
                    ? Routes.applicationGuildCommand(clientId, guildId, apiCommand.id)
                    : Routes.applicationCommand(clientId, apiCommand.id)
                await rest.patch(route, { body: command })
                toRegister.delete(apiCommand.name)
            }
            // 登録してないないものは登録する

            for (const command of toRegister.values()) {
                await rest.post(route, { body: command })
            }
        } catch (e) {
            // グローバルコマンドであれば無視しない
            if (!guildId) {
                throw e
            }
            // ギルドコマンドならトレースだけ
            console.trace(e)
        }
    }
    await Promise.all(guildIds.map(task))
}

export async function clearCommand(token: string, guildId?: string) {
    const rest = new REST({ version: '9' }).setToken(token)
    const user = await fetchApplication(rest)
    const clientId = user.id
    let route: `/${string}`
    if (!guildId) {
        route = Routes.applicationCommands(clientId)
    } else {
        route = Routes.applicationGuildCommands(clientId, guildId)
    }
    const commands = (await rest.get(route)) as Array<APIApplicationCommand>

    const promises = commands.map((command) => () => {
        let route
        if (!guildId) {
            route = Routes.applicationCommand(clientId, command.id)
        } else {
            route = Routes.applicationGuildCommand(clientId, guildId, command.id)
        }
        return rest.delete(route)
    })
    for (const promise of promises) {
        await promise()
    }
}
