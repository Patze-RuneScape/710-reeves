import { ModalSubmitInteraction, InteractionResponse, Message } from 'discord.js';
import Bot from '../Bot';

export default interface ModalHandler { client: Bot; id: string; interaction: ModalSubmitInteraction }

export default class ModalHandler {
    constructor(client: Bot, id: string, interaction: ModalSubmitInteraction<'cached'>) {
        this.client = client;
        this.id = id;
        this.interaction = interaction;
        switch (id) {
            case 'passTrialee': this.passTrialee(interaction); break;
            default: break;
        }
    }

    get userId(): string {
        return this.interaction.user.id;
    }

    get currentTime(): number {
        return Math.round(Date.now() / 1000)
    }

    private async passTrialee(interaction: ModalSubmitInteraction<'cached'>): Promise<Message<true> | InteractionResponse<true> | void> {
        console.log(interaction.message?.content)
        await interaction.reply({ content: 'Your submission was received successfully!' });
    }
}