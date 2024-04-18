import { AutoReply, ButtonResponse, ListResponse } from "../../../database/db/messageRespon.db.js";
import Client from "./Client.js";
import Serialize from "./Serialize.js";
import { Configuration, OpenAIApi } from "openai";
import { helpers } from "../../../../lib/index.js";

export default class Message extends Serialize {
	constructor(client, msg, session_name) {
		super();
		this.session = session_name;
		this.client = client;
		this.msg = msg.messages;
		this.type = msg.type;
	}

	async mainHandler() {
		try {
			if (!this.msg) return;
			const message = this.msg[0];
			if (message.key && message.key.remoteJid === "status@broadcast") return;
			if (!message.message) return;
			const m = await this.serial(this.client, message);

			const bot = new Client(this.client, m.from);
			const CMD = m.command ? m.command : null;
			if (!CMD) return this.messageHandler(m, bot);
		} catch (error) {
			console.log(error);
		}
	}

	randomItem(items) {
		return items[Math.floor(Math.random()*items.length)];
	}

	checkKeyword(items, word) {
		let found=0;
		items.forEach(item => {
			// console.log('item', item);
			if (new RegExp(`\\b${item}\\b`).test(word)) {
				console.log(`string found: ${item}`);
				// return true;
				found+=1;
			}
		});
		if(found > 0) {
			return true
		} else {
			return false;
		}
	}

	getRandomInt(max) {
		const result = Math.floor(Math.random() * max) * 1000;
		return result;
	}

