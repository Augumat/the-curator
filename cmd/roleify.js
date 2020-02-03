module.exports = (msg, args) => {
  console.log(JSON.stringify(args));

  // Check that the target user exists
  if (msg.guild.members.find(x => `<@!${x.user.id}>` === args[0])
   && !(msg.guild.roles.find(x => x.name === (args[2] || 'new role')))
  ) {
    // Create the new vanity role with the specified name and color
    msg.guild.createRole({
      name: args[2] || 'new role',
      color: args[1] || [1,2,3],
      hoist: false,
      position: 0,
      permissions: 0,
      mentionable: true
    }, `Executing roleify command from ${msg.author.tag} (${msg.author.id})`)
    // Assign the role to the intended recipient
    .then(role => {
      msg.guild.members
        .find(x => `<@!${x.user.id}>` === args[0])
        .addRole(role, `Added ${role.name} via the roleify command`);
      return role;
    })
    // Update to the console and chat
    .then(role => {
      console.log(`Executing roleify command for ${role.name} from ${msg.author.tag} (${msg.author.id})`);
      msg.reply(`Executing roleify command for ${role.name} from ${msg.author.tag} (${msg.author.id})`);
    })
    // Handle any errors that are caused
    .catch(console.error);
  } else {
    //TODO descriptive error
    console.log('roleify failed');
  }
}
