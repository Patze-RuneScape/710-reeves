import BotInteraction from '../../types/BotInteraction';
import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, TextChannel } from 'discord.js';

export default class SendColourPanel extends BotInteraction {
    get name() {
        return 'send-colour-panel';
    }

    get description() {
        return 'Sends the panel with Reactions for Colour-Overrides';
    }

    get permissions() {
        return 'ELEVATED_ROLE';
    }

    get slashData() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
    }

    async run(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });

        const { colours, getColourPanelComponents } = this.client.util;
        const channel = interaction.channel as TextChannel;

        const embed = new EmbedBuilder()
            .setTitle('Choose your own colour!')
            .setTimestamp()
            .setColor(colours.discord.green)
            .setDescription('Choose an colour-override from any cosmetic tag you have achieved!\r\nYou need to own the corresponding Tag to be able to select it\'s colour!');
        
        const getComps = getColourPanelComponents.bind(this.client.util)

        await channel.send(
            { embeds: [embed], components: await getComps(interaction)}
        )

        const replyEmbed = new EmbedBuilder()
            .setTitle('Panel send!')
            .setColor(colours.discord.green)
            .setDescription(`Colour-Panel has successfully been created`);
        await interaction.editReply({ embeds: [replyEmbed] });
    }
}