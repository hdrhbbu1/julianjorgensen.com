let express = require('express');
let router = express.Router();
let app = require('../server');
let crypto = require('crypto');

let nodemailer = require('nodemailer');
let mg = require('nodemailer-mailgun-transport');
let pug = require('pug');

// This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
let auth = {
  auth: {
    api_key: 'key-06c8cc25bbde08805918b4e42dcad22f',
    domain: 'mailer.julianjorgensen.com'
  }
}

let nodemailerMailgun = nodemailer.createTransport(mg(auth));


// Invoice reminder email
// let subject = 'Your project';
// let contextObject = {
//   schemaAction: 'AskAction', //http://schema.org/
//   emailSummary: 'Project discovery',
//   alertText: 'Invoice is overdue',
//   name: 'Julian',
//   text: 'I\'m super excited to hear more about your project. In the meantime please fill out this questionaire about your project. This will result in a more thorough quote.',
//   ctaColor: 'warning',
//   ctaText: 'Enter project details',
//   ctaLink: 'https://goo.gl/forms/i8TwGVYpMkrrk5hj2',
//   ctaDisclaimer: '(Takes about 5-10 minutes)'
// };


// Send the invoice
// ===================
router.route('/invoice')
  .post(function (req, res) {
    let payload = JSON.stringify(req.body);
    let signature = req.get('intuit-signature');

    // if signature is empty return 401
		if (!signature) {
			return res.status(401).send('FORBIDDEN');
		}

    // if payload is empty, don't do anything
		if (!payload) {
			return res.status(200).send('success');
		}

		// validate signature
    var hash = crypto.createHmac('sha256', process.env.QBO_WEBHOOK_TOKEN).update(payload).digest('base64');
  	if (signature === hash) {
      console.log('\n\n\n\n\n\n\nQuickBooks');
      console.log(payload);
      console.log('\n\n\n\n\n\n\n');
      console.log(payload.eventNotifications[0].dataChangeEvent);

      let invoiceId = payload.eventNotifications[0].dataChangeEvent.entities[0].id;
      let invoiceToken = crypto.createHash('md5').update(payload.eventNotifications[0].dataChangeEvent.entities[0].lastUpdated).digest('hex');

      // SEND INVOICE EMAIL
      let contextObject = {
        invoiceId,
        invoiceToken,
      };

      let mailOptions = {
        from: {name: 'Julian Jorgensen', address: 'me@julianjorgensen.com'},
        to: [{name:'Namza', address:'me@julianjorgensen.com'}], // An array if you have multiple recipients.
        subject: 'Invoice #' + invoiceId,
        template: {
          name: './emails/invoice.pug',
          engine: 'pug',
          context: contextObject
        }
      };

      sendMail(mailOptions);
      return res.status(200).send('success');
  	}else{
      return res.status(401).send('FORBIDDEN');
    }
  });

// Send the get a quote email to prospect client
// ===================
router.route('/get-a-estimate')
  .post(function (req, res) {
    let {email, projectName, name} = req.body;

    let contextObject = {
      schemaAction: 'AskAction', //http://schema.org/
      emailSummary: 'Project discovery',
      name: name.split(' ')[0],
      projectName: projectName,
    };

    let mailOptions = {
      from: {name: 'Julian Jorgensen', address: 'me@julianjorgensen.com'},
      to: [{name:name, address:email}], // An array if you have multiple recipients.
      subject: 'Your project',
      template: {
        name: './emails/estimate.pug',
        engine: 'pug',
        context: contextObject
      }
    };

    sendMail(mailOptions);
    res.status(200).send('success');
  });

function sendMail(mailOptions){
  nodemailerMailgun.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log('Error: ' + err);
    }
    else {
      console.log('Response: ' + info);
    }
  });
}

module.exports = router;