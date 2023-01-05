import { ActionRowBuilder, APIEmbedField, ButtonBuilder, ButtonInteraction, ButtonStyle, Embed, EmbedBuilder, InteractionResponse, Message, ModalActionRowComponentBuilder, ModalBuilder, TextChannel, TextInputBuilder, TextInputStyle } from 'discord.js';
import { Trial } from '../entity/Trial';
import { TrialParticipation } from '../entity/TrialParticipation';
import Bot from '../Bot';

export default interface ButtonHandler { client: Bot; id: string; interaction: ButtonInteraction }

export default class ButtonHandler {
    constructor(client: Bot, id: string, interaction: ButtonInteraction<'cached'>) {
        this.client = client;
        this.id = id;
        this.interaction = interaction;
        switch (id) {
            case 'rejectRoleAssign': this.rejectRoleAssign(interaction); break;
            case 'passTrialee': this.passTrialee(interaction); break;
            case 'failTrialee': this.failTrialee(interaction); break;
            case 'selectBase': this.selectBase(interaction); break;
            case 'selectHammer': this.selectHammer(interaction); break;
            case 'selectFree': this.selectFree(interaction); break;
            case 'selectUmbra': this.selectUmbra(interaction); break;
            case 'selectGlacies': this.selectGlacies(interaction); break;
            case 'selectCruor': this.selectCruor(interaction); break;
            case 'selectFumus': this.selectFumus(interaction); break;
            case 'disbandTrial': this.disbandTrial(interaction); break;
            case 'startTrial': this.startTrial(interaction); break;
            default: break;
        }
    }

    get userId(): string {
        return this.interaction.user.id;
    }

    get currentTime(): number {
        return Math.round(Date.now() / 1000)
    }

    public async saveTrial(interaction: ButtonInteraction<'cached'>, trialeeId: string, roleId: string, userId: string, fields: APIEmbedField[]): Promise<void> {
        // Create new Trial.
        const { dataSource } = this.client;
        const trialRepository = dataSource.getRepository(Trial);
        const trialObject = new Trial();
        trialObject.trialee = trialeeId;
        trialObject.host = userId;
        trialObject.role = roleId;
        trialObject.link = interaction.message.url;
        const trial = await trialRepository.save(trialObject);

        // Update Trial Attendees

        const trialParticipants: TrialParticipation[] = [];
        fields.forEach((member: APIEmbedField) => {
            if (member.value !== '`Empty`' && !member.value.includes('Trialee')) {
                const userIdRegex = /<@(\d+)>/;
                const userIdMatch = member.value.match(userIdRegex);
                if (userIdMatch) {
                    const participant = new TrialParticipation();
                    participant.participant = userIdMatch[1];;
                    participant.role = member.name;
                    participant.trial = trial;
                    trialParticipants.push(participant);
                }
            }
        })

        // Save trial attendees

        const participantReposittory = dataSource.getRepository(TrialParticipation);
        await participantReposittory.save(trialParticipants);
    }

