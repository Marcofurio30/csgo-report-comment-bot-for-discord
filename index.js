require('dotenv').config()
const fs = require('fs');
const Discord = require('discord.js')
var SSH = require('simple-ssh');
var request = require('request');
const writeToFile = require("write-to-file");
var readFile = require("read-file");
var csgo = require("csgo")
const editJsonFile = require("edit-json-file");
var config = require('config.json')('./discord_config.json');
const { Client, Attachment } = require('discord.js');
const client = new Discord.Client()
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
  client.user.setActivity("bannir des fdp de cheater", { type: "PLAYING"})
})

var ssh = new SSH({
    host: (config.ssh.host), //discord_config.json
    user: (config.ssh.user), //discord_config.json
    pass: (config.ssh.pass) //discord_config.json
});

client.on('message', msg => {
	const prefix = "!";
	const args = msg.content.split(/ +/g);
	const cmd = args.shift().toLowerCase();


	
  if (cmd === '!report') { //Commande report
	  let [id, nreport, matchid] = args;

	  if (matchid != undefined) {
		if(/^\d+$/.test(matchid)) {
			console.log(matchid);
}
	else {
		if (matchid.includes("steam")) {
			//var sharecoderesult = matchid
			var n = matchid.lastIndexOf('%20');
			matchid = matchid.substring(n + 3);
			var decoder = Object.values(new csgo.SharecodeDecoder(`${matchid}`).decode());
			matchid = decoder[0];
		}
		else {
		var decoder = Object.values(new csgo.SharecodeDecoder(`${matchid}`).decode());
		matchid = decoder[0];
		}
	}
	  }
		if (matchid === undefined) {
			matchid ="";
		}

		if (id.length != 17 || nreport === undefined) { //Mauvais steamid
		msg.author.send("Utilisation incorrecte: !report STEAMID64 nombre_de_report");
	}
	else {
	  
	msg.channel.send({embed: {
	color: 3447003,
	description: `Envoie de ${ nreport} reports pour ${id} - MatchID: ${matchid}` //Message d'envoi
			}});

	ssh.exec(`cd /var/reportbot/test && node sirystesrbot.js  ${id} ${ nreport} ${matchid}`, { //Commande ssh
    out: function(stdout) {
        console.log(stdout);
		if(stdout.includes('Successfully')){ // Message succes
		msg.channel.send({embed: {
	color: 3066993,
	description: (stdout)
			}});
			ssh.reset();
					const attachment = new Attachment(`${id}.txt`);
					msg.author.send(`Voici le log des report`, attachment);
}
		if(stdout.includes('Failed')){ //message error
		msg.channel.send({embed: {
	color: 15158332,
	description: (stdout)
			}});
			ssh.reset();
}
	else {
		ssh.reset();
	}
    }
	
}).start();


	}
  }
  
  if (cmd === '!steamid'){ //comande pour avoir le steamid64
	
	let [url] = args;
	if (url === undefined) {
		msg.author.send("Utilisation incorrecte: !steamid url_du_profil");
	}
	else {
	msg.delete(1000);
	msg.channel.send({embed: {
	color: 3447003,
	title: "Steam ID Finder",
	description: `Recherche du profil : ${url}`,
		fields: [{
      
        name: "Lien vers le SteamID",
        value: `[Lien](https://steamid.xyz/${url})`
      },
    ],
			}});
	}
  }
  
  if (cmd === '!commend') {
	  let [target, servid, ncommend, pseudo, passw, shareds] = args;
	  if (pseudo === undefined || passw === undefined) {
		  pseudo = "";
		  passw = "";
	  }
	  if (shareds === undefined) {
		  shareds = "";
	  }
	  if (target === undefined || servid === undefined || ncommend === undefined) {
		  console.log(target);
		  console.log(servid);
		  console.log(ncommend);
		msg.author.send("Utilisation incorrecte: !commend url_du_profil ip_du_serveur nombre_de_commend (optionnel: username password SharedSecret)");
	}
	else {
		
	msg.delete(1000);
	msg.client.channels.get('607982128675815486').send({embed: {
	color: 3447003,
	title: "CommendBot",
	description: `Envoie de ${ncommend} recommandation à ${target} sur ${servid}`
			}});
	
			
var read = require('read-file');
"use strict";
  let [path] = args;
  path = "/var/commendbot"
let file = editJsonFile(`${path}/config.json`);

file.set("commend.friendly", `${ncommend}`);
file.set("commend.teaching", `${ncommend}`);
file.set("commend.leader", `${ncommend}`);
file.set("account.username", `${pseudo}`);
file.set("account.password", `${passw}`);
file.set("account.sharedSecret", `${shareds}`);
file.set("method", "SERVER");
file.set("target", `${target}`);
file.set("serverID", `${servid}`);
file.set("matchID", "0");
file.set("perChunk", "5");
file.set("betweenChunks", "300000");
file.set("cooldown", "28800000");
file.set("steamWebAPIKey", `${config.SteamAPIKey}`);
file.save();

		ssh.exec(`cd /var/commendbot && node commend.js`, { //Commande ssh
    out: function(stdout) {
        console.log(stdout);
		if(stdout.includes('Nombre de recommandation envoyé:')){ // Message succes
		msg.channel.send({embed: {
	color: 3066993,
	description: (stdout)
			}});
			ssh.reset();

}
		if(stdout.includes('Nombre de recommandation non envoyé:')){ //message error
		msg.channel.send({embed: {
	color: 15158332,
	description: (stdout)
			}});
			ssh.reset();
}
    }
}).start();

	}
  }
  
  if (cmd === '!check') {
	  let [ids] = args;
	  request(`https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${config.SteamAPIKey}&steamids=${ids}`, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    if (body.includes('NumberOfGameBans\":1' ||'NumberOfGameBans\":2' || 'NumberOfGameBans\":3' && 'DaysSinceLastBan":0' || 'DaysSinceLastBan":1' || 'DaysSinceLastBan":2')) {
				msg.channel.send({embed: {
				color: 3066993,
				description: `:tada: [${ids}](https://steamcommunity.com/profiles/${ids}) est banni!`
		  }});
      } else {
		  		msg.channel.send({embed: {
				color: 15158332,
				description: `${ids} n'est pas banni`
		  }});
    }

  }
});

// suppress the direct output of the call. you can expand the result below
"Checking ban..."
  }
  
})

client.login(process.env.BOT_TOKEN)