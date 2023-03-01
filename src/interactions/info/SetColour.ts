import BotInteraction from '../../types/BotInteraction';
import { ChatInputCommandInteraction, SlashCommandBuilder, Role, EmbedBuilder } from 'discord.js';
export default class SetColour extends BotInteraction {

    get name() {
        return 'set-colour';
    }

    get description() {
        return 'Sets a colour if you are the TotM or LHFotM';
    }

    get slashData() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) => option.setName('colour').setDescription('Hex Colour i.e. #000000').setRequired(true))
    }

    public isValidHexCode(color: string): boolean {
        const regex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        return regex.test(color);
    }

    async run(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });
        const colour: string = interaction.options.getString('colour', true);

        const { roles, colours, stripRole } = this.client.util;

        if (!this.isValidHexCode(colour)) {
            const errorEmbed = new EmbedBuilder()
                .setColor(colours.discord.red)
                .setDescription('Colour is not a valid Hex code.');
            return await interaction.editReply({ embeds: [errorEmbed] });
        }

        const user = await interaction.guild?.members.fetch(interaction.user.id);
        const userRoles = await user?.roles.cache.map(role => role.id) || [];

        if (!userRoles.includes(stripRole(roles['totm'])) && !userRoles.includes(stripRole(roles['lhfotm']))) {
            const errorEmbed = new EmbedBuilder()
                .setColor(colours.discord.red)
                .setDescription('You do not have a role to change.');
            return await interaction.editReply({ embeds: [errorEmbed] });
        }

        try {
            if (userRoles.includes(stripRole(roles['totm']))) {
                const roleObject = await interaction.guild?.roles.fetch(stripRole(roles['totm'])) as Role;
                roleObject.setColor(colour as any);
            };

            if (userRoles.includes(stripRole(roles['lhfotm']))) {
                const roleObject = await interaction.guild?.roles.fetch(stripRole(roles['lhfotm'])) as Role;
                roleObject.setColor(colour as any);
            };

            const replyEmbed = new EmbedBuilder()
                .setColor(colour || (colours.gold as any))
                .setDescription(`Colour set to **${colour}**!`);
            return await interaction.editReply({ embeds: [replyEmbed] });
        } catch {
            const errorEmbed = new EmbedBuilder()
                .setColor(colours.discord.red)
                .setDescription('Something went wrong!');
            return await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
}