    public async handleRoleSelection(interaction: ButtonInteraction<'cached'>, roleString: string): Promise<Message<true> | InteractionResponse<true> | void> {

        const { colours, checkForUserId, getEmptyObject, getTeamCount } = this.client.util;

        await interaction.deferReply({ ephemeral: true });
        const hasRolePermissions = await this.client.util.hasRolePermissions(this.client, ['trialTeam', 'mockTrialFiller'], interaction);
        if (hasRolePermissions) {
            const messageEmbed = interaction.message.embeds[0];
            const messageContent = messageEmbed.data.description;
            const fields = messageEmbed.fields;
            const existingRole = checkForUserId(`<@${interaction.user.id}>`, fields);
            const replyEmbed = new EmbedBuilder();
            if (existingRole) {
                const { obj: role, index } = existingRole;
                if (role.name.includes(roleString)) {
                    fields[index].value = '`Empty`';
                    replyEmbed.setColor(colours.discord.green).setDescription(`Successfully unassigned from **${roleString}**.`);
                } else {
                    replyEmbed.setColor(colours.discord.red).setDescription('You are signed up as a different role. Unassign from that role first.');
                }
            } else {
                const firstEmptyObject = getEmptyObject(roleString, fields);
                if (firstEmptyObject) {
                    const { index } = firstEmptyObject;
                    fields[index].value = `<@${interaction.user.id}>`;
                    replyEmbed.setColor(colours.discord.green).setDescription(`Successfully assigned to **${roleString}**.`);
                } else {
                    replyEmbed.setColor(colours.discord.red).setDescription(`**${roleString}** is already taken.`);
                }
            }
            const newEmbed = new EmbedBuilder()
                .setColor(messageEmbed.color)
                .setDescription(`${messageContent}`)
                .setFields(fields)
                .setFooter({ text: `${getTeamCount(fields)}/7 Players` });
            await interaction.message.edit({ embeds: [newEmbed] })
            return await interaction.editReply({ embeds: [replyEmbed] });
        } else {
            this.client.logger.log(
                {
                    message: `Attempted restricted permissions. { command: Select ${roleString} Role, user: ${interaction.user.username}, channel: ${interaction.channel} }`,
                    handler: this.constructor.name,
                },
                true
            );
            return await interaction.editReply({ content: 'You do not have permissions to run this command. This incident has been logged.' });
        }
    }

    private async selectBase(interaction: ButtonInteraction<'cached'>): Promise<Message<true> | InteractionResponse<true> | void> {
        await this.handleRoleSelection(interaction, 'Base');
    }

    private async selectHammer(interaction: ButtonInteraction<'cached'>): Promise<Message<true> | InteractionResponse<true> | void> {
        await this.handleRoleSelection(interaction, 'Hammer');
    }

    private async selectFree(interaction: ButtonInteraction<'cached'>): Promise<Message<true> | InteractionResponse<true> | void> {
        await this.handleRoleSelection(interaction, 'Free');
    }

    private async selectUmbra(interaction: ButtonInteraction<'cached'>): Promise<Message<true> | InteractionResponse<true> | void> {
        await this.handleRoleSelection(interaction, 'Umbra');
    }

    private async selectGlacies(interaction: ButtonInteraction<'cached'>): Promise<Message<true> | InteractionResponse<true> | void> {
        await this.handleRoleSelection(interaction, 'Glacies');
    }

    private async selectCruor(interaction: ButtonInteraction<'cached'>): Promise<Message<true> | InteractionResponse<true> | void> {
        await this.handleRoleSelection(interaction, 'Cruor');
    }

    private async selectFumus(interaction: ButtonInteraction<'cached'>): Promise<Message<true> | InteractionResponse<true> | void> {
        await this.handleRoleSelection(interaction, 'Fumus');
    }

    private async rejectRoleAssign(interaction: ButtonInteraction<'cached'>): Promise<Message<true> | InteractionResponse<true> | void> {
        await interaction.deferReply({ ephemeral: true });

        const { hasOverridePermissions, hasRolePermissions } = this.client.util;

        const rolePermissions = await hasRolePermissions(this.client, ['organizer', 'admin', 'owner'], interaction);
        const overridePermissions = await hasOverridePermissions(interaction, 'assign');

        if (rolePermissions || overridePermissions) {
            const messageEmbed = interaction.message.embeds[0];
            const messageContent = messageEmbed.data.description;
            const oldTimestamp = messageEmbed.timestamp ? new Date(messageEmbed.timestamp) : new Date();
            const newEmbed = new EmbedBuilder()
                .setTimestamp(oldTimestamp)
                .setColor(messageEmbed.color)
                .setDescription(`${messageContent}\n\n> Role Rejected by <@${this.userId}> <t:${this.currentTime}:R>.`);
            const assignedRoles = messageContent?.match(/<@&\d*\>/gm)?.map(unstrippedRole => this.client.util.stripRole(unstrippedRole));
            const userIdRegex = messageContent?.match(/to <@\d*\>/gm);
            const messageIdRegex = messageContent?.match(/\[\d*\]/gm)
            let dirtyUserId;
            let dirtyMessageId;
            if (!assignedRoles) return;
            if (userIdRegex) dirtyUserId = userIdRegex[0];
            if (messageIdRegex) dirtyMessageId = messageIdRegex[0];
            if (dirtyUserId) {
                const userId = dirtyUserId.slice(5, -1);
                const user = await interaction.guild?.members.fetch(userId);
                for await (const assignedId of assignedRoles) {
                    await user.roles.remove(assignedId);
                };
            }
            if (dirtyMessageId && messageContent) {
                try {
                    const messageId = dirtyMessageId.slice(1, -1);
                    const channelId = messageContent.split('/channels/')[1].split('/')[1];
                    const channel = await interaction.guild.channels.fetch(channelId) as TextChannel;
                    const message = await channel.messages.fetch(messageId);
                    await message.delete();
                }
                catch (err) { }
            }
            await interaction.message.edit({ embeds: [newEmbed], components: [] })
            const replyEmbed = new EmbedBuilder()
                .setColor(this.client.util.colours.discord.green)
                .setDescription('Role successfully rejected!');
            return await interaction.editReply({ embeds: [replyEmbed] });
        } else {
            this.client.logger.log(
                {
                    message: `Attempted restricted permissions. { command: Reject Role Assign, user: ${interaction.user.username}, channel: ${interaction.channel} }`,
                    handler: this.constructor.name,
                },
                true
            );
            return await interaction.editReply({ content: 'You do not have permissions to run this command. This incident has been logged.' });
        }
    }

