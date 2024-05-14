"use strict";
async function reply(interaction, message) {
    interaction.reply({ content: message, ephemeral: true, fetchReply: true }).then(msg => setTimeout(() => msg.delete(), 5000));
}
module.exports = { reply };