	async messageHandler(m, bot) {
		const blacklist = ['ayat', 'agama','yesus','nabi','allah','tuhan','kitab','injil','taurat','zabur','quran','sabda','berfirman','islam','kristen','hindu','budha','kafir', 'partai', 'politik', 'pemilu'];
		const buttonResponse = new ButtonResponse();
		const listResponse = new ListResponse();
		const replyResponse = new AutoReply();

		const keywordReply = await replyResponse.checkMessageUser(m.botNumber, m.body);
		const keywordButton = await buttonResponse.checkKeyword(m.body, m.from);
		const keywordList = await listResponse.checkKeyword(m.body, m.from);
		await bot.readMessage(m.msg);
		await new Promise(resolve => setTimeout(resolve, this.getRandomInt(8)));
		if (keywordButton) {
			await bot.reply(keywordButton.response, m.msg);
			return await buttonResponse.deleteKeyword(keywordButton.msg_id, keywordButton.keyword);
		} else if (keywordList) {
			await bot.reply(keywordList.response, m.msg);
		} else if (keywordReply) {
			await bot.sendText(keywordReply.response);
		}
		if(m.body.includes('/draw gusmang pakai kostum loreng macan')) {
			// https://viralmu.sgp1.cdn.digitaloceanspaces.com/very/gusmang.jpeg
			const nameRandom = helpers.randomText(10);
			const imgUrl = 'https://viralmu.sgp1.cdn.digitaloceanspaces.com/very/gusmang.jpeg';
			var opts = { file: { name: nameRandom, mimetype: 'image/jpeg' } };
			return bot.sendMedia(imgUrl, 'gusmang pakai kostum loreng macan', opts);
		}
		const today = new Date().getHours();
		console.log('today', today);
		if(m.body.includes("/ask")) {
			if(today >= 19) {
				return bot.sendText(this.randomItem([
					'Kak, aku tidur dulu ya. Lanjut besok lagi ya 🙏🏻', 
					'Duh, aku mau tidur dulu Kak. Besok lanjut lagi ya 🙏🏻', 
					'Istirahat dulu ya Kak, besok kita kerja lagi 🙏🏻', 
					'Kak, aku mau istirahat sekarang. Lanjut besok aja 🙏🏻', 
					'Kak, aku mau tidur dulu biar fresh besok. Lanjut ya 🙏🏻', 
					'Dah capek Kak, aku mau tidur dulu. Besok kerja lagi 🙏🏻', 
					'Istirahat sebentar ya Kak, besok kita kerja lagi 🙏🏻', 
					'Sudah malam Kak, aku mau istirahat. Besok lanjut ya 🙏🏻', 
					'Kak, aku mau tidur dulu biar semangat besok. Kerja lagi besok ya 🙏🏻', 
					'Istirahat dulu ya Kak, besok kita lanjutkan lagi 🙏🏻', 
					'Aku capek Kak, mau tidur dulu. Besok lanjut lagi ya 🙏🏻'
					]));
			}
			if(today <= 5) {
				return bot.sendText('Kak, aku masih ngantuk. Lanjut nanti lagi ya 🙏🏻');
			}
			if (blacklist.some(word => m.body.toLowerCase().includes(word.toLowerCase()))) {
				return bot.sendText('Gak tau kak, takut salah 🙏');
			}
			if (this.checkKeyword(['pendiri ipaymu', 'founder ipaymu', 'ceo ipaymu','bikin ipaymu','buat ipaymu','investor ipaymu'], m.body.toLowerCase())) {
				return bot.sendText('iPaymu didirikan oleh Riyeke Ustadiyanto yang menjadi CEO sekarang.');
			} else if (this.checkKeyword(['doku', 'bayar', 'payment','payment gateway','ovo','pay','qris','transfer','ecommerce','ecomerce','online','rekening','saldo','topup','bank','midtrans','xendit','transaksi'], m.body.toLowerCase())) {
			return bot.sendText(this.randomItem([
				'Kak, aku tau temen aku https://iPaymu.com yang bisa menerima pembayaran online di website kakak, canggih deh. 🙏',
				'Btw kalo ngomongin pembayaran online bisa pake temen aku https://iPaymu.com aja kak!',
				'Tau bestie aku iPaymu.com kak?'
			]));
			}
			try {
				const configuration = new Configuration({
					apiKey: process.env.OPENAI_API_KEY,
				});
				const openai = new OpenAIApi(configuration);
				const prompt = (m.body.split("/ask")[1]).trim();
				if(prompt == '') {
					return bot.reply('Mau nanya apa sih?', m.msg);
				}
				const completion = await openai.createCompletion({
				  model: "text-davinci-003",
				  prompt: `Q: ${prompt}\nA:`,
				  max_tokens: 300,
				  temperature: 0,
				  top_p: 1.0
				});
				console.log('promt:', prompt);
				console.log('data:', completion.data.choices[0].text);
				console.log('===========================');

				if(blacklist.some(word => completion.data.choices[0].text.toLowerCase().includes(word.toLowerCase()))) {
					return bot.sendText('Gak tau kak, takut salah 🙏');
				}

				return bot.reply(completion.data.choices[0].text, m.msg);
			  } catch (error) {
				if (error.response) {
				  console.log(error.response.status);
				  console.log(error.response.data);
				} else {
				  console.log(error.message);
				}
				return bot.reply('Maaf ya, aku lagi sibuk. Tanya nanti lagi ya', m.msg);
			}
		} else if(m.body.includes("/draw")) {
			if(today >= 19) {
				return bot.sendText('Kak, aku tidur dulu ya. Lanjut besok lagi ya 🙏🏻');
			}
			if(today <= 5) {
				return bot.sendText('Kak, aku masih ngantuk. Lanjut nanti lagi ya 🙏🏻');
			}
			if (blacklist.some(word => m.body.toLowerCase().includes(word.toLowerCase()))) {
				return bot.sendText('Gak tau kak, takut salah 🙏');
			}
			try {
				const configuration = new Configuration({
					apiKey: process.env.OPENAI_API_KEY,
				});
				const openai = new OpenAIApi(configuration);
				const prompt = (m.body.split("/draw")[1]).trim();
				if(prompt == '') {
					return bot.reply('Mau minta gambar apa sih?', m.msg);
				}
				const response = await openai.createImage({
					prompt,
					n: 1,
					size: '512x512'
				});
				const nameRandom = helpers.randomText(10);
				console.log('data', response.data);
				const imgUrl = response.data.data[0].url;
				var opts = { file: { name: nameRandom, mimetype: 'image/png' } };
				return bot.sendMedia(imgUrl, prompt, opts);
			  } catch (error) {
				if (error.response) {
				  console.log(error.response.status);
				  console.log(error.response.data);
				} else {
				  console.log(error.message);
				}
				return bot.reply('Maaf ya, aku lagi sibuk. Tanya nanti lagi ya', m.msg);
			}
		} else if (this.checkKeyword(['very','ver','sivery'], m.body.toLowerCase())) {
			return bot.sendText('Kayak ada yang manggil2 aku? \nkalo nanya pake */ask* ya');
		} else if (blacklist.some(word => m.body.toLowerCase().includes(word.toLowerCase()))) {
			return bot.sendText('Gak tau kak, takut salah 🙏');
		} else if (this.checkKeyword(['pendiri ipaymu', 'founder ipaymu', 'ceo ipaymu','bikin ipaymu','buat ipaymu','investor ipaymu'], m.body.toLowerCase())) {
			return bot.sendText('iPaymu didirikan oleh Riyeke Ustadiyanto yang menjadi CEO sekarang.');
		} else if (this.checkKeyword(['doku', 'bayar', 'payment','payment gateway','ovo','dana','kartu kredit','qris','transfer','ecommerce','ecomerce','payment online','rekening','virtual account','saldo','topup','bank','midtrans','xendit','point of sale','transaksi','pugin woocommerce','shopping cart'], m.body.toLowerCase())) {
			return bot.sendText(this.randomItem([
				'Kak, aku tau temen aku https://iPaymu.com yang bisa menerima pembayaran online di website kakak, canggih deh. 🙏',
				'Btw kalo ngomongin pembayaran online bisa pake temen aku https://iPaymu.com aja kak!',
				'Tau bestie aku iPaymu.com kak?'
			]));
		} else if(this.checkKeyword(['parah','kacau','ruwet'], m.body.toLowerCase())) {
			const nameRandom = helpers.randomText(10);
			const imgUrl = this.randomItem([
				'https://viralmu.sgp1.cdn.digitaloceanspaces.com/very/haha.mp3', 
				'https://viralmu.sgp1.cdn.digitaloceanspaces.com/very/lucu.mp3', 
				'https://viralmu.sgp1.cdn.digitaloceanspaces.com/very/ngakak.mp3', 
			]);
			var opts = { file: { name: nameRandom, mimetype: 'audio/mpeg' } };
			return bot.sendMedia(imgUrl, 'Parah wkwkw', opts);
		} else if(this.checkKeyword(['suka','bahagia','seneng','hore','like','love','cinta'], m.body.toLowerCase())) {
			return bot.sentReaction(m.msg);
		} else if(this.checkKeyword(['hbd','happy birthday','bday','ultah','ulang tahun','panjang umur','serta mulia','otonan'], m.body.toLowerCase())) {
			const nameRandom = helpers.randomText(10);
			const imgUrl = 'https://viralmu.sgp1.cdn.digitaloceanspaces.com/very/Untitled.mp4';
			var opts = { file: { name: nameRandom, mimetype: 'video/mp4' } };
			return bot.sendMedia(imgUrl, 'Happy Birthday 🥳🥳', opts);
		} else if(this.checkKeyword(['halo','hello','hai'], m.body.toLowerCase())) {
			return bot.sendText('Ya aku disini kak, ada manggil aku? \nkalo nanya pake */ask* ya');
		} else if(this.checkKeyword(['syukur','untungnya','kebetulan','sukses','aman'], m.body.toLowerCase())) {
			return bot.sendText('Syukurlah ya kak... 🙏');
		} else if(this.checkKeyword(['semoga','amin','harap','setujui','terkabul','selamat'], m.body.toLowerCase())) {
			return bot.sendText('Aamiin 🙏');
		} else if(this.checkKeyword(['setuju','deal'], m.body.toLowerCase())) {
			return bot.sendText('Setuju aja deh 😬');
		} else if(this.checkKeyword(['oke','okay'], m.body.toLowerCase())) {
			return bot.sendText('Oke 👌');
		} else if(this.checkKeyword(['lucu', 'wkwk', 'haha', 'hehe', 'kocak', 'ngakak'], m.body.toLowerCase())) {
			return bot.sendText(this.randomItem([
				'Wkwkwk 😆',
				'Haha 🤣',
				'Gila 🤪',
				'Naik daun 🔥',
				'Lucu banget 😂',
				'Bikin ngakak deh 😆',
				'Konyol abis 🤣',
				'Kocak gila 😆',
				'Sumpah ngakak gue 😂',
				'Lucu bgt deh 🤣',
				'Membagongkan 😆',
				'Haha 😂',
				'Gokil 🤪',
				'Seru 🔥',
				'Lucu aja 😂',
				'Bikin ketawa 😆',
				'Konyol 😤',
				'Kocak 🤣',
				'Lutunyaaa 😂',
				'Kocak banget 🤣'
			]));
		} else if(this.checkKeyword(['meninggal', 'duka', 'wafat','korban jiwa'], m.body.toLowerCase())) {
			return bot.sendText('Turut Berdukacita ya 🙏');
		} else if(this.checkKeyword(['sedih', 'galau', 'bingung', 'semangat'], m.body.toLowerCase())) {
			return bot.sendText('Semangat kak 🦾');
		} else if(this.checkKeyword(['thanks', 'makasih', 'trims','sip','siap'], m.body.toLowerCase())) {
			return bot.sendText('Terima kasih kak 🙏');
		} else if(this.checkKeyword(['musibah','gempa', 'banjir', 'bencana','longsor','kecelakaan','tabrakan','kebakaran','kerusuhan','tawuran','badai','tsunami'], m.body.toLowerCase())) {
			return bot.sendText('Semoga semua selamat ya 🙏');
		} else if(this.checkKeyword(['keren', 'mantap', 'bagus','kece','joss','jozz','mantul','top','hebat'], m.body.toLowerCase())) {
			return bot.sendText(this.randomItem([
				'Wow keren bingits 😆',
				'Mantap jiwaa 🤣',
				'Gokilll🤪',
				'Naisss pisan',
				'Jozzz',
				'Cihuyy cuy',
				'Keren abis 😆',
				'Mantul 🤣',
				'Gila bgt 🤪',
				'Keren pisan 😎',
				'Hebat bgt',
				'Sangat cihuy',
				'Wow keren 😎',
				'Mantap jiwa 🤣',
				'Gokil abis 🤪',
				'Naik daun 😎',
				'Jozz gandozz',
				'Cihuy sekali 🔥',
				'Keren sekali 😆',
				'Mantap sekali 🤣'
			]));
		}
		
		if (m.body == "Bot") {
			return bot.reply(`Yes Sir..`, m.msg);
		} else if (m.body == "Test") {
			await bot.reply("Okee", m.msg);
		}
	}
}
