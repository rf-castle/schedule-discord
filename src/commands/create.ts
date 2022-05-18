import {CommandInteraction, Role, TextChannel} from 'discord.js';
import {SlashCommandSubcommandBuilder} from '@discordjs/builders';
import {createPanel} from '../util/panel';

export const command = new SlashCommandSubcommandBuilder()
    .setName('create')
    .setDescription('新しいパネルを作ります');

[...Array(20).keys()]
    .forEach((index) => {
        command
            .addStringOption((option) =>
                option
                    .setName(`select${index + 1}`)
                    .setDescription('パネルに追加する選択肢です。')
                    .setRequired(index === 0)
            )
    });
[...Array(5).keys()]
    .forEach((index) => {
        command
            .addRoleOption((option) =>
                option
                    .setName(`role${index + 1}`)
                    .setDescription('役職')
            )
    });


export const handler = async (interaction: CommandInteraction<'cached'>) => {
    const options = interaction.options
    const selects = [...Array(20).keys()]
        .map((index) => options.getString(`select${index + 1}`))
        .filter((value): value is string => !!(value));
    const roles = [...Array(5).keys()]
        .map((index) => options.getRole(`role${index + 1}`))
        .filter((value): value is Role => !!(value));
    const panel = createPanel(selects, roles);
    try{
        await interaction.reply(Object.assign({ephemeral: false}, panel));
    }
    catch (e) {
        console.error(e);
    }
}