    private async passTrialee(interaction: ButtonInteraction<'cached'>): Promise<Message<true> | InteractionResponse<true> | void> {

        const { hasOverridePermissions, hasRolePermissions } = this.client.util;

        const rolePermissions = await hasRolePermissions(this.client, ['trialeeTeacher', 'trialHost', 'organizer', 'admin', 'owner'], interaction);
        const overridePermissions = await hasOverridePermissions(interaction, 'assign');

        if (rolePermissions || overridePermissions) {
            const modal = new ModalBuilder()
                .setCustomId('passTrialee')
                .setTitle('Pass Trialee');

            // Create the text input components
            const gemURL = new TextInputBuilder()
                .setCustomId('gemURL')
                .setLabel("Challenge Gem URL")
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            const comments = new TextInputBuilder()
                .setCustomId('comments')
                .setLabel("Comments")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false);

            const firstActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(gemURL);
            const secondActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(comments);

            // Add inputs to the modal
            modal.addComponents(firstActionRow, secondActionRow);

            // Show the modal to the user
            await interaction.showModal(modal);
        } else {
            await interaction.deferReply({ ephemeral: true });
            this.client.logger.log(
                {
                    message: `Attempted restricted permissions. { command: Pass Trialee, user: ${interaction.user.username}, channel: ${interaction.channel} }`,
                    handler: this.constructor.name,
                },
                true
            );
            return await interaction.editReply({ content: 'You do not have permissions to run this command. This incident has been logged.' });
        }
    }

    private async disbandTrial(interaction: ButtonInteraction<'cached'>): Promise<Message<true> | InteractionResponse<true> | void> {
        const { colours } = this.client.util;
        await interaction.deferReply({ ephemeral: true });
        const hasRolePermissions: boolean | undefined = await this.client.util.hasRolePermissions(this.client, ['trialeeTeacher', 'trialHost', 'organizer', 'admin', 'owner'], interaction);
        const messageEmbed: Embed = interaction.message.embeds[0];
        const messageContent: string | undefined = messageEmbed.data.description;
        const expression: RegExp = /\`Host:\` <@(\d+)>/;
        const replyEmbed: EmbedBuilder = new EmbedBuilder();
        let userId: string = '';
        if (messageContent) {
            const matches = messageContent.match(expression);
            userId = matches ? matches[1] : '';
            if (!userId) {
                // Should never really make it to this.
                replyEmbed.setColor(colours.discord.red)
                replyEmbed.setDescription('Host could not be detected.')
                return await interaction.editReply({ embeds: [replyEmbed] });
            }
        }
        if (hasRolePermissions) {
            const hasElevatedRole = await this.client.util.hasRolePermissions(this.client, ['trialeeTeacher', 'trialHost', 'organizer', 'admin', 'owner'], interaction);
            if ((interaction.user.id === userId) || hasElevatedRole) {
                const newMessageContent = messageContent?.replace('> **Team**', '');
                const newEmbed = new EmbedBuilder()
                    .setColor(messageEmbed.color)
                    .setDescription(`${newMessageContent}> Trial disbanded <t:${this.currentTime}:R>.`);
                await interaction.message.edit({ content: '', embeds: [newEmbed], components: [] });
                replyEmbed.setColor(colours.discord.green);
                replyEmbed.setDescription(`Trial successfully disbanded!`);
                return await interaction.editReply({ embeds: [replyEmbed] });
            } else {
                replyEmbed.setColor(colours.discord.red)
                replyEmbed.setDescription(`Only <@${userId}> or an elevated role can disband this trial.`)
                return await interaction.editReply({ embeds: [replyEmbed] });
            }
        } else {
            this.client.logger.log(
                {
                    message: `Attempted restricted permissions. { command: Disband Trial, user: ${interaction.user.username}, channel: ${interaction.channel} }`,
                    handler: this.constructor.name,
                },
                true
            );
            return await interaction.editReply({ content: 'You do not have permissions to run this command. This incident has been logged.' });
        }
    }

    private async startTrial(interaction: ButtonInteraction<'cached'>): Promise<Message<true> | InteractionResponse<true> | void> {
        const { colours } = this.client.util; // Add isTeamFull if team full is required again.
        await interaction.deferReply({ ephemeral: true });
        const hasRolePermissions: boolean | undefined = await this.client.util.hasRolePermissions(this.client, ['trialeeTeacher', 'trialHost', 'organizer', 'admin', 'owner'], interaction);
        const messageEmbed: Embed = interaction.message.embeds[0];
        const messageContent: string | undefined = messageEmbed.data.description;
        const fields: APIEmbedField[] = messageEmbed.fields;
        const expression: RegExp = /\`Host:\` <@(\d+)>/;
        const replyEmbed: EmbedBuilder = new EmbedBuilder();
        let userId: string = '';
        if (messageContent) {
            const matches = messageContent.match(expression);
            userId = matches ? matches[1] : '';
            if (!userId) {
                // Should never really make it to this.
                replyEmbed.setColor(colours.discord.red)
                replyEmbed.setDescription('Host could not be detected.')
                return await interaction.editReply({ embeds: [replyEmbed] });
            }
        }
        if (hasRolePermissions) {
            const hasElevatedRole = await this.client.util.hasRolePermissions(this.client, ['trialeeTeacher', 'trialHost', 'organizer', 'admin', 'owner'], interaction);
            if ((interaction.user.id === userId) || hasElevatedRole) {
                // if (isTeamFull(fields)) {
                const trialStarted = `> **Moderation**\n\n ⬥ Trial started <t:${this.currentTime}:R>.\n\n> **Team**`;
                const newMessageContent = messageContent?.replace('> **Team**', trialStarted);
                const newEmbed = new EmbedBuilder()
                    .setColor(messageEmbed.color)
                    .setFields(fields)
                    .setDescription(`${newMessageContent}`);
                const controlPanel = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('passTrialee')
                            .setLabel('Pass')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('failTrialee')
                            .setLabel('Fail')
                            .setStyle(ButtonStyle.Danger)
                    );
                await interaction.message.edit({ content: '', embeds: [newEmbed], components: [controlPanel] });
                replyEmbed.setColor(colours.discord.green);
                replyEmbed.setDescription(`Trial successfully started!`);
                return await interaction.editReply({ embeds: [replyEmbed] });
                // } else {
                //     replyEmbed.setColor(colours.discord.red)
                //     replyEmbed.setDescription(`The team is not full yet.`)
                //     return await interaction.editReply({ embeds: [replyEmbed] });
                // }
            } else {
                replyEmbed.setColor(colours.discord.red)
                replyEmbed.setDescription(`Only <@${userId}> or an elevated role can start this trial.`)
                return await interaction.editReply({ embeds: [replyEmbed] });
            }
        } else {
            this.client.logger.log(
                {
                    message: `Attempted restricted permissions. { command: Start Trial, user: ${interaction.user.username}, channel: ${interaction.channel} }`,
                    handler: this.constructor.name,
                },
                true
            );
            return await interaction.editReply({ content: 'You do not have permissions to run this command. This incident has been logged.' });
        }
    }

    private async failTrialee(interaction: ButtonInteraction<'cached'>): Promise<Message<true> | InteractionResponse<true> | void> {
        const { colours } = this.client.util;
        await interaction.deferReply({ ephemeral: true });
        const hasRolePermissions: boolean | undefined = await this.client.util.hasRolePermissions(this.client, ['trialeeTeacher', 'trialHost', 'organizer', 'admin', 'owner'], interaction);
        const messageEmbed: Embed = interaction.message.embeds[0];
        const messageContent: string | undefined = messageEmbed.data.description;
        const fields: APIEmbedField[] = messageEmbed.fields;
        const hostExpression: RegExp = /\`Host:\` <@(\d+)>/;
        const trialeeExpression: RegExp = /\`Discord:\` <@(\d+)>/;
        const roleExpression: RegExp = /\`Tag:\` <@&(\d+)>/;
        const replyEmbed: EmbedBuilder = new EmbedBuilder();
        let userId: string = '';
        let trialeeId: string = '';
        let roleId: string = '';
        if (messageContent) {
            const hostMatches = messageContent.match(hostExpression);
            const trialeeMatches = messageContent.match(trialeeExpression);
            const roleMatches = messageContent.match(roleExpression);
            userId = hostMatches ? hostMatches[1] : '';
            trialeeId = trialeeMatches ? trialeeMatches[1] : '';
            roleId = roleMatches ? roleMatches[1] : '';
            if (!userId || !trialeeId || !roleId) {
                // Should never really make it to this.
                replyEmbed.setColor(colours.discord.red)
                replyEmbed.setDescription('Host, Trialee or Tag could not be detected.')
                return await interaction.editReply({ embeds: [replyEmbed] });
            }
        }
        if (hasRolePermissions) {
            const hasElevatedRole = await this.client.util.hasRolePermissions(this.client, ['trialeeTeacher', 'trialHost', 'organizer', 'admin', 'owner'], interaction);
            if ((interaction.user.id === userId)|| hasElevatedRole) {
                const splitResults = messageContent?.split('⬥');
                if (!splitResults) {
                    replyEmbed.setColor(colours.discord.red)
                    replyEmbed.setDescription(`Message could not be parsed correctly.`)
                    return await interaction.editReply({ embeds: [replyEmbed] });
                }
                const messageContentWithoutStarted = splitResults[0];
                const dirtyStarted = splitResults[1];
                const started = dirtyStarted?.replace('> **Team**', '').trim();
                const newMessageContent = `${messageContentWithoutStarted}⬥ ${started}\n⬥ <@${trialeeId}> failed <t:${this.currentTime}:R>!\n\n> **Team**`;

                // Save trial to database.
                await this.saveTrial(interaction, trialeeId, roleId, userId, fields);

                const newEmbed = new EmbedBuilder()
                    .setColor(colours.discord.red)
                    .setFields(fields)
                    .setDescription(`${newMessageContent}`);
                await interaction.message.edit({ content: '', embeds: [newEmbed], components: [] });
                replyEmbed.setColor(colours.discord.green);
                replyEmbed.setDescription(`Trialee failed!`);
                return await interaction.editReply({ embeds: [replyEmbed] });
            } else {
                replyEmbed.setColor(colours.discord.red)
                replyEmbed.setDescription(`Only <@${userId}> or an elevated role can fail this trialee.`)
                return await interaction.editReply({ embeds: [replyEmbed] });
            }
        } else {
            this.client.logger.log(
                {
                    message: `Attempted restricted permissions. { command: Fail Trialee, user: ${interaction.user.username}, channel: ${interaction.channel} }`,
                    handler: this.constructor.name,
                },
                true
            );
            return await interaction.editReply({ content: 'You do not have permissions to run this command. This incident has been logged.' });
        }
    }
}