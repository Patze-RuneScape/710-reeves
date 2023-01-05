import { ModalSubmitInteraction, InteractionResponse, Message, APIEmbedField, EmbedBuilder, TextChannel } from 'discord.js';
import { Trial } from '../entity/Trial';
import { TrialParticipation } from '../entity/TrialParticipation';
import Bot from '../Bot';

export default interface ModalHandler { client: Bot; id: string; interaction: ModalSubmitInteraction }

interface TrialChannels {
    mock: string[];
    real: string[];
}

export default class ModalHandler {
    constructor(client: Bot, id: string, interaction: ModalSubmitInteraction<'cached'>) {
        this.client = client;
        this.id = id;
        this.interaction = interaction;
        switch (id) {
            case 'passTrialee': this.passTrialee(interaction); break;
            case 'failTrialee': this.failTrialee(interaction); break;
            default: break;
        }
    }

    get userId(): string {
        return this.interaction.user.id;
    }

    get currentTime(): number {
        return Math.round(Date.now() / 1000)
    }

    public getTrialType = (channelId: string) => {
        const { channels } = this.client.util;
        const trialChannels: TrialChannels = {
            mock: [channels.naMock, channels.euMock],
            real: [channels.naTrial, channels.euTrial]
        }
        if (trialChannels.mock.includes(channelId)) {
            return 'mock';
        } else {
            return 'real';
        }
    }

    public trialResultChannels = (channelId: string) => {
        const { channels } = this.client.util;
        const trialChannels: TrialChannels = {
            mock: [channels.naMock, channels.euMock],
            real: [channels.naTrial, channels.euTrial]
        }
        if (trialChannels.mock.includes(channelId)) {
            return channels.mockResult;
        } else {
            return channels.trialResult;
        }
    }

    public assignRole = async (interaction: ModalSubmitInteraction<'cached'>, roleId: string, trialeeId: string) => {
        
        const { roles, stripRole } = this.client.util;
        
        const trialee = await interaction.guild?.members.fetch(trialeeId);
        const trialeeRoles = await trialee?.roles.cache.map(role => role.id) || [];

        // Remove trialee
        if (trialeeRoles?.includes(stripRole(roles.trialee))) {
            await trialee?.roles.remove(stripRole(roles.trialee));
        }

        // Add 7-Man tag
        if (!trialeeRoles?.includes(stripRole(roles.sevenMan))) {
            await trialee?.roles.add(stripRole(roles.sevenMan));
        }

        await trialee?.roles.add(roleId);
    }

