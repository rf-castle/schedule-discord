import {
    EmbedField,
    Message,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    MessageOptions,
    Role,
    Snowflake
} from 'discord.js';

function userNicknameMention<C extends Snowflake>(userId: C): `<@!${C}>` {
    return `<@!${userId}>`
}

const pattern = /(.+)\((\d+)\)/

export const createPanel = (select: Array<string>, roles: Role[])=> {
    const embed = new MessageEmbed();
    const rows: MessageActionRow[] = [];
    select.forEach((s, i) => {
        embed.addField(`${s}(0)`, "なし", false);
        const button = new MessageButton()
            .setLabel(s)
            .setStyle('PRIMARY')
            .setCustomId(s);
        let row;
        if(rows.length === 0 || rows.at(rows.length - 1)!.components.length >= 5){
            row = new MessageActionRow();
            rows.push(row);
        }
        else{
            row = rows.at(rows.length - 1)!
        }
        row.addComponents(button);
    })
    roles.forEach((role) => {
        if(embed.fields.length >= 20){
            return;
        }
        embed.addField(
            role.name + `持ってる人で回答がない人(${role.members.size})`,
            role.members.map((r) => userNicknameMention(r.id)).join(""),
            false
        );
    })

    return {
        embeds: [embed],
        components: rows
    }
}

export const toggleMemberFromPanel = (embed: MessageEmbed, which: number, who: Snowflake) => {
    const field = embed.fields.at(which)!;
    const match = pattern.exec(field.name)!;
    let count = Number(match[2]);
    const mention = userNicknameMention(who);
    if (!field.value.includes(mention)){
        addMemberFromPanel(field, who)
    }
    else{
        removeMemberFromPanel(field, who);
    }
    return embed
}


const getCount = (field: EmbedField) => {
    const match = pattern.exec(field.name)!;
    return Number(match[2]);
}

const setCount = (field: EmbedField, count: number) => {
    const match = pattern.exec(field.name)!;
    field.name = `${match[1]}(${count})`
    return field;
}

const addMemberFromPanel = (field: EmbedField, who: Snowflake) => {
    const mention = userNicknameMention(who);
    let count = getCount(field);
    field.value = field.value.replace(mention, "");
    if(field.value === 'なし'){
        field.value = mention
    }
    else{
        field.value += mention
    }
    count += 1;
    return setCount(field, count);
}

export const removeMemberFromPanel = (field: EmbedField, who: Snowflake) => {
    const mention = userNicknameMention(who);
    let count = getCount(field);
    let value = field.value.replace(mention, "");
    if (value !== field.value){
        count -= 1;
    }
    if (value.length === 0){
        field.value = "なし"
    }
    else{
        field.value = value;
    }
    return setCount(field, count);
}


export const searchIndex = (embed: MessageEmbed, id: string) => {
    return embed.fields.findIndex((field) => {
        const match = pattern.exec(field.name);
        if (!match){
            return false;
        }
        return match[1] === id
    })
}

export const countComponent = (message: Message) => {
    return message.components
        .map((v) => v.components.length)
        .reduce((sum, element) => sum + element, 0);
}