'use strict';
const { exec } = require('child_process');
const fs = require('fs');
const cheerio = require('cheerio');
const Discord = require('discord.js');
const client = new Discord.Client();

function latex (statement, callback) {
  // prepare the statement
  statement = '\\documentclass{article} \\begin{document} \\pagenumbering{gobble}' + statement + '\\end{document}';
  exec('python latex.py ' + '"' + statement + '"', (err, stdout, stderr) => {
    if (err) return callback(err, false);
    if (stderr) throw callback(stderr, false);
    if (stdout === 'done') {
      return callback(null, true);
    }
    return callback(null, false);
  });
}

function jbmo (year, problem, callback) {
  // load the html
  fs.readFile('Junior Balkan MO.html', 'utf8', (err, data) => {
    if (err) {
      throw err;
    }
    var $ = cheerio.load(data);
    const lYear = 2019;
    $('.cmty-category-cell-bottom').each((y, b) => { // year, box
      if (lYear - y == year) {
        $(b).find('.cmty-view-posts-item').each((i, e) => { // index, element
          // match problem number
          var number;
          $(e).find('.cmty-view-post-item-label').each((j, f) => { // (i, e) incremented one letter
            if ($(f).text() == problem) { // implicit casting here
              number = j;
            }
          });
          $(e).find('.cmty-view-post-item-text').each((j, f) => {
            if (j === number) {
              // get rid of the spans
              $(f).find('span').each((k, g) => { // (j, f) incremented one letter
                $(g).replaceWith($(g).find('img'));
              });
              // replace image with alt text
              $(f).find('img').each((k, g) => {
                $(g).replaceWith($(g).attr('alt'));
              });
              // replace line breaks
              $(f).find('br').each((k, g) => {
                $(g).replaceWith('');
              });
              return callback(null, $(f).html().replace(/\s+/g, ' ').trim());
            }
          });
        });
        return false;
      }
    });
  });
}

client.on('ready', () => {
  console.log('bot is ready');
});

client.on('message', (message) => {
  if (message.author.bot) return false;
  var prefix = message.content.split(' ')[0];
  var args = message.content.split(' ').slice(1,);
  if (prefix !== '+') return false;
  // implicit casting below
  if (args[0].toLowerCase() === 'jbmo' && args.length >= 3) {
    if (args[1].toLowerCase() === 'r') {
      args[1] = 1997 + Math.floor(Math.random() * (2019 - 1997 + 1));
    }
    if (args[2].toLowerCase() === 'r') {
      args[2] = Math.floor(Math.random() * 4 + 1);
    }
    if (1997 <= args[1] && args[1] <= 2019 && 1 <= args[2] && args[2] <= 4) {
      jbmo(args[1], args[2], (err, statement) => {
        if (err) {
          console.log(err);
          return false;
        }
        latex(statement, (err, status) => {
          if (err) {
            console.log(err);
            return false;
          }
          if (status) {
            message.channel.send('JBMO ' + args[1] + ' problem ' + args[2] + '.');
            message.channel.send({
              files: ['out.png']
            });
          }
        });
      });
    }
  }
});

fs.readFile('settings.json', (err, data) => {
  if (err) throw err;
  const token = JSON.parse(data)['token'];
  client.login(token);
});
