import {Interaction} from 'discord.js';
import AsyncLock from 'async-lock';
import {countComponent, removeMemberFromPanel, searchIndex, toggleMemberFromPanel} from '../util/panel';
import {allSubCommands, CommandPrefix} from '../commands';


const lock = new AsyncLock();
export const onInteraction = async (interaction: Interaction) =>{
    if (!interaction.inCachedGuild()){
        return
    }
    if(interaction.isCommand()){
        const commandName = interaction.commandName
        if (commandName === CommandPrefix) {
            const target = interaction.options.getSubcommand(true)
            const command = allSubCommands.find(
                ({ command }) => command.name === target
            )
            await command?.handler(interaction)
        }
    }
    if (interaction.isButton()){
        const reply = await interaction.deferUpdate({fetchReply: true});
        const message = interaction.message;
        await lock.acquire(`${interaction.channelId}-${message.id}`, async () =>{
            let embed = interaction.message.embeds.at(0);
            if(!embed){
                await reply.edit({
                    content: "Embedが見つかりません。もしかして消去してしまいましたか？"
                });
                return
            }
            const index = searchIndex(embed, interaction.customId);
            if(typeof index === 'undefined'){
                await reply.edit({
                    content: "該当の選択肢が見つかりません"
                });
                return
            }
            const size = countComponent(message);
            embed = toggleMemberFromPanel(embed, index, interaction.user.id);
            for(let i = size; i < embed.fields.length; i++){
                embed.fields[i] = removeMemberFromPanel(embed.fields[i], interaction.user.id);
            }
            await interaction.message.edit({
                embeds: [embed]
            });
        });
    }
}