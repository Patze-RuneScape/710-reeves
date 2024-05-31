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

interface Messages {
    [messageId: string]: string;
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
            gem1: '<:gem1:1060561390349324319>',
            gem2: '<:gem2:1060561385987248128>',
            gem3: '<:gem3:1060561383021879366>',
            umbra: '<:umbra:1025086079319162880>',
            glacies: '<:glacies:1025086094775177297>',
            cruor: '<:cruor:1025085871772409937>',
            fumus: '<:fumus:1025086111262982237>',
            voke: '<:voke:1060164889848590487>',
            hammer: '<:hammer:1060164664266338344>',
            freedom: '<:freedom:1060164666103435384>',
        }
    }

    get channels(): Channels {
        if (process.env.ENVIRONMENT === 'DEVELOPMENT') {
            return {
                achievementsAndLogs: '1058275396208054402',
                botRoleLog: '1058275602060288101',
                naMock: '1057867192391192665',
                naTrial: '1057867192391192665',
                euMock: '1057867192391192664',
                euTrial: '1057867192391192664',
                mockResult: '1057867192391192666',
                trialResult: '1057867192391192666',
                mockInfo: '1068881120319504486',
            }
        }
        return {
            achievementsAndLogs: '1058373790289109092',
            botRoleLog: '1058373508314431528',
            naMock: '954775172609630218',
            naTrial: '954775172609630218',
            euMock: '765479967114919937',
            euTrial: '765479967114919937',
            mockResult: '702083377066410002',
            trialResult: '702083377066410002',
            mockInfo: '1068881120319504486',
        }
    }

    get messages(): Messages {
        if (process.env.ENVIRONMENT === 'DEVELOPMENT') {
            return {
                mockTrialReacts: '1068883458253922347',
            }
        }
        return {
            mockTrialReacts: '1068883458253922347',
        }
    }

    get guildId(): string {
        return process.env.ENVIRONMENT === 'DEVELOPMENT' ? '1057867190579253329' : '315710189762248705';
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
                kc80k: '<@&1156365536746274886>',
                kc90k: '<@&1179145482061230231>',
                ofThePraesul: '<@&1057867190650540082>',
                goldenPraesul: '<@&1057867190709256260>',
                trialee: '<@&1057867190596010033>',
                magicMT: '<@&1057867190625390618>',
                magicFree: '<@&1057867190625390615>',
                magicBase: '<@&1057867190625390616>',
                magicUmbra: '<@&1057867190625390617>',
                rangeMT: '<@&1057867190637953029>',
                rangeFree: '<@&1057867190637953025>',
                rangeBase: '<@&1057867190637953026>',
                rangeUmbra: '<@&1057867190637953028>',
                chinner: '<@&1057867190637953027>',
                meleeMT: '<@&1057867190625390614>',
                meleeFree: '<@&1057867190608597072>',
                meleeBase: '<@&1057867190625390612>',
                meleeUmbra: '<@&1057867190625390613>',
                mrMT: '<@&1057867190625390619>',
                mrHammer: '<@&1057867190625390621>',
                mrBase: '<@&1057867190625390620>',
                cdar: '<@&1057867190650540088>',
                trialTeam: '<@&1057867190650540089>',
                applicationTeam: '<@&1057867190684110884>',
                sevenMan: '<@&1057867190650540084>',
                trialeeTeacher: '<@&1057867190684110886>',
                pingNA: '<@&1057867190608597068>',
                pingNATrial: '<@&1057867190608597065>',
                pingEU: '<@&1057867190608597069>',
                pingEUTrial: '<@&1057867190608597066>',
                pingOffHour: '<@&1057867190608597067>',
                pingOffHourTrial: '<@&1057867190608597064>',
                vulner: '<@&1063738043997098006>',
                mockInfo: '<@&1063488766498578563>',
                nexAodFCMember: '<@&1057867190608597070>',
                totm: '<@&1057867190684110888>',
                lhfotm: '<@&1057867190684110887>',
                mvp: '<@&1121739029583511614>',
                necroMT: '<@&1142304685546537062>',
                necroBase: '<@&1142304996495470682>',
                necroHammer: '<@&1149840318053757032>',
                necroFree: '<@&1142305270765199450>',
                fourMan: '<@1226182671663763466>',
                fallenAngel: '<@&1243319612632727602>',
                nightmareOfNihils: '<@&1243319682669351003>',
                elementalist: '<@&1243319748314267648>',
                sageOfElements: '<@&1243319812428533893>',
                masterOfElements: '<@&1243319871618678784>',
                smokeDemon: '<@&1243319946176630805>',
                shadowCackler: '<@&1243320011389534209>',
                truebornVampyre: '<@&1243320074660614185>',
                glacyteOfLeng: '<@&1243320133968203857>',
                praetorianLibrarian: '<@&1243320189211377685>',
                coreRupted: '<@&1243337593882542222>',
                ollivandersSupplier: '<@&1243337779039965234>',
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
            kc80k: '<@&1156365536746274886>',
            kc90k: '<@&1179145482061230231>',
            ofThePraesul: '<@&474307399851835414>',
            goldenPraesul: '<@&589268459502960642>',
            trialee: '<@&666034554150322200>',
            magicMT: '<@&1063137065673429022>',
            magicFree: '<@&1063137532268781578>',
            magicBase: '<@&1063137403998589108>',
            magicUmbra: '<@&932006805528268912>',
            rangeMT: '<@&1063136067949178960>',
            rangeFree: '<@&1063136973042229358>',
            rangeBase: '<@&1063136409621377024>',
            rangeUmbra: '<@&934920570921967686>',
            chinner: '<@&1063136286325616730>',
            meleeMT: '<@&926622693908946974>',
            meleeFree: '<@&926623795475787807>',
            meleeBase: '<@&926623603150164008>',
            meleeUmbra: '<@&934920368441938012>',
            mrMT: '<@&1021475735128506421>',
            mrHammer: '<@&1021479839003312168>',
            mrBase: '<@&1021476019284213860>',
            cdar: '<@&814177068467224596>',
            trialTeam: '<@&469546608531472385>',
            trialTeamProbation: '<@&1074057253314908190>',
            applicationTeam: '<@&968901102911246377>',
            sevenMan: '<@&337723869508927489>',
            trialeeTeacher: '<@&664351536583016459>',
            pingNA: '<@&959522928247066664>',
            pingNATrial: '<@&1050233459274158193>',
            pingEU: '<@&959522492593098762>',
            pingEUTrial: '<@&1050262078147022908>',
            pingOffHour: '<@&959523032672641055>',
            pingOffHourTrial: '<@&1053836146104344587>',
            vulner: '<@&1063144624912351342>',
            mockInfo: '<@&1062976399280984114>',
            nexAodFCMember: '<@&644269097558867968>',
            totm: '<@&693668983064363069>',
            lhfotm: '<@&959566081368948816>',
            mvp: '<@&1121739029583511614>',
            necroMT: '<@&1142304685546537062>',
            necroBase: '<@&1142304996495470682>',
            necroHammer: '<@&1149840318053757032>',
            necroFree: '<@&1142305270765199450>',
            fourMan: '<@1226182671663763466>',
            fallenAngel: '<@&1243319612632727602>',
            nightmareOfNihils: '<@&1243319682669351003>',
            elementalist: '<@&1243319748314267648>',
            sageOfElements: '<@&1243319812428533893>',
            masterOfElements: '<@&1243319871618678784>',
            smokeDemon: '<@&1243319946176630805>',
            shadowCackler: '<@&1243320011389534209>',
            truebornVampyre: '<@&1243320074660614185>',
            glacyteOfLeng: '<@&1243320133968203857>',
            praetorianLibrarian: '<@&1243320189211377685>',
            coreRupted: '<@&1243337593882542222>',
            ollivandersSupplier: '<@&1243337779039965234>',
        }
    }

    get categories(): Categories {
        return {
            killCount: ['kc10k', 'kc20k', 'kc30k', 'kc40k', 'kc50k', 'kc60k', 'kc70k', 'kc80k', 'kc90k'],
            collectionLog: ['ofThePraesul', 'goldenPraesul'],            
            vanity: ['fallenAngel', 'nightmareOfNihils', 'elementalist', 'sageOfElements', 'masterOfElements', 'smokeDemon', 'shadowCackler', 'truebornVampyre', 'glacyteOfLeng', 'praetorianLibrarian', 'coreRupted', 'ollivandersSupplier'],
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
        } else if (this.categories.vanity.includes(role)) {            
            category = 'vanity';
        } else {
            category = ''
        }
        return category;
    }

    public categorizeChannel = (role: string) => {
        if (this.categories.killCount.includes(role) || this.categories.collectionLog.includes(role) || this.categories.vanity.includes(role)) {
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
            if (objects[i].value.includes(userId)) {
                return { obj: objects[i], index: i };
            }
        }
        return undefined;
    };

    public getEmptyObject(targetName: string, objects: APIEmbedField[]): { obj: APIEmbedField, index: number } | undefined {
        const index = objects.findIndex(obj => obj.name.includes(targetName) && obj.value === '`Empty`');
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

    public getTeamCount(players: APIEmbedField[]): number {
        let maxPlayers = 7;
        for (const player of players) {
            if (player.value === '`Empty`') {
                maxPlayers = maxPlayers - 1;
            }
        }
        return maxPlayers;
    }
}
