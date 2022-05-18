import { initCommand } from './commands/'

async function main() {
    await initCommand(process.env.TOKEN!, process.env.GUILD_ID)
}

main()
