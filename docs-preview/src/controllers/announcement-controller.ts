/* eslint-disable @typescript-eslint/no-var-requires */
import { window, workspace } from 'vscode';
import { output } from '../helper/common';
import { codeSnippets, tripleColonCodeSnippets } from '../markdown-extensions/codesnippet';
import { column_end, columnEndOptions, columnOptions } from '../markdown-extensions/column';
import { container_plugin } from '../markdown-extensions/container';
import { div_plugin, divOptions } from '../markdown-extensions/div';
import { image_end, imageOptions } from '../markdown-extensions/image';
import { include } from '../markdown-extensions/includes';
import { rowEndOptions, rowOptions } from '../markdown-extensions/row';
import { videoOptions, legacyVideoOptions } from '../markdown-extensions/video';
import { basename, join } from 'path';
import { xref } from '../markdown-extensions/xref';

// removed values for intial check-in
const defaultEmailAddressSetting: string = 'preview.defaultEmailAddress';
let emailAddress: any;
let emailSubject: string;
let emailTo: string;
let authUser: string;
let password: string;
let emailBody: string;

export function announcementCommand() {
	const commands = [{ command: sendAnnouncement.name, callback: sendAnnouncement }];
	return commands;
}

function sendAnnouncement() {
	let filePath = '';
	const editor = window.activeTextEditor;
	if (editor) {
		filePath = editor.document.fileName;
	}
	const workingPath = filePath.replace(basename(filePath), '');
	const announcementContent = window.activeTextEditor?.document.getText();
	const titleRegex = /^(#{1})[\s](.*)[\r]?[\n]/gm;
	const title = announcementContent.match(titleRegex);
	emailSubject = title.toString().replace('# ', '');

	const MarkdownIt = require('markdown-it');
	const md = new MarkdownIt();
	md.use(include, { root: workingPath })
		.use(codeSnippets, { root: workingPath })
		.use(tripleColonCodeSnippets, { root: workingPath })
		.use(xref)
		.use(column_end)
		.use(container_plugin, 'row', rowOptions)
		.use(container_plugin, 'row-end', rowEndOptions)
		.use(container_plugin, 'column', columnOptions)
		.use(container_plugin, 'column-end', columnEndOptions)
		.use(div_plugin, 'div', divOptions)
		.use(container_plugin, 'image', imageOptions)
		.use(image_end)
		.use(container_plugin, 'video', videoOptions)
		.use(container_plugin, 'legacyVideo', legacyVideoOptions)
		.use(require('markdown-it-front-matter'), function (fm) {
			// remove yaml header from mail
		});
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
			user: '',
			pass: password
		}
	});

	// setup e-mail data, even with unicode symbols
	const mailOptions = {
		from: '', // sender address (who sends)
		to: '', // list of receivers (who receives)
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
	const defaultEmailAddress = workspace.getConfiguration().get(defaultEmailAddressSetting);
	if (defaultEmailAddress) {
		emailAddress = defaultEmailAddress;
	} else {
		const getEmailAddress = window.showInputBox({
			prompt: 'Enter your Microsoft email address i.e. someone@microsoft.com'
		});
		getEmailAddress.then(val => {
			if (!val) {
				return;
			} else {
				emailAddress = val;
				// sendMail();
			}
		});
	}
	const userPassword = window.showInputBox({
		password: true,
		prompt: 'Enter your password'
	});
	userPassword.then(val => {
		if (!val) {
			return;
		} else {
			password = val;
			sendMail();
		}
	});
}
