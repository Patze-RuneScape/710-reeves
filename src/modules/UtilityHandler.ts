import * as config from '../../config.json';
import { EmbedBuilder, ChatInputCommandInteraction, Interaction, APIEmbedField } from 'discord.js';
import Bot from '../Bot';
import { Override } from '../entity/Override';

export default interface UtilityHandler {
    client: Bot;
    config: typeof config;
    random(array: Array<any>): Array<number>;
    loadingEmbed: EmbedBuilder;
    loadingText: string;
}

interface Channels {
    [channelName: string]: string;
}

interface Roles {
    [roleName: string]: string;
}

interface Emojis {
    [emojiName: string]: string;
}

interface Categories {
    killCount: string[]
    collectionLog: string[]
}

export default class UtilityHandler {
    constructor(client: Bot) {
        this.client = client;
        this.config = config;
        this.random = (array) => array[Math.floor(Math.random() * array.length)];
        this.deleteMessage = this.deleteMessage;
        this.loadingEmbed = new EmbedBuilder().setAuthor({ name: 'Loading...' });
        this.loadingText = '<a:Typing:598682375303593985> **Loading...**';
    }

    get colours() {
        return {
            green: 2067276,
            aqua: 1146986,
            blue: 2123412,
            red: 10038562,
            lightgrey: 10070709,
            gold: 12745742,
            default: 5198940,
            lightblue: 302332,
            darkgrey: 333333,
            discord: {
                green: 5763719,
                red: 15548997
            }
        }
    }

    get emojis(): Emojis {
        return {
            gem1: '<:gem1:1057231061375008799>',
            gem2: '<:gem2:1057231076239605770>',
            gem3: '<:gem3:1057231089854324736>',
        }
    }

    get channels(): Channels {
        if (process.env.ENVIRONMENT === 'DEVELOPMENT') {
            return {
                achievementsAndLogs: '1058275396208054402',
                botRoleLog: '1058275602060288101',
            }
        }
        return {
            achievementsAndLogs: '1058373790289109092',
            botRoleLog: '1058373508314431528',
        }
    }

    get roles(): Roles {
        if (process.env.ENVIRONMENT === 'DEVELOPMENT') {
            return {
                trialHost: '<@&1057867190742814787>',
                organizer: '<@&1057867190776385586>',
                admin: '<@&1057867190776385589>',
                owner: '<@&1057867190776385590>',
                kc10k: '<@&1057867190637953033>',
                kc20k: '<@&1057867190637953034>',
                kc30k: '<@&1057867190650540086>',
                kc40k: '<@&1057867190709256256>',
                kc50k: '<@&1057867190650540087>',
                kc60k: '<@&1057867190709256259>',
                kc70k: '<@&1057867190709256261>',
                ofThePraesul: '<@&1057867190650540082>',
                goldenPraesul: '<@&1057867190709256260>',
                trialee: '<@&1057867190596010033>',
            }
        }
        return {
            trialHost: '<@&635646418123751434>',
            organizer: '<@&374393957645287426>',
            admin: '<@&315714278940213258>',
            owner: '<@&722641577733914625>',
            kc10k: '<@&963277353927204864>',
            kc20k: '<@&963277215955583066>',
            kc30k: '<@&963276930910666752>',
            kc40k: '<@&963276807702982676>',
            kc50k: '<@&963276584775720980>',
            kc60k: '<@&962002662616858785>',
            kc70k: '<@&1020821253155721226>',
            ofThePraesul: '<@&474307399851835414>',
            goldenPraesul: '<@&589268459502960642>',
            trialee: '<@&666034554150322200>',
        }
    }

    get categories(): Categories {
        return {
            killCount: ['kc10k', 'kc20k', 'kc30k', 'kc40k', 'kc50k', 'kc60k', 'kc70k'],
            collectionLog: ['ofThePraesul', 'goldenPraesul']
        }
    }

    public stripRole = (role: string) => {
        return role.slice(3, -1)
    }

    public getKeyFromValue = (obj: any, value: string): any => {
        return Object.keys(obj).find(key => obj[key] === value)
    }

