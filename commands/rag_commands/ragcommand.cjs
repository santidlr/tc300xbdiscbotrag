const { SlashCommandBuilder } = require('discord.js');

async function loadRagUsage() {
  const { default: ragUsage } = await import('../../ragimplementation.js');
  return ragUsage;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ragquestion')
    .setDescription('Provides information using RAG.')
    .addStringOption(option =>
      option.setName('input')
        .setDescription('The input to give to the RAG')
        .setRequired(true)),
  async execute(interaction) {
    try {
	  await interaction.deferReply();
      const userInput = interaction.options.getString('input');
      const ragUsage = await loadRagUsage();
      const ragResult = await ragUsage(userInput);
	  await interaction.editReply(`${ragResult.text}`);
    //   await interaction.reply(`${ragResult.text}`);
	//   await interaction.reply('There was an error processing your request.');
    } catch (error) {
      console.error('Error executing ragquestion command:', error);
      await interaction.reply('There was an error processing your request.');
    }
  },
};
