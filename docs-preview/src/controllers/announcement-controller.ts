/* eslint-disable @typescript-eslint/no-var-requires */
import { window } from 'vscode';
import { output } from '../helper/common';

// removed values for intial check-in
const emailSubject: string = 'Announcement';
let emailTo: string;
let authUser: string;
let authPassword: string;
let emailBody: string;

export function announcementCommand() {
	const commands = [{ command: sendAnnouncement.name, callback: sendAnnouncement }];
	return commands;
}

function sendAnnouncement() {
	const announcementContent = window.activeTextEditor?.document.getText();
	const MarkdownIt = require('markdown-it');
	const md = new MarkdownIt();
	try {
		emailBody = md.render(announcementContent); // store html as emailBody
		getCredentials(); // prompt user for password
	} catch (error) {
		output.appendLine(error);
	}
}

function sendMail() {
	const nodemailer = require('nodemailer');

	const transporter = nodemailer.createTransport({
		host: 'smtp-mail.outlook.com', // hostname
		secureConnection: false, // TLS requires secureConnection to be false
		port: 587, // port for secure SMTP
		tls: {
			ciphers: 'SSLv3'
		},
		auth: {
			user: authUser,
			pass: authPassword
		}
	});

	// setup e-mail data, even with unicode symbols
	const mailOptions = {
		from: authUser, // sender address (who sends)
		to: emailTo, // list of receivers (who receives)
		subject: emailSubject, // Subject line
		html: emailBody // html body
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, function (error: any, info: any) {
		if (error) {
			return output.appendLine(error);
		}
		output.appendLine(`Message sent: ${info.response}`);
	});
}

function getCredentials() {
	const userPassword = window.showInputBox({
		password: true,
		prompt: 'Enter your password'
	});
	userPassword.then(val => {
		if (!val) {
			return;
		} else {
			authPassword = val;
			sendMail();
		}
	});
}