    public categorize = (role: string): string => {
        let category = '';
        if (this.categories.killCount.includes(role)) {
            category = 'killCount';
        } else if (this.categories.collectionLog.includes(role)) {
            category = 'collectionLog';
        } else {
            category = ''
        }
        return category;
    }

    public categorizeChannel = (role: string) => {
        if (this.categories.killCount.includes(role) || this.categories.collectionLog.includes(role)) {
            return 'achievementsAndLogs'
        } else {
            return ''
        }
    }

    public hasRolePermissions = async (client: Bot, roleList: string[], interaction: Interaction) => {
        if (!interaction.inCachedGuild()) return;
        const validRoleIds = roleList.map((key) => this.stripRole(this.roles[key]));
        const user = await interaction.guild.members.fetch(interaction.user.id);
        const userRoles = user.roles.cache.map((role) => role.id);
        const intersection = validRoleIds.filter((roleId) => userRoles.includes(roleId));
        return intersection.length > 0;
    }

    public hasOverridePermissions = async (interaction: Interaction, feature: string) => {
        if (!interaction.inCachedGuild()) return;
        const { dataSource } = this.client;
        const repository = dataSource.getRepository(Override);

        const existingPermissions = await repository.findOne({
            where: {
                user: interaction.user.id,
                feature: feature
            }
        })

        return existingPermissions ? true : false;
    }

    public deleteMessage(interaction: ChatInputCommandInteraction<any>, id: string) {
        return interaction.channel?.messages.fetch(id).then((message) => message.delete());
    }

    public removeArrayIndex(array: Array<any>, indexID: number): any[] {
        return array.filter((_: any, index) => index != indexID - 1);
    }

    public checkURL(string: string): boolean {
        try {
            new URL(string);
            return true;
        } catch (error) {
            return false;
        }
    }

    public trim(string: string, max: number): string {
        return string.length > max ? string.slice(0, max) : string;
    }

    public convertMS(ms: number | null): string {
        if (!ms) return 'n/a';
        let seconds = (ms / 1000).toFixed(1),
            minutes = (ms / (1000 * 60)).toFixed(1),
            hours = (ms / (1000 * 60 * 60)).toFixed(1),
            days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
        if (Number(seconds) < 60) return seconds + ' Sec';
        else if (Number(minutes) < 60) return minutes + ' Min';
        else if (Number(hours) < 24) return hours + ' Hrs';
        else return days + ' Days';
    }

    public convertBytes(bytes: number): string {
        const MB = Math.floor((bytes / 1024 / 1024) % 1000);
        const GB = Math.floor(bytes / 1024 / 1024 / 1024);
        if (MB >= 1000) return `${GB.toFixed(1)} GB`;
        else return `${Math.round(MB)} MB`;
    }

    public isValidTime = (timeString: string): boolean => {
        const pattern = /^(0?[0-9]|1[0-9]|2[0-3]):([0-9]|[0-5][0-9])(\.[0-9])?$/gm;
        return pattern.test(timeString);
    }

    public isValidDamage = (damageString: string): boolean => {
        return !isNaN(+damageString);
    }

    public calcDPMInThousands(damage: string, time: string) {
        const [minutes, seconds] = time.split(':').map(Number);
        const secondsAsMinutes = seconds / 60;
        const totalMinutes = minutes + secondsAsMinutes;
        return Math.round((+damage) / totalMinutes / 10) / 100;
    }

    public checkForUserId = (userId: string, objects: APIEmbedField[]): { obj: APIEmbedField, index: number } | undefined => {
        for (let i = 0; i < objects.length; i++) {
            if (objects[i].value === userId) {
                return { obj: objects[i], index: i };
            }
        }
        return undefined;
    };

    public getEmptyObject(targetName: string, objects: APIEmbedField[]): { obj: APIEmbedField, index: number } | undefined {
        const index = objects.findIndex(obj => obj.name === targetName && obj.value === '`Empty`');
        if (index >= 0) {
            const obj = objects[index];
            return { obj: obj, index: index };
        }
        return undefined;
    }

    public isTeamFull(players: APIEmbedField[]): boolean {
        for (const player of players) {
            if (player.value === '`Empty`') {
                return false;
            }
        }
        return true;
    }
}