    public async saveTrial(interaction: ModalSubmitInteraction<'cached'>, trialeeId: string, roleId: string, userId: string, fields: APIEmbedField[]): Promise<void> {
        // Create new Trial.
        const { dataSource } = this.client;
        const trialRepository = dataSource.getRepository(Trial);
        const trialObject = new Trial();
        trialObject.trialee = trialeeId;
        trialObject.host = userId;
        trialObject.role = roleId;
        trialObject.link = interaction.message?.url || '';
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

    private async passTrialee(interaction: ModalSubmitInteraction<'cached'>): Promise<Message<true> | InteractionResponse<true> | void> {
        const { colours, channels } = this.client.util;
        await interaction.deferReply({ ephemeral: true });
        const hasRolePermissions: boolean | undefined = await this.client.util.hasRolePermissions(this.client, ['trialeeTeacher', 'trialHost', 'organizer', 'admin', 'owner'], interaction);
        const messageEmbed = interaction.message?.embeds[0];
        const trialType = this.getTrialType(interaction.message?.channel.id || channels.mockResult);
        const replyEmbed: EmbedBuilder = new EmbedBuilder();
        if (!messageEmbed) {
            replyEmbed.setColor(colours.discord.red)
            replyEmbed.setDescription('No embed message detected.')
            return await interaction.editReply({ embeds: [replyEmbed] });
        }
        const messageContent: string | undefined = messageEmbed.data.description;
        const fields: APIEmbedField[] = messageEmbed.fields;
        const hostExpression: RegExp = /\`Host:\` <@(\d+)>/;
        const trialeeExpression: RegExp = /\`Discord:\` <@(\d+)>/;
        const roleExpression: RegExp = /\`Tag:\` <@&(\d+)>/;
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
            if ((interaction.user.id === userId) || hasElevatedRole) {
                const splitResults = messageContent?.split('⬥');
                if (!splitResults) {
                    replyEmbed.setColor(colours.discord.red)
                    replyEmbed.setDescription(`Message could not be parsed correctly.`)
                    return await interaction.editReply({ embeds: [replyEmbed] });
                }
                const messageContentWithoutStarted = splitResults[0];
                const dirtyStarted = splitResults[1];
                const started = dirtyStarted?.replace('> **Team**', '').trim();
                const newMessageContent = `${messageContentWithoutStarted}⬥ ${started}\n⬥ <@${trialeeId}> ${trialType === 'mock' ? 'is ready for trial' : 'successfully passed'} <t:${this.currentTime}:R>!\n\n> **Team**`;

                // Save trial to database.
                await this.saveTrial(interaction, trialeeId, roleId, userId, fields);

                // Give the trialee the correct role if real trial.
                if (trialType === 'real') {
                    await this.assignRole(interaction, roleId, trialeeId);
                }

                const resultChannelId = this.trialResultChannels(interaction.message?.channel.id || channels.mockResult);

                const resultChannel = await this.client.channels.fetch(resultChannelId) as TextChannel;


                const gemURL = interaction.fields.getTextInputValue('gemURL');
	            const comments = interaction.fields.getTextInputValue('comments');

                const resultEmbed: EmbedBuilder = new EmbedBuilder();
                resultEmbed.setColor(colours.discord.green)
                resultEmbed.setDescription(`
                > **General**\n
                **Discord:** <@${trialeeId}>
                **Tag:** <@&${roleId}>
                ${trialType === 'mock' ? '**Ready for Trial:**' : '**Passed:**'} ✅\n
                ${comments ? `> **Notes**\n\n${comments}\n` : ''}
                > **Team**
                `)
                resultEmbed.setFields(fields)
                
                await resultChannel.send({
                    content: `> **${trialType === 'mock' ? 'Mock Trial' : 'Trial'} hosted by <@${userId}>** on <t:${this.currentTime}:D>`,
                    embeds: [resultEmbed],
                    allowedMentions: {
                        users: [],
                        roles: []
                    }
                });

                if (gemURL) {
                    await resultChannel.send({
                        content: gemURL,
                        allowedMentions: {
                            users: [],
                            roles: []
                        }
                    });
                };

                const newEmbed = new EmbedBuilder()
                    .setColor(colours.discord.green)
                    .setFields(fields)
                    .setDescription(`${newMessageContent}`);
                await interaction.message?.edit({ content: '', embeds: [newEmbed], components: [] });
                replyEmbed.setColor(colours.discord.green);
                replyEmbed.setDescription(`Trialee successfully passed!`);
                return await interaction.editReply({ embeds: [replyEmbed] });
            } else {
                replyEmbed.setColor(colours.discord.red)
                replyEmbed.setDescription(`Only <@${userId}> or an elevated role can pass this trialee.`)
                return await interaction.editReply({ embeds: [replyEmbed] });
            }
        } else {
            this.client.logger.log(
                {
                    message: `Attempted restricted permissions. { command: Pass Trialee, user: ${interaction.user.username}, channel: ${interaction.channel} }`,
                    handler: this.constructor.name,
                },
                true
            );
            return await interaction.editReply({ content: 'You do not have permissions to run this command. This incident has been logged.' });
        }
        // console.log(interaction.message?.content)
        // await interaction.reply({ content: 'Your submission was received successfully!' });
    }

    private async failTrialee(interaction: ModalSubmitInteraction<'cached'>): Promise<Message<true> | InteractionResponse<true> | void> {
        const { colours } = this.client.util;
        await interaction.deferReply({ ephemeral: true });
        const hasRolePermissions: boolean | undefined = await this.client.util.hasRolePermissions(this.client, ['trialeeTeacher', 'trialHost', 'organizer', 'admin', 'owner'], interaction);
        const replyEmbed: EmbedBuilder = new EmbedBuilder();
        const messageEmbed = interaction.message?.embeds[0];
        if (!messageEmbed) {
            replyEmbed.setColor(colours.discord.red)
            replyEmbed.setDescription('No embed message detected.')
            return await interaction.editReply({ embeds: [replyEmbed] });
        }
        const messageContent: string | undefined = messageEmbed.data.description;
        const fields: APIEmbedField[] = messageEmbed.fields;
        const hostExpression: RegExp = /\`Host:\` <@(\d+)>/;
        const trialeeExpression: RegExp = /\`Discord:\` <@(\d+)>/;
        const roleExpression: RegExp = /\`Tag:\` <@&(\d+)>/;
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
            if ((interaction.user.id === userId) || hasElevatedRole) {
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
                await interaction.message?.edit({ content: '', embeds: [newEmbed], components: [] });
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