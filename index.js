'use strict';
const fs = require('fs');
const cheerio = require('cheerio');

function jbmo(year, problem, callback) {
  // load the html
  fs.readFile('Junior Balkan MO.html', 'utf8', (err, data) => {
    if (err) {
      throw err;
    }
    var $ = cheerio.load(data);
    const lYear = 2019;
    $('.cmty-category-cell-bottom').each((y, b) => { // year, box
      if (lYear - y === year) {
        console.log(year);
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

jbmo(2015, 4, (err, latex) => {
  console.log(latex);
});
