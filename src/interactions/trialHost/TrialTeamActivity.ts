import BotInteraction from '../../types/BotInteraction';
import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { TrialParticipation } from '../../entity/TrialParticipation';

export default class TrialLeaderboard extends BotInteraction {
    get name() {
        return 'trial-team-activity';
    }

    get description() {
        return 'Shows Trial Team Members who didn\'t attend a trial since a given date';
    }

    get permissions() {
        return 'TRIAL_HOST';
    }

    get slashData() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) => option.setName('time').setDescription('Time since last trial. Must be in the format YYYY-MM-DD HH:MM in Gametime. e.g. 2022-11-05 06:00').setRequired(false));
    }

    public parseTime = (timeString: string): Date => {
        const [date, time] = timeString.split(' ');
        const [year, month, day] = date.split('-').map(Number);
        const [hours, minutes] = time.split(':').map(Number);
        return new Date(Date.UTC(year, month - 1, day, hours, minutes));
    }

    async run(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: false });
        const { dataSource } = this.client;
        const { roles, colours, stripRole } = this.client.util;
        const time: string | null = interaction.options.getString('time', false);

        // By default check for older than 4 weeks
        const timestamp: number = Date.now() - 2419200000;        
        let date: Date = new Date(timestamp);
        if (time != null){
            date = this.parseTime(time);
        }        
        
        // Get all trial team members who haven't attended a trial since the date
        const trialParticipants = await dataSource.createQueryBuilder()
            .select('trialParticipation.participant', 'user')            
            .addSelect('COUNT(*)', 'count')
            .addSelect('MAX(trialParticipation.createdAt)', 'lastTrial')
            .from(TrialParticipation, 'trialParticipation')
            .groupBy('trialParticipation.participant')
            .having(`MAX(trialParticipation.createdAt) < :date`, {date})
            .orderBy('lastTrial', 'ASC')
            .getRawMany();
        
        let nameList: any[] = [];
        let dateList: any[] = [];
        let countList: any[] = [];
        
        if (trialParticipants.length > 0){
            for (const trialParticipant of trialParticipants){
                const user = await interaction.guild?.members.fetch(trialParticipant.user);
                const userRoles = await user?.roles.cache.map(role => role.id) || [];
                
                // Don't list if user has no longer Trial Team or Trial Team - Probation
                if (userRoles?.includes(stripRole(roles.trialTeam)) || userRoles?.includes(stripRole(roles.trialTeamProbation)) || userRoles?.includes(stripRole(roles.trialHost))){
                    nameList.push(`⬥ <@${trialParticipant.user}>`);
                    dateList.push(trialParticipant.lastTrial);
                    countList.push(trialParticipant.count);
                }
            }            
        }        

        const embed = new EmbedBuilder()
            .setTimestamp()
            .setTitle('Trial Team Inactivity List')
            .setColor(colours.gold)
            .setDescription(`The following members haven't attented a trial since <t:${Math.round(date.getTime() / 1000)}:f>:`);
        
        if (nameList.length > 0){
            for (let i = 0; i < Math.floor(nameList.length / 10) + 1; i++) {
                embed.addFields( 
                    { name: 'Member', value: nameList.slice(10 * i, (10 * i) + 10).join(`\n`), inline: true } ,
                    { name: 'Last Trial', value: dateList.slice(10 * i, (10 * i) + 10).join(`\n`), inline: true } ,
                    { name: 'Total Trials', value: countList.slice(10 * i, (10 * i) + 10).join(`\n`), inline: true }                    
                );
            }
        }

        await interaction.editReply({ embeds: [embed] });
    }
}
